// @ts-ignore
import {S3Manager} from 'core/src/aws';
import MD5 from 'crypto-js/md5';
import {projectService} from 'services';
import {StateService} from 'services/state';
import {databaseTypes, fileIngestionTypes, webTypes} from 'types';

export interface HashStrategy {
  version: number;

  /**
   * Performs project.files (fileSystem) hashing operation
   * Changes if fileStat.fileName | column.name | column.fieldType changes
   * Checks project.files against project.files
   * called within hashPayload(hashFileSystem())
   * used within isFilterWritableSelector by it's lonesome to check against IState.fileSystemHash
   * @param fileStats
   * @returns
   */
  hashFiles?: (fileStats: fileIngestionTypes.IFileStats[]) => string;
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

  constructor(s3: S3Manager) {
    this.s3 = s3;
  }

  public async resolve(
    fileStats: fileIngestionTypes.IFileStats[],
    project: databaseTypes.IProject,
    targetVersion?: number
  ): Promise<{fileHash: string; payloadHash: string; fileHashVersion: number; payloadHashVersion: number} | null> {
    const versions = targetVersion ? [targetVersion] : Array.from(this.strategies.keys()).sort().reverse();

    const hashChecks = versions.map(async (version) => {
      const strategy = this.get(version);
      if (!strategy) return null;

      const fileHash = strategy.hashFiles ? strategy.hashFiles(fileStats) : '';
      const payloadHash = strategy.hashPayload(fileHash, project);

      try {
        const exists = await this.checkExists(payloadHash, project.id!, project?.workspace.id!);
        if (exists) {
          return {hash: payloadHash, exists, version: strategy.version, fileHash};
        }
      } catch (error) {
        console.warn(`Hash check failed for version ${version}.`, error);
      }
      return null;
    });

    //   concurrently run all checks
    const results = await Promise.all(hashChecks);
    const found = results.find((result) => result?.exists);

    if (found) {
      if (found.version !== this.latestVersion()) {
        await this.backfill(found.hash, project);
      }
      return {
        fileHash: found.fileHash,
        payloadHash: found.hash,
        fileHashVersion: found.version,
        payloadHashVersion: found.version,
      };
    }

    return null;
  }

  private async checkExists(hash: string, projectId: string, workspaceId: string): Promise<boolean> {
    try {
      const checkFile = `client/${workspaceId}/${projectId}/output/${hash}.sgc`;
      return await this.s3.fileExists(checkFile);
    } catch (error) {
      console.error('Error checking resource existence:', error);
      return false;
    }
  }

  private async backfill(oldHash: string, project: databaseTypes.IProject) {
    try {
      const latestStrategy = this.get(this.latestVersion());
      if (!latestStrategy) throw new Error('Latest hash strategy not found');

      const newFileHash = latestStrategy.hashFiles ? latestStrategy.hashFiles(project.files) : '';
      const newHash = latestStrategy.hashPayload(newFileHash, project);

      const projectId = project.id;
      const workspaceId = project?.workspace.id;

      const oldFile = `client/${workspaceId}/${projectId}/output/${oldHash}.sgc`;
      const newFile = `client/${workspaceId}/${projectId}/output/${newHash}.sgc`;

      await this.s3.move(oldFile, newFile);

      // Update the state or project with the new hash (implementation depends on your system)
      // Example:
      if (stateId) {
        await StateService.updateState(stateId, {payloadHash: newHash});
      } else {
        await projectService.updateProject(projectId, {payloadHash: newHash});
      }

      console.log(`Backfilled file from ${oldHash} to ${newHash}`);
    } catch (error) {
      console.error('Error backfilling to latest version:', error);
    }
  }
}

// Concrete implementations (with completed `hash` methods)

class LatestHashStrategy implements HashStrategy {
  version = 3;
  hashFiles(fileStats: fileIngestionTypes.IFileStats[]): string {
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

class HashManagerV2 implements HashStrategy {
  version = 2;

  constructor(private s3: S3Manager) {}

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
