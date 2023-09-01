import { webTypes, fileIngestionTypes } from 'types';
import { cleanColumnName } from './parsePayload';

/**
 * Reformats payload based on APPEND (you can't append to a file/tableName that doesn't exist)
 * @param payload
 * @param collisions
 */
export const renameAppend = (
  payload: webTypes.IClientSidePayload,
  collisions: webTypes.Collision[]
): webTypes.IClientSidePayload => {
  const updatedPayload = { ...payload };
  const renamedTables: Record<string, string> = {};

  collisions.forEach((collision) => {
    if (collision?.operations?.includes(1)) {
      updatedPayload.fileInfo = updatedPayload.fileInfo.map((fileInfo) => {
        if (fileInfo.fileName === collision.newFile && fileInfo.operation === 1) {
          renamedTables[collision.newFile] = cleanColumnName(collision.existingFile.split('.')[0]);
          return {
            ...fileInfo,
            tableName: cleanColumnName(collision.existingFile.split('.')[0]),
          };
        }
        return fileInfo;
      });

      updatedPayload.fileStats = updatedPayload.fileStats.map((fileStat) => {
        if (renamedTables[fileStat.fileName]) {
          return {
            ...fileStat,
            tableName: renamedTables[fileStat.fileName],
          };
        }
        return fileStat;
      });
    }
  });

  return updatedPayload;
};
