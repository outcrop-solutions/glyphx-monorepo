// THIS FLAG DETERMINES INITIAL TRANSFORMATION FROM S3 OR BROWSER "ACCEPTEDFILES"
export enum IngestionType {
  BROWSER,
  S3,
}

export type FileInput = Blob; // local binary data from dropzone
export type S3Input = string; // location of project data in s3

export interface ProcessInput { // Input into start of pipeline
  files: FileInput[] | S3Input;
  ingestionType: IngestionType;
}

export interface RenderableState { // Holds Data 
  eTag: string | undefined;
  md5Checksum: string | undefined

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
