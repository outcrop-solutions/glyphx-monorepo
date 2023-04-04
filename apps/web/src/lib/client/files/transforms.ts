import MD5 from 'crypto-js/md5';
import { parse } from 'papaparse';
import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { S3_BUCKET_NAME } from 'config/constants';
import { Types as mongooseTypes } from 'mongoose';
/**
 * Takes array of file Blobs and merges them with the existing filesystem
 * @param acceptedFiles
 * @param {webTypes.IFileSystemItem[]}
 * @returns {webTypes.IFileSystemItem[] | any[]}
 */
export const createFileSystem = (
  acceptedFiles,
  fileSystem: webTypes.IFileSystemItem[] | null
): webTypes.IFileSystemItem[] | any[] => {
  let newData = acceptedFiles.map(({ name, type, size }, idx) => ({
    id: idx + fileSystem?.length + 1,
    parent: 0,
    droppable: false,
    text: name,
    data: {
      fileType: type,
      fileSize: size,
    },
  }));

  return [...(Array.isArray(fileSystem) ? fileSystem : []), ...(Array.isArray(newData) ? newData : [])];
};

/**
 * Takes S3 bucket contents and reshapes them into renderable filesystem state
 * @param {webTypes.S3ProviderListOutput}
 * @returns {[]}
 */
export const createFileSystemFromS3 = (
  s3Directory: webTypes.IS3ProviderListOutput,
  projectId: string
): webTypes.IFileSystemItem[] | any[] => {
  const files = {};

  const add = (source, target, item) => {
    const elements = source.split('/');
    const element = elements.shift();
    if (!element) return; // blank
    target[element] = target[element] || { __data: item }; // element;
    if (elements?.length) {
      target[element] = typeof target[element] === 'object' ? target[element] : {};
      add(elements.join('/'), target[element], item);
    }
  };

  if (Array.isArray(s3Directory)) {
    s3Directory.forEach((item) => add(item.key, files, item));
  }

  // TODO: this needs to change to orgLevel
  if (Object.keys(files)?.length !== 0) {
    // if empty then return empty array
    const fileList = Object.keys(files[`${projectId}`].input);
    return createFileSystem(fileList, null);
  } else {
    return [];
  }
};

/** Creates a Table list from S3 directory
 * @param {webTypes.S3ProviderListOutput}
 * @returns {string[]}
 */

export const createTableList = (s3Directory: webTypes.IS3ProviderListOutput): string[] => {
  return;
};

/**
 * Takes in papaparsed file data and returns the rendarable grid state
 * @param {File}
 * @returns {webTypes.RenderableDataGrid}
 */
export const formatGridData = (data): webTypes.IRenderableDataGrid => {
  const colNames = Object.keys(data[0]);

  let cols = colNames.map((item, idx) => {
    const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
    return {
      key: item,
      dataType: isNaN(Number(data[0][item]))
        ? fileIngestionTypes.constants.FIELD_TYPE.STRING
        : fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
      name: capitalized,
      width: 120,
      resizable: true,
      sortable: true,
    };
  });
  // Generates first column
  cols.unshift({
    key: 'id',
    dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
    name: '',
    width: 40,
    resizable: true,
    sortable: true,
  });
  let rows = data.map((row, idx) => ({ ...row, id: idx }));

  return { columns: cols, rows };
};

/**
 * Takes in an array of file Blobs and returns the fileIngestionTypes.IFileStats
 * @param {File[]}
 * @returns {fileIngestionTypes.IPayload}
 */

interface IClientSidePayload {
  clientId: string | mongooseTypes.ObjectId;
  modelId: string;
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
    modelId: projectId,
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

/**
 * Takes in output of compareStats and adds in array of user decisions to create IFileInfop[] for payload
 * @param {FILE_OPERATION[]}
 * @param {}
 */

/**
 * Stores file streaming progress if incomplete
 * @param percent
 * @returns {void}
 */
export const storeProgress = () => {};
