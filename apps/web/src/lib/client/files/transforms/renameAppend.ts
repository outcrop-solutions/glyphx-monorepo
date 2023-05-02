import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
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

  collisions.forEach((collision) => {
    if (collision.operations.includes(1)) {
      updatedPayload.fileInfo = updatedPayload.fileInfo.map((fileInfo) => {
        if (fileInfo.fileName === collision.newFile) {
          return {
            ...fileInfo,
            fileName: collision.existingFile,
            tableName: cleanColumnName(collision.existingFile.split('.')[0]),
          };
        }
        return fileInfo;
      });

      updatedPayload.fileStats = updatedPayload.fileStats.map((fileStat) => {
        if (fileStat.fileName === collision.newFile) {
          return {
            ...fileStat,
            fileName: collision.existingFile,
            tableName: cleanColumnName(collision.existingFile.split('.')[0]),
          };
        }
        return fileStat;
      });
    }
  });

  return updatedPayload;
};
