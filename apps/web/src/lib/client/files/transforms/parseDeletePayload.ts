import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { S3_BUCKET_NAME } from 'config/constants';
import { Types as mongooseTypes } from 'mongoose';
/**
 *
 * @param workspaceId
 * @param projectId
 * @param projectFiles
 * @param deletedFile
 * @returns
 */
export const parseDeletePayload = (
  workspaceId: string | mongooseTypes.ObjectId,
  projectId: string | mongooseTypes.ObjectId,
  projectFiles: fileIngestionTypes.IFileStats[],
  deletedFile: string
): webTypes.IClientSidePayload => {
  const fileStats = projectFiles.filter((file) => file.fileName === `${deletedFile}.csv`);

  const operations = fileStats.map(
    (file: fileIngestionTypes.IFileStats): Omit<fileIngestionTypes.IFileInfo, 'fileStream'> => {
      return {
        fileName: file.fileName,
        tableName: file.tableName,
        operation: 0,
      };
    }
  );

  const payload = {
    clientId: workspaceId.toString(),
    modelId: projectId.toString(),
    bucketName: S3_BUCKET_NAME,
    fileStats: fileStats,
    fileInfo: operations,
  };

  return payload;
};
