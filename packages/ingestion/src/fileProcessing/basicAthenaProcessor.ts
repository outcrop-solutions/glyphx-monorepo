import {IFileInformation, IJoinTableDefinition} from '../interfaces/fileProcessing';
import {BasicHiveTableQueryPlanner, BasicHiveViewQueryPlanner, BasicTableSorter, BasicJoinProcessor} from './';

//eslint-disable-next-line
import {fileIngestionTypes} from 'types';

import {aws, error} from 'core';

import {FILE_STORAGE_TYPES, COMPRESSION_TYPES} from '../util/constants';

export class BasicAthenaProcessor {
  private bucketNameField: string;
  private databaseNameField: string;

  private s3Manager: aws.S3Manager;
  private athenaManager: aws.AthenaManager;
  private joinProcessor: BasicJoinProcessor;

  private inited: boolean;

  public get bucketName(): string {
    return this.bucketNameField;
  }

  public get databaseName(): string {
    return this.databaseNameField;
  }
  constructor(bucketName: string, databaseName: string) {
    this.inited = false;
    this.bucketNameField = bucketName;
    this.databaseNameField = databaseName;

    this.s3Manager = new aws.S3Manager(bucketName);
    this.athenaManager = new aws.AthenaManager(databaseName);
    this.joinProcessor = new BasicJoinProcessor();
  }

  public async init() {
    //no need to init more than once.
    if (!this.inited) {
      try {
        await this.s3Manager.init();
        await this.athenaManager.init();
        this.inited = true;
      } catch (err) {
        throw new error.InvalidArgumentError(
          'An error occured while initializing the BasicAthenaProcessor.  See the inner exception for additional information',
          ['bucketName', 'databaseName'],
          {bucketName: this.bucketName, databaseName: this.databaseName},
          err
        );
      }
    }
  }

  public async processTables(viewName: string, files: IFileInformation[]): Promise<IJoinTableDefinition[]> {
    //TODO: What to do about files that error.  I guess we can write out the others and create a view on what does pass.  Or just write the tabels but not the view, but then what would we report back to the front end.
    const tableSorter = new BasicTableSorter();
    const sortedTables = tableSorter.sortTables(files);
    const tablePlanner = new BasicHiveTableQueryPlanner(
      this.bucketName,
      FILE_STORAGE_TYPES.PARQUET,
      COMPRESSION_TYPES.GZIP
    );

    const viewPlanner = new BasicHiveViewQueryPlanner();
    const joiner = new BasicJoinProcessor();
    try {
      for (let i = 0; i < sortedTables.length; i++) {
        const file = sortedTables[i];
        const fileInfos = await this.s3Manager.listObjects(file.outputFileDirecotry);
        if (!fileInfos.length)
          throw new error.InvalidArgumentError(
            `There do not appear to be any files in the output direcotry: ${file.outputFileDirecotry} to build a table against`,
            'file.outputFileDirecotry',
            file.outputFileDirecotry
          );
        const tableName = file.tableName;
        joiner.processColumns(tableName, file.outputFileDirecotry, file.columns);
      }

      const joinInformation = joiner.joinData;

      for (let i = 0; i < joinInformation.length; i++) {
        //thse two arrays should be in the same order.

        const tableInfo = sortedTables[i];
        //if we are appending the table already exists and does not need
        //to be recreated.
        if (tableInfo.fileOperationType !== fileIngestionTypes.constants.FILE_OPERATION.APPEND) {
          const joinData = joinInformation[i];
          const tableQuery = tablePlanner.defineQuery(joinData.backingFileName, joinData.tableName, joinData);

          await this.athenaManager.runQuery(tableQuery, 60);
        }
      }

      const query = viewPlanner.defineView(viewName, joinInformation);
      await this.athenaManager.runQuery(query, 60);

      return joinInformation;
    } catch (err) {
      if (err instanceof error.GlyphxError) throw err;
      else
        throw new error.InvalidOperationError(
          'an unexpected error occurred while processing the data.  See the inner error for additional information',
          {},
          err
        );
    }
  }
}
