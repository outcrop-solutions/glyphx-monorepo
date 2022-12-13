/**
 * This interface describes the shape of information
 * about files stored in an S3 bucket,
 */
export interface IHeadObjectData {
  /**
   * The name of the file.
   */
  fileName: string;
  /**
   * The size of the file in bytes,
   */
  fileSize: number;
  /**
   * The last modified timestamp of the file
   */
  lastModified?: Date;
}
