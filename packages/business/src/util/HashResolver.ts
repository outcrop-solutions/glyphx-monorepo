import {S3Manager} from 'core/src/aws';
import MD5 from 'crypto-js/md5';
import {databaseTypes, fileIngestionTypes, webTypes} from 'types';

export interface HashStrategy {
  // Must be globally unique to each instance of HashResolver
  version: number;
  /**
   * Performs project.files (fileSystem) hashing operation
   * Changes if fileStat.fileName | column.name | column.fieldType changes
   * Checks project.files against project.files
   * called within hashPayload(hashFiles(), project)
   * used within isFilterWritableSelector by it's lonesome to check against IState.fileSystemHash
   * @param files
   * @returns
   */
  hashFiles: (files: fileIngestionTypes.IFileStats[]) => string;
  /**
   * Performs payload hashing operation
   * This is used to:
   * - download the models in ModelFooter.tsx via the correct data file urls
   * - create or download model in handleApply in Properties.tsx
   * - create or download model in useProject.tsx if not currently loaded (this doesn't look right)
   * - doesStateExistsSelector (determines if state exists in the current recoil project atom, via state.payloadHash comparison)
   * @param fileHash
   * @param project
   * @returns
   */
  hashPayload: (fileHash: string, project: databaseTypes.IProject) => string;
}

interface DataPresence {
  exists: boolean;
  path: string;
}

interface Resolution {
  presence: DataPresence[];
  version: number;
  fileHash: string;
  payloadHash: string;
}

enum Status {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  INCOMPLETE = 'INCOMPLETE',
}

type ResolveReq = ProjectReq | StateReq;

interface ProjectReq {
  type: 'project';
  project: databaseTypes.IProject;
}

interface StateReq {
  type: 'state';
  state: databaseTypes.IState;
}

// Safe stringification function
function safeStringify(value: any): string {
  if (value === undefined) return '';
  if (typeof value === 'object') {
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(safeStringify).join(',');
    return JSON.stringify(value);
  }
  return String(value);
}

export class HashResolver {
  exts = ['sgc', 'sgn', 'sdt'];
  status: Status;
  workspaceId: string;
  projectId: string;
  basePath: string;

  private s3: S3Manager;
  private strategies: Map<number, HashStrategy> = new Map();

  public register(strategy: HashStrategy) {
    this.strategies.set(strategy.version, strategy);
  }

  public get(version: number): HashStrategy | undefined {
    return this.strategies.get(version);
  }

  public latestVersion(): number {
    return Math.max(...this.strategies.keys());
  }

  // we inject the file manager for flexibility and ease of testing
  constructor(workspaceId: string, projectId: string, s3: S3Manager) {
    this.s3 = s3;
    this.workspaceId = workspaceId;
    this.projectId = projectId;
    this.basePath = `client/${workspaceId}/${projectId}/output`;
    this.status = Status.PENDING;
    // register hash strategies
    this.register(new LatestHashStrategy());
    this.register(new HashStrategyV2());
  }

  /**
   *
   * @param project
   * @returns
   */
  public async resolve(req: ResolveReq): Promise<Resolution[]> {
    const versions = Array.from(this.strategies.keys()).sort().reverse();
    // concurrently check the project against each strategy
    return await Promise.all(
      versions.map(async (version) => {
        const strategy = this.get(version);
        if (!strategy) {
          throw new Error(`No strategy found - version:${version}.`);
        }

        // get hash for a given request + strategy
        let fh, ph;
        if (req.type === 'state') {
          ph = req.state.payloadHash;
        } else {
          fh = strategy.hashFiles(req.project.files);
          ph = strategy.hashPayload(fh, req.project);
        }

        // build file paths
        const filePaths = this.exts.map((e) => `${this.basePath}/${ph}.${e}`);

        // concurrently check existence for a given strategy
        const presence: DataPresence[] = await Promise.all(
          filePaths.map(async (path) => {
            return {exists: await this.s3.fileExists(path), path};
          })
        );

        // TODO: check integrity of state payloadHash vs presence

        // return Resolution object
        return {presence, version, fileHash: fh, payloadHash: ph};
      })
    );
  }
}

// Safe stringify added
class LatestHashStrategy implements HashStrategy {
  version = 3;
  hashFiles(files: fileIngestionTypes.IFileStats[]): string {
    return '';
  }
  hashPayload(fileHash: string, project: databaseTypes.IProject): string {
    const relevantProps = ['X', 'Y', 'Z', 'A', 'B', 'C'];
    const relevantKeys = ['key', 'dataType', 'interpolation', 'direction', 'filter', 'accumulatorType', 'dateGrouping'];
    const propRetvals = [] as string[];

    for (const propKey of relevantProps) {
      const prop = project.state.properties[propKey];

      const sortedProp = Object.keys(prop)
        .sort()
        .reduce((acc, key) => {
          acc[key] = prop[key];
          return acc;
        }, {} as any);

      const keyRetvals = [] as string[];
      const dataType = sortedProp.dataType;

      for (const key of relevantKeys) {
        if (key === 'filter' && dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER) {
          keyRetvals.push(safeStringify((sortedProp[key] as webTypes.INumbericFilter)?.min ?? ''));
          keyRetvals.push(safeStringify((sortedProp[key] as webTypes.INumbericFilter)?.max ?? ''));
        } else if (
          key === 'filter' &&
          dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING &&
          sortedProp[key] &&
          (sortedProp[key] as webTypes.IStringFilter)?.keywords?.length > 0
        ) {
          for (const word of (sortedProp.filter as webTypes.IStringFilter)?.keywords) {
            keyRetvals.push(safeStringify(word));
          }
        } else {
          keyRetvals.push(safeStringify(sortedProp[key]));
        }
      }
      propRetvals.push(keyRetvals.join(''));
    }

    if (project.id) {
      propRetvals.push(project.id);
    }

    const stateHash = MD5(propRetvals.join('')).toString();
    const payloadHash = MD5(`<span class="math-inline">\{fileHash\}</span>{stateHash}`).toString();
    return payloadHash;
  }
}

// No safe stringify!
class HashStrategyV2 implements HashStrategy {
  version = 2;
  hashFiles(fileStats: fileIngestionTypes.IFileStats[]): string {
    // moved here from createState action in order to avoid discrepancy
    const fileHashes = fileStats.map(
      ({fileName, columns}: {fileName: string; columns: fileIngestionTypes.IColumn[]}) => {
        const columnHashes = columns.map(({name, fieldType}) => `${name}${fieldType}`).join('');
        const formattedColHashInput = columnHashes;
        return MD5(`${fileName}${formattedColHashInput}`).toString();
      }
    );
    // Combine all the individual file hashes into a single hash
    const combinedHash = MD5(fileHashes.join('')).toString();
    return combinedHash;
  }
  hashPayload(fileHash: string, project: databaseTypes.IProject): string {
    const relevantProps = ['X', 'Y', 'Z', 'A', 'B', 'C'];
    const relevantKeys = ['key', 'dataType', 'interpolation', 'direction', 'filter', 'accumulatorType', 'dateGrouping'];
    const propRetvals = [] as string[];

    for (const propKey of relevantProps) {
      const prop = project.state.properties[propKey];
      const keyRetvals = [] as string[];
      const dataType = prop.dataType;
      for (const key of relevantKeys) {
        if (key === 'filter' && dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER) {
          keyRetvals.push(String((prop[key] as webTypes.INumbericFilter).min) ?? '');
          keyRetvals.push(String((prop[key] as webTypes.INumbericFilter).max) ?? '');
        } else if (
          key === 'filter' &&
          dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING &&
          // @ts-ignore
          prop[key] &&
          // @ts-ignore
          (prop[key] as webTypes.IStringFilter)?.keywords?.length > 0
        ) {
          for (const word of (prop.filter as webTypes.IStringFilter)?.keywords) {
            keyRetvals.push(String(word));
          }
        } else {
          // @ts-ignore [Object object] 'undefined'
          keyRetvals.push(String(prop[key]));
        }
      }
      propRetvals.push(keyRetvals.join(''));
    }

    if (project.id) {
      propRetvals.push(project.id);
    }

    const stateHash = MD5(propRetvals.join('')).toString();
    const payloadHash = MD5(`${fileHash}${stateHash}`).toString();
    return payloadHash;
  }
}
