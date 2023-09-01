import MD5 from 'crypto-js/md5';
import {fileIngestionTypes} from 'types';
/**
 * Performs fileSystem hashing operation
 * @param fileStats
 * @param existing
 * @returns
 */
export function hashFileSystem(
  fileStats: fileIngestionTypes.IFileStats[]
): string {
  const fileHashes = fileStats.map(
    ({
      fileName,
      columns,
    }: {
      fileName: string;
      columns: fileIngestionTypes.IColumn[];
    }) => {
      const columnHashes = columns
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
