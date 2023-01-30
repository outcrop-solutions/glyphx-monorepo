import {IJoinTableDefinition} from './iJoinTableDefinition';
import {FILE_STORAGE_TYPES, COMPRESSION_TYPES} from '@util/constants';

/**
 * Our ITableQueryPlanner will process a {@link interfaces/fileProcessing/iJoinTableDefinition!IJoinTableDefinition} object
 * and create a query to pass to an external technology ( i.e. hive) to create a new table
 */
export interface ITableQueryPlanner {
  /**
   * an accessor to retreive our query.  This will allow our ITableQueryPlanner
   * implementations to maintain state between calls (rather than just make define query static)
   */
  get query(): string;

  /**
   * an acessor to retreive the name of the bucket with which
   * this object was constructed.
   */
  get bucketName(): string;

  /**
   * an acessor to retreive the FILE_STORAGE_TYPES with which
   * this object was constructed.
   */
  get storageFormat(): FILE_STORAGE_TYPES;

  /**
   * an acessor to retreive the COMPRESSION_TYPES with which
   * this object was constructed.
   */
  get compressionType(): COMPRESSION_TYPES;
  /**
   * actually does the work.  It takes in table data and processes it into a string.
   *
   * @param fileName - the name of the folder which holds the file(s) to be added to the database.  For Athena implementtions this should be a prefix ending with a '/'.
   * @param tableName - the name of the table to create.
   * @param tableData - the table information to use to create the table.
   *
   * @throws error.InvalidArgumentError if something is not well formed in the tableData parameter.
   * @throws error.InvalidOperationError if an illegal join is attempted -- an implimentor may choose to
   * throw this error if a circular join exists.  I don't know, options people.
   */
  defineQuery(
    fileName: string,
    tableName: string,
    tableData: IJoinTableDefinition
  ): string;
}

/**
 * Defines how an implimentor of IQueryPlanner is constructed.  This allows us dependecy injection
 * to compose our file processing pipeline.
 */
export interface IConstructableTableQueryPlanner {
  /**
   * the constructor
   *
   * @param bucketName - the name of the S3 bucket which houses the data
   * @param storageFormat - the file format of the backend file.
   * @param - the compression type used to compress the file
   */
  new (
    bucketName: string,
    storageFormat: FILE_STORAGE_TYPES,
    compressionType: COMPRESSION_TYPES
  ): ITableQueryPlanner;
}
