import MD5 from 'crypto-js/md5';
import { parse } from 'papaparse';
import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { S3_BUCKET_NAME } from 'config/constants';
import { Types as mongooseTypes } from 'mongoose';

/**
 * Takes in papaparsed file data and returns the rendarable grid state
 * @param {File}
 * @returns {webTypes.RenderableDataGrid}
 */
export const formatGridData = (data): webTypes.IRenderableDataGrid => {
  const colNames = Object.keys(data[0]);

  let cols = colNames.map((item, idx) => {
    return {
      key: item,
      name: item === 'glyphx_id__' ? 'id' : item,
      dataType: isNaN(Number(data[0][item]))
        ? fileIngestionTypes.constants.FIELD_TYPE.STRING
        : fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
      width: 120,
      resizable: true,
      sortable: true,
    };
  });
  // Generates first column
  const rows = data.map((row, idx) => ({ ...row, id: idx }));
  return { columns: cols, rows };
};

/**
 * Takes in an array of file Blobs and returns the fileIngestionTypes.IFileStats
 * @param {File[]}
 * @returns {fileIngestionTypes.IPayload}
 */

interface IClientSidePayload {
  clientId: string | mongooseTypes.ObjectId;
  modelId: string | mongooseTypes.ObjectId;
  bucketName: string;
  fileStats: fileIngestionTypes.IFileStats[];
  fileInfo: Omit<fileIngestionTypes.IFileInfo, 'fileStream'>[];
}

export const parsePayload = async (
  workspaceId: string | mongooseTypes.ObjectId,
  projectId: string | mongooseTypes.ObjectId,
  acceptedFiles: File[]
): Promise<IClientSidePayload> => {
  const stats = await Promise.all(
    acceptedFiles.map(async (file: File): Promise<fileIngestionTypes.IFileStats> => {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      const dataGrid = formatGridData(data);
      return {
        fileName: file.name,
        tableName: file.name.split('.')[0].trim().toLowerCase(),
        numberOfRows: data?.length,
        numberOfColumns: Object.keys(data[0])?.length,
        columns: Object.keys(data[0]).map((item) => ({
          name: item,
          fieldType: isNaN(Number(data[0][item]))
            ? fileIngestionTypes.constants.FIELD_TYPE.STRING
            : fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          longestString: undefined,
        })),
        fileSize: file.size,
        dataGrid: dataGrid,
        open: false,
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

/**
 * Compares fileIngestionTypes.IFileStats across hashes of fileIngestionTypes.IFileStats to determine matching file name/colum/type combos using MD5 to allow user to make a decision
 * @param {fileIngestionTypes.IFileStats[]}
 * @param {fileIngestionTypes.IFileStats[]}
 * @returns {webTypes.IMatchingFileStats[]}
 */
export const compareStats = (newFileStats, existingFileStats): webTypes.IMatchingFileStats[] => {
  // TODO: file name collisions
  // select and hash relevant values
  const newHashes = newFileStats.map(({ fileName, tableName, columns }) => MD5({ fileName, tableName, columns }));
  const existingHashes = newFileStats.map(({ fileName, tableName, columns }) => MD5({ fileName, tableName, columns }));

  // determine matches from hashes
  return newHashes
    .map((hash, idx) =>
      existingHashes.findIndex(hash) !== -1
        ? { new: newFileStats[idx], existing: existingFileStats[existingHashes.findIndex(hash)] }
        : null
    )
    .filter((el) => el !== null);
};
