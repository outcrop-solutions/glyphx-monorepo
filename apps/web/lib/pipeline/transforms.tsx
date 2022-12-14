import { Operation, FieldType, Column, FileStats, FileData, Payload } from './types';

/**
 * Determines column types from array ArrayBuffer
 * @param fileArrayBuffer
 * @returns {Column[]}
 */
export const determineColumnTypes = (fileArrayBuffer: ArrayBuffer): Column[] => {
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
 * Creates file statistics from ArrayBuffer
 * @param ReadableStream
 * @returns {FileStats}
 */
export const calculateStats = (): FileStats => {
  return {
    fileName: 'table1.csv',
    numberOfRows: 4,
    numberOfColumns: 100,
    columns: [],
  };
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
 * Stores file streaming progress if incomplete
 * @param percent
 * @returns {void}
 */
export const createPayload = (): Payload => {
  return;
};

/**
 * Sends file statistics, model information, and readable stream to backend for processing.
 * @param percent
 * @returns {void}
 */
export const processFile = async (modelId, bucketName, stats, fileData): void => {
  const stream = new ReadableStream({
    start(controller) {
      interval = setInterval(() => {
        let string = 'fileData';
        // Add the string to the stream
        controller.enqueue(string);
        // show it on the screen
      }, 1000);

      button.addEventListener('click', function () {
        clearInterval(interval);
        readStream();
        controller.close();
      });
    },
    pull(controller) {
      // We don't really need a pull in this example
    },
    cancel() {
      // This is called if the reader cancels,
      // so we should stop generating strings
      clearInterval(interval);
    },
  });

  fetch(`/newFile`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: stream,
  });
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
