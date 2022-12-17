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

// operations are executed in the order of the array

// ADD + REPLACE == ADD
// ADD + DELETE == REPLACE

// ADD + APPEND
// PEPLACE + APPEND
// DELETE + 
