import { parse } from 'papaparse';
import { S3_BUCKET_NAME } from 'config/constants';
import { Types as mongooseTypes } from 'mongoose';
import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
/**
 * Takes in an array of file Blobs and returns the fileIngestionTypes.IFileStats
 * @param {File[]}
 * @returns {fileIngestionTypes.IPayload}
 */

export const parsePayload = async (
  workspaceId: string | mongooseTypes.ObjectId,
  projectId: string | mongooseTypes.ObjectId,
  acceptedFiles: File[]
): Promise<webTypes.IClientSidePayload> => {
  const stats = await Promise.all(
    acceptedFiles.map(async (file: File): Promise<fileIngestionTypes.IFileStats> => {
      const text = await file.text();
      const { data } = parse(text, { preview: 10 });
      return {
        fileName: file.name,
        tableName: file.name.split('.')[0].trim().toLowerCase(),
        numberOfRows: data?.length,
        numberOfColumns: Object.keys(data[0])?.length,
        columns: data[0].map((item, idx) => ({
          name: item,
          fieldType: isNaN(Number(data[1][idx]))
            ? fileIngestionTypes.constants.FIELD_TYPE.STRING
            : fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          longestString: undefined,
        })),
        fileSize: file.size,
      };
    })
  );

  const operations = acceptedFiles.map((file: File): Omit<fileIngestionTypes.IFileInfo, 'fileStream'> => {
    return {
      fileName: file.name,
      tableName: file.name.split('.')[0].trim().toLowerCase(),
      operation: 2,
    };
  });

  const payload = {
    clientId: workspaceId.toString(),
    modelId: projectId.toString(),
    bucketName: S3_BUCKET_NAME,
    fileStats: stats,
    fileInfo: operations,
  };

  return payload;
};
