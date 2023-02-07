import {
  IJoinTableDefinition,
  ITableQueryPlanner,
} from '@interfaces/fileProcessing';
import {FILE_STORAGE_TYPES, COMPRESSION_TYPES} from '@util/constants';
import {generalPurposeFunctions} from '@glyphx/core';
import {fileIngestion} from '@glyphx/types';

/**
 * This is our basic table query planner for hive tables (AWS Athena).  It renders the proper SQL like syntaxt to represent a suppoert file type ( parquet, csv, json etc)
 */
export class BasicHiveTableQueryPlanner implements ITableQueryPlanner {
  private queryField: string;
  private bucketNameField: string;
  private storageFormatField: FILE_STORAGE_TYPES;
  private compressionTypeField: COMPRESSION_TYPES;

  /**
   * An accessor to retrive the bucket name that the object was constructed with see {@link interfaces/fileProcessing/iTableQueryPlanner!ITableQueryPlanner.bucketName } for more information.
   */
  get bucketName(): string {
    return this.bucketNameField;
  }
  /**
   * An accessor to retrive the fileStorgeFormat that the object was constructed with see {@link interfaces/fileProcessing/iTableQueryPlanner!ITableQueryPlanner.storgeFormat } for more information.
   */
  get storageFormat(): FILE_STORAGE_TYPES {
    return this.storageFormatField;
  }

  /**
   * An accessor to retrive the compression type that the object was constructed with see {@link interfaces/fileProcessing/iTableQueryPlanner!ITableQueryPlanner.compressionType } for more information.
   */
  get compressionType(): COMPRESSION_TYPES {
    return this.compressionTypeField;
  }

  /**
   * Returns the query that was defined by the last call to {@link defineQuery} See {@link interfaces/fileProcessing/iTableQueryPlanner!ITableQueryPlanner.query } for additional information.
   */
  get query(): string {
    return this.queryField;
  }

  /**
   * constructs a new BasicHiveTableQueryPlanner object.  See {@link interfaces/fileProcessing/iTableQueryPlanner!ITableQueryPlanner } for more information.
   *
   * @param bucketName - the name of the S3 bucket that has our data.
   * @param storageFormat - the storage format (parquet, csv, json) the data is stored in.
   * @param compressionType - the type of compression used when storing the data.
   */
  constructor(
    bucketName: string,
    storageFormat: FILE_STORAGE_TYPES,
    compressionType: COMPRESSION_TYPES
  ) {
    this.queryField = '';
    this.bucketNameField = bucketName;
    this.storageFormatField = storageFormat;
    this.compressionTypeField = compressionType;
  }

  /**
   * The main processing function of this class.  It takes in our table information
   * and creates a HIVE (AWS Athena) query to create a table representaiton in glue.
   *
   * @param fileName - the name of the file we are truning into a table.
   * @param tableName - the name of the table (can be differnt that the file name)
   * @param tableData - the information about the table to be used to create it.
   */
  defineQuery(
    fileName: string,
    tableName: string,
    tableData: IJoinTableDefinition
  ): string {
    const columnDef = tableData.columns
      .map(c => {
        return `${c.columnName} ${
          c.columnType === fileIngestion.constants.FIELD_TYPE.STRING
            ? `varchar(${
                (c.columnLength ?? -1) > 65535 ? 65535 : c.columnLength ?? 100
              })`
            : c.columnType === fileIngestion.constants.FIELD_TYPE.NUMBER
            ? 'double'
            : 'bigint'
        }`;
      })
      .join(',\n');
    const storage = `STORED AS ${this.storageFormat}`;
    const location = `LOCATION 's3://${generalPurposeFunctions.string.checkAndAddTrailingSlash(
      this.bucketName
    )}${fileName}'`;
    const tableProperties = `TBLPROPERTIES ('parquet.compression'='${this.compressionType}')`;

    const retval = `CREATE EXTERNAL TABLE ${tableName} (
	    ${columnDef}
    )
    ${storage}
    ${location}
    ${tableProperties};`;
    this.queryField = retval;
    return retval;
  }
}
