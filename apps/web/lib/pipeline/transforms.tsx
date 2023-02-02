import { IColumn, IFileStats } from '@glyphx/types/src/fileIngestion';
import { Operation, FieldType, Column, FileStats, FileData, Payload } from './types';
import { _Object } from '@aws-sdk/client-s3';

interface IFileSystemItem {
  id: number;
  parent: number;
  droppable: boolean;
  text: string;
  data: {
    fileType: string;
    fileSize: string;
  };
}

type ListObjectsCommandOutputContent = _Object;
interface S3ProviderListOutputItem {
  key: ListObjectsCommandOutputContent['Key'];
  eTag: ListObjectsCommandOutputContent['ETag'];
  lastModified: ListObjectsCommandOutputContent['LastModified'];
  size: ListObjectsCommandOutputContent['Size'];
}

interface S3ProviderListOutput {
  results: S3ProviderListOutputItem[];
  nextToken?: string;
  hasNextToken: boolean;
}

/**
 * Creates new filesystem state for frontend
 * @param acceptedFiles
 * @param {IFileSystemItem}
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
 * Pipes S3 bucket contents into filesystem state
 * @param {S3ProviderListOutput}
 * @returns {[]}
 */
export const createFileSystemOnDownload = (
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
  // if(Object.keys(files).length !== 0){ // if empty then return empty array
  const fileList = Object.keys(files[`${projectId}`].input);
  // }
  return createFileSystem(fileList, null);
};

/**
 * Determines column types from array ArrayBuffer
 * @param fileArrayBuffer
 * @returns {Column[]}
 */

export const determineColumnTypes = (fileArrayBuffer: ArrayBuffer): IColumn[] => {
  const cols = [
    {
      name: 'col1',
      origionalName: 'col1',
      fieldType: 1,
      longestString: undefined,
    },
    {
      name: 'col2',
      origionalName: 'col2',
      fieldType: 0,
      longestString: 2,
    },
    {
      name: 'col3',
      origionalName: 'col3',
      fieldType: 0,
      longestString: 13,
    },
    {
      name: 'col4',
      origionalName: 'col4',
      fieldType: 1,
      longestString: undefined,
    },
  ];
  return cols;
};

/**
 * Determines table name from filename
 * @param fileName
 * @returns {string}
 */

export const determineTableName = (fileName: string) => {};

/**
 * Calculates file statistics from ArrayBuffer
 * @param ReadableStream
 * @returns {IFileStats}
 */
export const calculateStats = (): IFileStats => {
  return;
};

/**
 * Compares file statistics across Filesystem snapshots to determine a match
 * @param fileStats1
 * @param fileStats2
 * @returns {boolean}
 */
export const compareStats = (): boolean => {
  return true;
};

/**
 * Adds a new file to a table set
 * @param fileName
 * @param tableName
 * @returns {boolean}
 */
export const addFileToTableSet = () => {};

/**
 * Stores file streaming progress if incomplete
 * @param percent
 * @returns {void}
 */
export const storeProgress = () => {};

/**
 *
 * @param percent
 * @returns {void}
 */
export const createPayload = (): Payload => {
  return;
};

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
 * @returns
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
