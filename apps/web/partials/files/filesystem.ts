enum Operation {
  ADD,
  REPLACE,
  APPEND,
  DELETE,
}

enum FieldType {
  NUMBER,
  STRING,
}

interface Column {
  name: string;
  fieldType: FieldType;
  longestString: number | undefined;
}

interface FileStats {
  fileName: string;
  tableName: string;
  numberOfRows: number;
  numberOfColumns: number;
  columns: Column[];
  fileSize: number;
}

interface FileData {
  tableName: string;
  fileName: string;
  operation: Operation;
  fileStream: ReadableStream;
}

interface Payload {
  modelId: string;
  bucketName: string;
  fileStats: FileStats;
  fileData: FileData;
}

/**
 * Determines column types from array ArrayBuffer
 * @param fileArrayBuffer
 * @returns {Column[]}
 */
export const determineColumnTypes = (
  fileArrayBuffer: ArrayBuffer
): Column[] => {
  const cols = [
    {
      name: "col1",
      origionalName: "col1",
      fieldType: 1,
      longestString: undefined,
    },
    {
      name: "col2",
      origionalName: "col2",
      fieldType: 0,
      longestString: 2,
    },
    {
      name: "col3",
      origionalName: "col3",
      fieldType: 0,
      longestString: 13,
    },
    {
      name: "col4",
      origionalName: "col4",
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
    fileName: "table1.csv",
    numberOfRows: 4,
    numberOfColumns: 100,
    columns: [],
  };
};

/**
 * Compares file statistics across filesystem to determine a match
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
export const createPayload = (): Payload => {};

/**
 * Sends file statistics, model information, and readable stream to backend for processing.
 * @param percent
 * @returns {void}
 */
const processFile = (modelId, bucketName, stats, fileData) => {
  const stream = new ReadableStream({
    start(controller) {
      interval = setInterval(() => {
        let string = "fileData";
        // Add the string to the stream
        controller.enqueue(string);
        // show it on the screen
      }, 1000);

      button.addEventListener("click", function () {
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
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: payload,
  });
};
