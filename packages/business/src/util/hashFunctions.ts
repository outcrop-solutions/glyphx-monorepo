//@ts-ignore
import MD5 from 'crypto-js/md5';
import {databaseTypes, fileIngestionTypes, webTypes} from 'types';

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
export function hashPayload(fileHash: string, project: databaseTypes.IProject): string {
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

  const stateHash = MD5(propRetvals.join('')).toString();
  const payloadHash = MD5(`${fileHash}${stateHash}`).toString();
  return payloadHash;
}

/**
 * Performs project.files (fileSystem) hashing operation
 * Changes if fileStat.fileName | column.name | column.fieldType changes
 * Checks project.files against project.files
 * called within hashPayload(hashFileSystem())
 * used within isFilterWritableSelector by it's lonesome to check against IState.fileSystemHash
 * @param fileStats
 * @returns
 */
export const hashFileSystem = (fileStats: fileIngestionTypes.IFileStats[]): string => {
  const fileHashes = fileStats.map(({fileName, columns}: {fileName: string; columns: fileIngestionTypes.IColumn[]}) => {
    const columnHashes = columns.map(({name, fieldType}) => `${name}${fieldType}`).join('');
    const formattedColHashInput = columnHashes;
    return MD5(`${fileName}${formattedColHashInput}`).toString();
  });
  // Combine all the individual file hashes into a single hash
  const combinedHash = MD5(fileHashes.join('')).toString();

  return combinedHash;
};

/**
 * Performs column/file combination hashing operations
 * Used in fileCollisionRule.name "File Upload Summary" to compare new vs existing fileStats to keep track of
 * @param fileStats
 * @param existing
 * @returns
 */
export const hashFileStats = (
  fileStats: fileIngestionTypes.IFileStats[],
  existing: boolean
): {fileColumnsHash: string; columnsHash: string}[] =>
  fileStats.map(({fileName, columns}: {fileName: string; columns: fileIngestionTypes.IColumn[]}) => {
    const columnHashes = columns.map(({name, fieldType}) => `${name}${fieldType}`).join('');
    const formattedColHashInput = existing ? removePrefix(columnHashes, 'glyphx_id__') : columnHashes;
    return {
      fileColumnsHash: MD5(`${fileName}${formattedColHashInput}`).toString(),
      columnsHash: MD5(`${formattedColHashInput}`).toString(),
    };
  });

// handles rowId prefix
export function removePrefix(str: string, prefix: string): string {
  if (!str.startsWith(prefix)) {
    return str;
  }
  return str.slice(prefix.length);
}
