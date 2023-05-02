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
  const renamedFiles: Record<string, Record<string, string>> = {};

  collisions.forEach((collision) => {
    if (collision.operations.includes(1)) {
      updatedPayload.fileInfo = updatedPayload.fileInfo.map((fileInfo) => {
        if (fileInfo.fileName === collision.newFile && fileInfo.operation === 1) {
          renamedFiles[collision.newFile] = {
            fileName: collision.existingFile,
            tableName: cleanColumnName(collision.existingFile.split('.')[0]),
          };
          return {
            ...fileInfo,
            fileName: collision.existingFile,
            tableName: cleanColumnName(collision.existingFile.split('.')[0]),
          };
        }
        return fileInfo;
      });

      updatedPayload.fileStats = updatedPayload.fileStats.map((fileStat) => {
        if (renamedFiles[fileStat.fileName]) {
          return {
            ...fileStat,
            fileName: renamedFiles[fileStat.fileName].fileName,
            tableName: renamedFiles[fileStat.fileName].tableName,
          };
        }
        return fileStat;
      });
    }
  });

  return updatedPayload;
};
