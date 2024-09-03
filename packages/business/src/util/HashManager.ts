// @ts-ignore
import {S3Manager} from 'core/src/aws';
import MD5 from 'crypto-js/md5';
import {databaseTypes, fileIngestionTypes, webTypes} from 'types';

// Safe stringification function
function safeStringify(value: any): string {
  if (value === undefined) return '';
  if (typeof value === 'object') {
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(safeStringify).join(',');
    return JSON.stringify(value); // Fallback, but could lead to unstable hashes if object keys order changes
  }
  return String(value);
}

abstract class HashManager {
  protected abstract hashVersion: number;
  protected abstract hash(fileHash: string, project: databaseTypes.IProject): string;
  protected abstract check(hash: string): Promise<boolean>;

  private static versions: Map<number, HashManager> = new Map();

  protected static addVersion(implementation: HashManager) {
    this.versions.set(implementation.hashVersion, implementation);
  }

  constructor() {
    HashManager.addVersion(this);
  }

  public async computeHash(
    fileHash: string,
    project: databaseTypes.IProject,
    targetVersion?: number
  ): Promise<string | null> {
    const versionsToTry = targetVersion ? [targetVersion] : Array.from(HashManager.versions.keys()).sort().reverse();

    const hashComputations = versionsToTry.map(async (version) => {
      const hm = HashManager.versions.get(version);
      if (hm) {
        try {
          const hash = hm.hash(fileHash, project);
          const exists = await hm.check(hash);
          if (exists) {
            return hash;
          }
        } catch (error) {
          console.warn(`Hash computation or resource check failed for version ${version}.`, error);
        }
      }
      return null;
    });
    const results = await Promise.all(hashComputations);
    return results.find((result) => result !== null) || null;
  }
}

// Implementation for the latest hash version (hashPayload)
export class LatestHashManager extends HashManager {
  protected hashVersion = 3;
  private s3: S3Manager;

  protected hash(fileHash: string, project: databaseTypes.IProject): string {
    const relevantProps = ['X', 'Y', 'Z', 'A', 'B', 'C'];
    const relevantKeys = ['key', 'dataType', 'interpolation', 'direction', 'filter', 'accumulatorType', 'dateGrouping'];
    const propRetvals = [] as string[];

    for (const propKey of relevantProps) {
      const prop = project.state.properties[propKey];

      // Sort keys for key-order resistance
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

  constructor(s3: S3Manager) {
    super();
    this.s3 = s3;
  }
  protected async check(hash: string): Promise<boolean> {
    try {
      const projectId = ''; // You'll need to get the projectId from somewhere appropriate
      const workspaceId = ''; // Similarly, get the workspaceI
      const checkFile = `client/${workspaceId}/${projectId}/output/${hash}.sgc`;
      //   return await s3.getFile(checkFile);
    } catch (error) {
      console.error('Error checking resource existence:', error);
      return false; // Or handle the error differently based on your requirements
    }
  }
}

// Implementation for the older hash version (oldHashFunction)
export class OldHashManager extends HashManager {
  protected hashVersion = 1;
  private s3: S3Manager;
  constructor(s3: S3Manager) {
    super();
    this.s3 = s3;
  }
  protected hash(fileHash: string, project: databaseTypes.IProject): string {
    const relevantProps = ['X', 'Y', 'Z', 'A', 'B', 'C'];
    const relevantKeys = ['key', 'dataType', 'interpolation', 'direction', 'filter', 'accumulatorType', 'dateGrouping'];
    const propRetvals = [] as string[];

    for (const propKey of relevantProps) {
      const prop = project.state.properties[propKey];

      // Sort keys for key-order resistance
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
        } else if (key === 'filter' && dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING) {
          for (const word of (sortedProp[key] as webTypes.IStringFilter)?.keywords ?? []) {
            keyRetvals.push(safeStringify(word));
          }
        } else {
          keyRetvals.push(safeStringify(sortedProp[key]));
        }
      }
      propRetvals.push(keyRetvals.join(''));
    }

    const stateHash = MD5(propRetvals.join('')).toString();
    const payloadHash = MD5(`<span class="math-inline">\{fileHash\}</span>{stateHash}`).toString();
    return payloadHash;
  }

  protected async check(hash: string): Promise<boolean> {
    // Assuming you have s3Manager available in this scope
    try {
      const projectId = ''; // You'll need to get the projectId from somewhere appropriate
      const workspaceId = ''; // Similarly, get the workspaceId

      const checkFile = `client/<span class="math-inline">\{workspaceId\}/</span>{projectId}/output/${hash}.sgc`;
      return await s3.fileExists(checkFile);
    } catch (error) {
      console.error('Error checking resource existence:', error);
      return false;
    }
  }
}

// ... (rest of the code, including hashFiles, hashFileStats, removePrefix, and signDataUrls
