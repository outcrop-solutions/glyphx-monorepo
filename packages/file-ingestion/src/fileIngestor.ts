import {fileIngestion} from '@glyphx/types';
import {error, aws} from '@glyphx/core';
import {BasicAthenaProcessor} from '@fileProcessing';
import {Readable} from 'node:stream';
import {FileUploadManager, FileReconciliator} from './fileProcessing';

import {
  IFileInformation,
  IFileProcessingError,
  IJoinTableDefinition,
} from '@interfaces/fileProcessing';
import {generalPurposeFunctions as sharedFunctions} from '@util';
import {TableArchiver} from './fileProcessing/tableArchiver';

export class FileIngestor {
  private readonly clientIdField: string;
  private readonly modelIdField: string;
  private readonly bucketNameField: string;
  private readonly fileStatisticsField: fileIngestion.IFileStats[];
  private readonly fileInfoField: fileIngestion.IFileInfo[];
  private readonly databaseNameField: string;
  private s3Manager: aws.S3Manager;
  private athenaManager: aws.AthenaManager;
  private basicAthenaProcessor?: BasicAthenaProcessor;
  private viewRemoved: boolean;
  private readonly processedFileInformation: IFileInformation[];
  private readonly processedFileErrorInformation: IFileProcessingError[];
  private initedField: boolean;
  private readonly tableArchver: TableArchiver;

  public get isSafe() {
    if (!this.inited)
      throw new error.InvalidOperationError(
        'You must call init before perfoming this action',
        {inited: this.inited}
      );

    return true;
  }

  public get clientId() {
    return this.clientIdField;
  }
  public get modelId() {
    return this.modelIdField;
  }

  public get bucketName() {
    return this.bucketNameField;
  }

  public get fileStatistics(): fileIngestion.IFileStats[] {
    return this.fileStatisticsField;
  }

  public get fileInfo(): fileIngestion.IFileInfo[] {
    return this.fileInfoField;
  }

  public get databaseName(): string {
    return this.databaseNameField;
  }

  public get inited() {
    return this.initedField;
  }
  constructor(payload: fileIngestion.IPayload, databaseName: string) {
    this.clientIdField = payload.clientId;
    this.modelIdField = payload.modelId;
    this.bucketNameField = payload.bucketName;
    this.fileStatisticsField = payload.fileStats;
    this.fileInfoField = payload.fileInfo;

    this.databaseNameField = databaseName;
    this.initedField = false;
    this.viewRemoved = false;
    this.processedFileInformation = [];
    this.processedFileErrorInformation = [];

    this.s3Manager = new aws.S3Manager(this.bucketName);
    this.athenaManager = new aws.AthenaManager(this.databaseName);
    this.tableArchver = new TableArchiver(
      this.clientId,
      this.modelId,
      this.s3Manager as aws.S3Manager
    );
  }

  public async init() {
    if (!this.inited) {
      try {
        await this.s3Manager.init();

        await this.athenaManager.init();

        this.basicAthenaProcessor = new BasicAthenaProcessor(
          this.bucketName,
          this.databaseName
        );
        await this.basicAthenaProcessor.init();
      } catch (err) {
        throw new error.InvalidArgumentError(
          'An unexpected error occurred while initing the FileIngestor.  See the inner error for additional information',
          '',
          null,
          err
        );
      }
    }
  }

  async removeTableFromAthena(tableName: string) {
    const fullTableName = sharedFunctions.getFullTableName(
      this.clientId,
      this.modelId,
      tableName
    );

    await this.athenaManager?.dropTable(fullTableName);
  }
  async removeViewFromAthena() {
    if (!this.viewRemoved) {
      const viewName = sharedFunctions.getViewName(this.clientId, this.modelId);

      await this.athenaManager.dropView(viewName);

      this.viewRemoved = true;
    }
  }

  private async deleteTable(tableName: string) {
    await this.removeViewFromAthena();
    await this.removeTableFromAthena(tableName);
    await this.tableArchver.archiveTable(tableName);
  }

  async replaceTable(
    tableName: string,
    fileName: string,
    fileStream: Readable
  ) {
    await this.deleteTable(tableName);
    await this.addTable(
      tableName,
      fileName,
      fileStream,
      fileIngestion.constants.FILE_OPERATION.REPLACE
    );
  }

  private async appendFile(
    tableName: string,
    fileName: string,
    fileStream: Readable
  ) {
    //TODO: should I check for the append file or just trust the front end.

    await this.uploadFile(
      tableName,
      fileName,
      fileStream,
      fileIngestion.constants.FILE_OPERATION.APPEND
    );
  }

  private async addTable(
    tableName: string,
    fileName: string,
    fileStream: Readable,
    fileOperationType = fileIngestion.constants.FILE_OPERATION.ADD
  ) {
    //This is a view affecting operation so remove it if it exists
    await this.removeViewFromAthena();
    await this.uploadFile(tableName, fileName, fileStream, fileOperationType);
  }

  private async uploadFile(
    tableName: string,
    fileName: string,
    fileStream: Readable,
    fileOperationType: fileIngestion.constants.FILE_OPERATION
  ) {
    const {fileInformation, errorInformation} =
      await FileUploadManager.processAndUploadNewFiles(
        this.clientId,
        this.modelId,
        fileStream,
        tableName,
        fileName,
        fileOperationType,
        this.s3Manager
      );

    if (fileInformation) this.processedFileInformation.push(fileInformation);
    this.processedFileErrorInformation.push(...errorInformation);
  }
  public async process() {
    const needsViewUpdates = await this.processFiles();
    let joinInformation: IJoinTableDefinition[] = [];
    let fileInfoForReturn: IFileInformation[] = [];
    if (needsViewUpdates) {
      const reconFileInformation = FileReconciliator.reconcileFileInformation(
        this.clientId,
        this.modelId,
        this.fileInfo,
        this.processedFileInformation,
        this.fileStatistics
      );
      fileInfoForReturn = reconFileInformation.allFiles;
      //If we delete all of the tables we will have nothing to create.
      if (fileInfoForReturn.length) {
        joinInformation = (await this.basicAthenaProcessor?.processTables(
          sharedFunctions.getViewName(this.clientId, this.modelId),
          reconFileInformation.accumFiles
        )) as IJoinTableDefinition[];
      }
    }
    return {
      fileInformation: fileInfoForReturn,
      fileProcessingErrors: this.processedFileErrorInformation,
      joinInformation: joinInformation,
    };
  }

  private async processFiles(): Promise<boolean> {
    let viewAffectingOperations = false;
    for (let i = 0; i < this.fileInfo.length; i++) {
      const fileInformation = this.fileInfo[i];
      if (
        fileInformation.operation === fileIngestion.constants.FILE_OPERATION.ADD
      ) {
        await this.addTable(
          fileInformation.tableName,
          fileInformation.fileName,
          fileInformation.fileStream
        );
        viewAffectingOperations = true;
      } else if (
        fileInformation.operation ===
        fileIngestion.constants.FILE_OPERATION.APPEND
      ) {
        await this.appendFile(
          fileInformation.tableName,
          fileInformation.fileName,
          fileInformation.fileStream
        );
      } else if (
        fileInformation.operation ===
        fileIngestion.constants.FILE_OPERATION.REPLACE
      ) {
        await this.replaceTable(
          fileInformation.tableName,
          fileInformation.fileName,
          fileInformation.fileStream
        );
        viewAffectingOperations = true;
      } else {
        await this.deleteTable(fileInformation.tableName);
        viewAffectingOperations = true;
      }
    }
    return viewAffectingOperations;
  }
}
