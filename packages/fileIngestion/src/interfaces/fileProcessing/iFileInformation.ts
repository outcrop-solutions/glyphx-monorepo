import {IFieldDefinition} from './iFieldDefinition';
/**
 * An interface which decribes useful information about
 * a file.  This is used by our transformers to communicate
 * information about the files that we process.
 */
export interface IFileInformation {
  /**
   * The name of the file.
   */
  fileName: string;

  /**
   * The name of the parquet file that this file was convertedTo
   */
  parquetFileName: string;

  /**
   * The name of the table that will be created by this file
   */
  tableName: string;

  /**
   * The output directory for the output file.
   */
  outputFileDirecotry: string;

  /**
   * The number of rows that the file contains.
   * */
  numberOfRows: number;

  /**
   * The number of columns in our file.
   * */
  numberOfColumns: number;

  /**
   * Information about our columns, i.e. name and data type.
   */
  columns: IFieldDefinition[];

  /**
   * The size of our file in bytes.
   */
  fileSize: number;
}

/**
 * Defines our callback which is passed to our FileTRansformers to recieve information about the file.
 */
export type FileInformationCallback = (
  fileInformation: IFileInformation
) => void;
