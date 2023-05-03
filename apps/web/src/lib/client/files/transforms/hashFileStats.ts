import MD5 from 'crypto-js/md5';
import { fileIngestion as fileIngestionTypes } from '@glyphx/types';

// handles rowId prefix
function removePrefix(str: string, prefix: string): string {
  if (!str.startsWith(prefix)) {
    return str;
  }
  return str.slice(prefix.length);
}

/**
 * Performs column/file combination hashing operations
 * @param fileStats
 * @param existing
 * @returns
 */
export const hashFileStats = (
  fileStats: fileIngestionTypes.IFileStats[],
  existing: boolean
): { fileColumnsHash: string; columnsHash: string }[] =>
  fileStats.map(({ fileName, columns }: { fileName: string; columns: fileIngestionTypes.IColumn[] }) => {
    const columnHashes = columns.map(({ name, fieldType }) => `${name}${fieldType}`).join('');
    const formattedColHashInput = existing ? removePrefix(columnHashes, 'glyphx_id__2') : columnHashes;
    return {
      fileColumnsHash: MD5(`${fileName}${formattedColHashInput}`).toString(),
      columnsHash: MD5(`${formattedColHashInput}`).toString(),
    };
  });
