// THIS FLAG DETERMINES INITIAL TRANSFORMATION FROM S3 OR BROWSER "ACCEPTEDFILES"
export enum IngestionType {
  BROWSER,
  S3,
}

export interface ProcessInput {
  files: Blob[];
  ingestionType: IngestionType;
}
export interface S3FileInput {}

export interface S3TableInput {}

export interface FileInput {}
export interface BrowserMultipfleFileUploadInput {
  files: any[];
}

export enum Operation {
  ADD,
  REPLACE,
  APPEND,
  DELETE,
}

export enum FieldType {
  NUMBER,
  STRING,
}

export interface Column {
  name: string;
  fieldType: FieldType;
  longestString: number | undefined;
  min: number | undefined;
  max: number | undefined;
}

export interface FileStats {
  fileName: string;
  tableName: string;
  numberOfRows: number;
  numberOfColumns: number;
  columns: Column[];
  fileSize: number;
}

export interface FileData {
  tableName: string;
  fileName: string;
  operation: Operation;
  fileStream: ReadableStream;
}

export interface Payload {
  modelId: string;
  bucketName: string;
  fileStats: FileStats[];
  fileData: FileData[];
}
