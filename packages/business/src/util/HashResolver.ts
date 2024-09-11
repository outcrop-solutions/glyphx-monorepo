import {S3Manager} from 'core/src/aws';
import MD5 from 'crypto-js/md5';
import {databaseTypes, fileIngestionTypes, hashTypes, webTypes} from 'types';

export class HashResolver {
  exts = ['sgc', 'sgn', 'sdt'];
  status: hashTypes.Status;
  workspaceId: string;
  projectId: string;
  basePath: string;
  s3: S3Manager;
  strategies: Map<string, hashTypes.IHashStrategy> = new Map();

  public register(strategy: hashTypes.IHashStrategy) {
    this.strategies.set(strategy.version, strategy);
  }

  public get(version: string): hashTypes.IHashStrategy {
    return this.strategies.get(version);
  }

  public strats(): number {
    return this.strategies.size;
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
    // registered in reverse version number order
    this.register(new HashStrategy_0dc9da4()); // 5
    this.register(new HashStrategy_47bcf33()); // 4
    this.register(new HashStrategy_4a8005c()); // 3
    this.register(new HashStrategy_7e06423()); // 2
    this.register(new HashStrategy_c540f1f()); // 1
    this.register(new HashStrategy_486f205()); // 0
  }

  /**
   *
   * @param project
   * @returns
   */
  public async resolve(req: hashTypes.ResolveReq): Promise<hashTypes.IResolution> {
    const versions = Array.from(this.strategies.keys()).sort().reverse();
    // concurrently check the project against each strategy
    for (const version of versions) {
      const strategy = this.get(version);
      // get hash for a given request + strategy
      let fh, ph;
      if (req.type === 'state') {
        ph = req.state.payloadHash;
      } else {
        fh = strategy?.hashFiles(req.project.files);
        ph = strategy?.hashPayload(fh, req.project);
      }
      // build file paths
      const filePaths = this.exts.map((e) => `${this.basePath}/${ph}.${e}`);
      // concurrently check existence for a given strategy
      const presence: hashTypes.IDataPresence[] = await Promise.all(
        filePaths.map(async (path) => {
          return {exists: await this.s3.fileExists(path), path};
        })
      );
      // Check if all files exist for this version
      const allFilesExist = presence.every((p) => p.exists);
      if (allFilesExist) {
        return {presence, version, fileHash: fh, payloadHash: ph};
      }
    }
    // if we haven't returns a result, throw an error
    throw new Error('no payload hash');
  }
}

/**
 * Version 6 [LATEST]
 * Note: adds safeStringify
 */

export class LatestHashStrategy implements hashTypes.IHashStrategy {
  version = 'latest';
  hashFiles(fileStats: fileIngestionTypes.IFileStats[]): string {
    // moved here from createState action in order to avoid discrepancy
    const fileHashes = fileStats.map(
      ({fileName, columns}: {fileName: string; columns: fileIngestionTypes.IColumn[]}) => {
        const columnHashes = columns
          .filter((c) => c.name !== 'glyphx_id__')
          .map(({name, fieldType}) => `${name}${fieldType}`)
          .join('');
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
          keyRetvals.push(this.safeStringify((sortedProp[key] as webTypes.INumbericFilter)?.min ?? ''));
          keyRetvals.push(this.safeStringify((sortedProp[key] as webTypes.INumbericFilter)?.max ?? ''));
        } else if (
          key === 'filter' &&
          dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING &&
          sortedProp[key] &&
          (sortedProp[key] as webTypes.IStringFilter)?.keywords?.length > 0
        ) {
          for (const word of (sortedProp.filter as webTypes.IStringFilter)?.keywords) {
            keyRetvals.push(this.safeStringify(word));
          }
        } else {
          keyRetvals.push(this.safeStringify(sortedProp[key]));
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
  // Safe stringification function
  private safeStringify(value: any): string {
    if (value === undefined) return '';
    if (typeof value === 'object') {
      if (value instanceof Date) return value.toISOString();
      if (Array.isArray(value)) return value.map(this.safeStringify).join(',');
      return JSON.stringify(value);
    }
    return String(value);
  }
}

/**
 * Version 0
 * Commit: Main => 486f205c8ea27a37ab8058ef3c1b73d955c0cde7
 * Note: The original, dumb payload hash function
 */
export class HashStrategy_486f205 implements hashTypes.IHashStrategy {
  version = '486f205';
  hashFiles(files: fileIngestionTypes.IFileStats[]): string {
    const fileHashes = files.map(({fileName, columns}: {fileName: string; columns: fileIngestionTypes.IColumn[]}) => {
      const columnHashes = columns.map(({name, fieldType}) => `${name}${fieldType}`).join('');
      const formattedColHashInput = columnHashes;
      return MD5(`${fileName}${formattedColHashInput}`).toString();
    });
    // Combine all the individual file hashes into a single hash
    const combinedHash = MD5(fileHashes.join('')).toString();
    return combinedHash;
  }
  hashPayload(fileHash: string, project: databaseTypes.IProject): string {
    const projectStateProperties = JSON.stringify(project.state.properties);
    const payload = `${fileHash}${projectStateProperties}`;

    return MD5(payload).toString();
  }
}

/**
 * Version 1
 * Commit: Main => c540f1fe37ecd1aeeb5c9cc3aedac5b08dca1e84
 * Note: Adds project object id cleaning
 */
export class HashStrategy_c540f1f implements hashTypes.IHashStrategy {
  version = 'c540f1f';
  hashFiles(files: fileIngestionTypes.IFileStats[]): string {
    const fileHashes = files.map(({fileName, columns}: {fileName: string; columns: fileIngestionTypes.IColumn[]}) => {
      const columnHashes = columns.map(({name, fieldType}) => `${name}${fieldType}`).join('');
      const formattedColHashInput = columnHashes;
      return MD5(`${fileName}${formattedColHashInput}`).toString();
    });
    // Combine all the individual file hashes into a single hash
    const combinedHash = MD5(fileHashes.join('')).toString();
    return combinedHash;
  }
  hashPayload(fileHash, project): string {
    let proj = {...project};
    // clean ids
    delete proj.state.properties['X'].id;
    delete proj.state.properties['Y'].id;
    delete proj.state.properties['Z'].id;
    delete proj.state.properties['A'].id;
    delete proj.state.properties['B'].id;
    delete proj.state.properties['C'].id;
    // clean filter ids
    delete proj.state.properties['X'].filter.id;
    delete proj.state.properties['Y'].filter.id;
    delete proj.state.properties['Z'].filter.id;
    delete proj.state.properties['A'].filter.id;
    delete proj.state.properties['B'].filter.id;
    delete proj.state.properties['C'].filter.id;

    for (const key of Object.keys(proj.state.properties)) {
      const keywords = proj.state.properties[key].keywords;
      if (keywords && keywords.length === 0) {
        delete proj.state.properties[key].filter.keywords;
      }
    }
    const projectStateProperties = JSON.stringify(proj.state.properties);
    const payload = `${fileHash}${projectStateProperties}`;

    return MD5(payload).toString();
  }
}

/**
 * Version 2
 * Commit: Main => 7e0642336cda4ee2339baf11094e97dfa8be3493
 * Note: The original hashPayload in the conglomerated file 'hashFunctions.ts'
 */
export class HashStrategy_7e06423 implements hashTypes.IHashStrategy {
  version = '7e06423';
  hashFiles(files: fileIngestionTypes.IFileStats[]): string {
    const fileHashes = files.map(({fileName, columns}: {fileName: string; columns: fileIngestionTypes.IColumn[]}) => {
      const columnHashes = columns.map(({name, fieldType}) => `${name}${fieldType}`).join('');
      const formattedColHashInput = columnHashes;
      return MD5(`${fileName}${formattedColHashInput}`).toString();
    });
    // Combine all the individual file hashes into a single hash
    const combinedHash = MD5(fileHashes.join('')).toString();
    return combinedHash;
  }
  hashPayload(fileHash: string, project: databaseTypes.IProject): string {
    const relevantProps = ['X', 'Y', 'Z'];
    const relevantKeys = ['key', 'dataType', 'interpolation', 'direction', 'filter', 'keywords'];
    const propRetvals = [] as string[];

    for (const propKey of relevantProps) {
      const prop = project.state.properties[propKey];
      const keyRetvals = [] as string[];
      const dataType = prop.dataType;
      for (const key of relevantKeys) {
        if (key === 'filter' && dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER) {
          keyRetvals.push(String((prop[key] as webTypes.INumbericFilter).min) ?? '');
          keyRetvals.push(String((prop[key] as webTypes.INumbericFilter).max) ?? '');
        } else if (key === 'keywords') {
          for (const word of prop[key]) {
            keyRetvals.push(String(word));
          }
        } else {
          keyRetvals.push(String(prop[key]));
        }
      }
      propRetvals.push(keyRetvals.join(''));
    }

    const stateHash = MD5(propRetvals.join('')).toString();
    const payloadHash = MD5(`${fileHash}${stateHash}`);
    return payloadHash;
  }
}

/**
 * Version 3
 * Note: includes 'A', 'B', and 'C' from the property record
 * Commit: Main => 4a8005c5e1e2ae79a1ddede14920c0daf6e3cb94
 */
export class HashStrategy_4a8005c implements hashTypes.IHashStrategy {
  version = '4a8005c';
  hashFiles(files: fileIngestionTypes.IFileStats[]): string {
    const fileHashes = files.map(({fileName, columns}: {fileName: string; columns: fileIngestionTypes.IColumn[]}) => {
      const columnHashes = columns.map(({name, fieldType}) => `${name}${fieldType}`).join('');
      const formattedColHashInput = columnHashes;
      return MD5(`${fileName}${formattedColHashInput}`).toString();
    });
    const combinedHash = MD5(fileHashes.join('')).toString();
    return combinedHash;
  }
  hashPayload(fileHash: string, project: databaseTypes.IProject): string {
    const relevantProps = ['X', 'Y', 'Z', 'A', 'B', 'C']; // this is added
    const relevantKeys = ['key', 'dataType', 'interpolation', 'direction', 'filter', 'keywords'];
    const propRetvals = [] as string[];

    for (const propKey of relevantProps) {
      const prop = project.state.properties[propKey];
      const keyRetvals = [] as string[];
      const dataType = prop.dataType;
      for (const key of relevantKeys) {
        if (key === 'filter' && dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER) {
          keyRetvals.push(String((prop[key] as webTypes.INumbericFilter).min) ?? '');
          keyRetvals.push(String((prop[key] as webTypes.INumbericFilter).max) ?? '');
        } else if (key === 'keywords' && Array.isArray(prop[key])) {
          // this is added
          for (const word of prop[key]) {
            keyRetvals.push(String(word));
          }
        } else {
          keyRetvals.push(String(prop[key]));
        }
      }
      propRetvals.push(keyRetvals.join(''));
    }

    const stateHash = MD5(propRetvals.join('')).toString(); // this is added
    const payloadHash = MD5(`${fileHash}${stateHash}`).toString();
    return payloadHash;
  }
}

/**
 * Version 4
 * Note: changed filter handling for keywords
 * Commit: Main => 47bcf337ca47ff2d2f6982aabaeefbe0d6aca202
 */
export class HashStrategy_47bcf33 implements hashTypes.IHashStrategy {
  version = '47bcf33';
  hashFiles(files: fileIngestionTypes.IFileStats[]): string {
    const fileHashes = files.map(({fileName, columns}: {fileName: string; columns: fileIngestionTypes.IColumn[]}) => {
      const columnHashes = columns.map(({name, fieldType}) => `${name}${fieldType}`).join('');
      const formattedColHashInput = columnHashes;
      return MD5(`${fileName}${formattedColHashInput}`).toString();
    });
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
        // this is different
        if (key === 'filter' && dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER) {
          keyRetvals.push(String((prop[key] as webTypes.INumbericFilter).min) ?? '');
          keyRetvals.push(String((prop[key] as webTypes.INumbericFilter).max) ?? '');
          // this is different
        } else if (key === 'filter' && dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING) {
          for (const word of (prop[key] as webTypes.IStringFilter).keywords) {
            keyRetvals.push(String(word));
          }
        } else {
          keyRetvals.push(String(prop[key]));
        }
      }
      propRetvals.push(keyRetvals.join(''));
    }

    const stateHash = MD5(propRetvals.join('')).toString();
    const payloadHash = MD5(`${fileHash}${stateHash}`).toString();
    return payloadHash;
  }
}

/**
 * Version 5
 * Note: includes project.id
 * Commit: Main => 0dc9da45b6bc67b381037d7e4e70da808a35e929
 */
export class HashStrategy_0dc9da4 implements hashTypes.IHashStrategy {
  version = '0dc9da4';
  hashFiles(files: fileIngestionTypes.IFileStats[]): string {
    const fileHashes = files.map(({fileName, columns}: {fileName: string; columns: fileIngestionTypes.IColumn[]}) => {
      const columnHashes = columns.map(({name, fieldType}) => `${name}${fieldType}`).join('');
      const formattedColHashInput = columnHashes;
      return MD5(`${fileName}${formattedColHashInput}`).toString();
    });
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
        } else if (key === 'filter' && dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING) {
          for (const word of (prop[key] as webTypes.IStringFilter).keywords) {
            keyRetvals.push(String(word));
          }
        } else {
          keyRetvals.push(String(prop[key]));
        }
      }
      propRetvals.push(keyRetvals.join(''));
    }
    // this is added
    if (project.id) {
      propRetvals.push(project.id);
    }
    const stateHash = MD5(propRetvals.join('')).toString();
    const payloadHash = MD5(`${fileHash}${stateHash}`).toString();
    return payloadHash;
  }
}
