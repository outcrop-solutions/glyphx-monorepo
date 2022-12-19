import { IColumn, IFileStats } from '@glyphx/types/src/fileIngestion';
import MD5 from 'crypto-js/md5';
import { FIELD_TYPE } from '@glyphx/types/src/fileIngestion/constants';
import { parse } from 'papaparse';
import { IFileSystemItem, S3ProviderListOutput, RenderableDataGrid, IMatchingFileStats } from '@/lib/file-ingest/types';

/**
 * Takes array of file Blobs and merges them with the existing filesystem
 * @param acceptedFiles
 * @param {IFileSystemItem[]}
 * @returns {IFileSystemItem[] | any[]}
 */
export const createFileSystem = (acceptedFiles, fileSystem: IFileSystemItem[] | null): IFileSystemItem[] | any[] => {
  let newData = acceptedFiles.map(({ name, type, size }, idx) => ({
    // @ts-ignore
    id: idx + fileSystem.length + 1,
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
 * @param {S3ProviderListOutput}
 * @returns {[]}
 */
export const createFileSystemFromS3 = (
  s3Directory: S3ProviderListOutput,
  projectId: string
): IFileSystemItem[] | any[] => {
  const files = {};

  const add = (source, target, item) => {
    const elements = source.split('/');
    const element = elements.shift();
    if (!element) return; // blank
    target[element] = target[element] || { __data: item }; // element;
    if (elements.length) {
      target[element] = typeof target[element] === 'object' ? target[element] : {};
      add(elements.join('/'), target[element], item);
    }
  };

  if (Array.isArray(s3Directory)) {
    s3Directory.forEach((item) => add(item.key, files, item));
  }
  // TODO: this needs to change to orgLevel
  if (Object.keys(files).length !== 0) {
    // if empty then return empty array
    const fileList = Object.keys(files[`${projectId}`].input);
    return createFileSystem(fileList, null);
  } else {
    return [];
  }
};

/** Creates a Table list from S3 directory
 * @param {S3ProviderListOutput}
 * @returns {string[]}
 */

export const createTableList = (s3Directory: S3ProviderListOutput): string[] => {
  return;
};

/**
 * Takes in papaparsed file data and returns the rendarable grid state
 * @param {File}
 * @returns {RenderableDataGrid}
 */
export const formatGridData = (data): RenderableDataGrid => {
  const colNames = Object.keys(data[0]);

  let cols = colNames.map((item, idx) => {
    const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
    return {
      key: item,
      dataType: !isNaN(parseInt(data[0][item])) ? 'number' : 'string',
      name: capitalized,
      width: 120,
      resizable: true,
      sortable: true,
    };
  });
  // Generates first column
  // @ts-ignore
  cols.unshift({ key: 'id', name: '', width: 40, resizable: true });
  let rows = data.map((row, idx) => ({ ...row, id: idx }));
  // @ts-ignore
  return { columns: cols, rows };
};

/**
 * Takes in an array of file Blobs and returns the IFileStats
 * @param {File[]}
 * @returns {IFileStats[]}
 */
export const parseFileStats = async (acceptedFiles): Promise<IFileStats[]> => {
  const stats = await acceptedFiles.map(async (file: File) => {
    const text = await file.text();
    const { data } = parse(text, { header: true });
    return {
      fileName: file.name,
      tableName: file.name.split('.')[0].trim().toLowerCase(),
      numberOfRows: data.length,
      numberOfColumns: Object.keys(data[0]).length,
      columns: Object.keys(data[0]).map((item) => ({
        name: item,
        fieldType: !isNaN(parseInt(data[0][item])) ? FIELD_TYPE.NUMBER : FIELD_TYPE.STRING,
        longestString: undefined,
      })),
      fileSize: file.size,
    };
  });
  console.log({ stats });
  return stats;
};

/**
 * Compares IFileStats across hashes of IFileStats to determine matching file name/colum/type combos using MD5 to allow user to make a decision
 * @param {IFileStats[]}
 * @param {IFileStats[]}
 * @returns {IMatchingFileStats[]}
 */
export const compareStats = (newFileStats, existingFileStats): IMatchingFileStats[] => {
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

export const hexToRGB = (h) => {
  let r = '';
  let g = '';
  let b = '';
  if (h.length === 4) {
    r = `0x${h[1]}${h[1]}`;
    g = `0x${h[2]}${h[2]}`;
    b = `0x${h[3]}${h[3]}`;
  } else if (h.length === 7) {
    r = `0x${h[1]}${h[2]}`;
    g = `0x${h[3]}${h[4]}`;
    b = `0x${h[5]}${h[6]}`;
  }
  return `${+r},${+g},${+b}`;
};

export const formatValue = (value) =>
  Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumSignificantDigits: 3,
    notation: 'compact',
  }).format(value);

export const formatThousands = (value) =>
  Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 3,
    notation: 'compact',
  }).format(value);

/**
 * FORMAT COLUMN HEADER TO MATCH ATHENA TABLE
 * @param header
 * @returns {string}
 */
export const formatColumnHeader = (header) => {
  let value = header;

  value = value.replace(/\./g, '');
  value = value.replace(/ /g, '_');
  value = value.replace(/\(/g, '_');
  value = value.replace(/\)/g, '_');
  value = value.replace(/\-/g, '_');

  return value.toLowerCase();
};
