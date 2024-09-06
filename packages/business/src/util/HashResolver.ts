import {S3Manager} from 'core/src/aws';
import MD5 from 'crypto-js/md5';
import {databaseTypes, fileIngestionTypes, hashTypes, webTypes} from 'types';

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
  status: hashTypes.Status;
  workspaceId: string;
  projectId: string;
  basePath: string;
  s3: S3Manager;
  strategies: Map<number, hashTypes.IHashStrategy> = new Map();

  public register(strategy: hashTypes.IHashStrategy) {
    this.strategies.set(strategy.version, strategy);
  }

  public get(version: number): hashTypes.IHashStrategy | undefined {
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
    this.status = hashTypes.Status.PENDING;
    // register hash strategies
    this.register(new LatestHashStrategy());
    this.register(new HashStrategyV2());
  }

  /**
   *
   * @param project
   * @returns
   */
  public async resolve(req: hashTypes.ResolveReq): Promise<hashTypes.IResolution[]> {
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
        const presence: hashTypes.IDataPresence[] = await Promise.all(
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
export class LatestHashStrategy implements hashTypes.IHashStrategy {
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
export class HashStrategyV2 implements hashTypes.IHashStrategy {
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
