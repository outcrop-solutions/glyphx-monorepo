//@ts-ignore
import MD5 from 'crypto-js/md5';
import {fileIngestionTypes} from 'types';

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
