import {fileIngestion} from '@glyphx/types';
import {error, aws, generalPurposeFunctions} from '@glyphx/core';
import {Readable} from 'node:stream';
import {
  BasicAthenaProcessor,
  FileUploadManager,
  FileReconciliator,
} from './fileProcessing';
import {
  projectService,
  Initializer as businessLogicInit,
} from '@glyphx/business';

import {
  IFileInformation,
  IFileProcessingError,
  IJoinTableDefinition,
  IFileProcessingResult,
} from '@interfaces/fileProcessing';
import {TableArchiver} from './fileProcessing/tableArchiver';
import {
  FILE_PROCESSING_ERROR_TYPES,
  FILE_PROCESSING_STATUS,
} from '@util/constants';

export class FileIngestor {
  private readonly clientIdField: string;
  private readonly modelIdField: string;
  private readonly bucketNameField: string;
  private fileStatisticsField: fileIngestion.IFileStats[];
  private readonly fileInfoField: fileIngestion.IFileInfo[];
  private readonly databaseNameField: string;
  private readonly s3Manager: aws.S3Manager;
  private readonly athenaManager: aws.AthenaManager;
  private readonly basicAthenaProcessor: BasicAthenaProcessor;
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
    this.fileInfoField = payload.fileInfo;

    this.databaseNameField = databaseName;
    this.initedField = false;
    this.viewRemoved = false;
    this.processedFileInformation = [];
    this.processedFileErrorInformation = [];

    this.s3Manager = new aws.S3Manager(this.bucketName);
    this.athenaManager = new aws.AthenaManager(this.databaseName);
    this.basicAthenaProcessor = new BasicAthenaProcessor(
      this.bucketName,
      this.databaseName
    );
    this.tableArchver = new TableArchiver(
      this.clientId,
      this.modelId,
      this.s3Manager as aws.S3Manager
    );

    this.fileStatisticsField = [];
  }

  public async init() {
    if (!this.inited) {
      try {
        await this.s3Manager.init();

        await this.athenaManager.init();

        await this.basicAthenaProcessor.init();
        //TODO: set our file statistics here
        await businessLogicInit.init();
        this.fileStatisticsField = await projectService.getProjectFileStats(
          this.modelId
        );
      } catch (err) {
        throw new error.InvalidArgumentError(
          'An unexpected error occurred while initing the FileIngestor.  See the inner error for additional information',
          '',
          null,
          err
        );
      }
      this.initedField = true;
    }
  }

  async removeTableFromAthena(tableName: string) {
    const fullTableName =
      generalPurposeFunctions.fileIngestion.getFullTableName(
        this.clientId,
        this.modelId,
        tableName
      );

    await this.athenaManager.dropTable(fullTableName);
  }

  async removeViewFromAthena() {
    if (!this.viewRemoved) {
      const viewName = generalPurposeFunctions.fileIngestion.getViewName(
        this.clientId,
        this.modelId
      );

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

    this.processedFileInformation.push(fileInformation);
    this.processedFileErrorInformation.push(...errorInformation);
  }

  /**
   * Basically this method will try to head off a client doing bad things.
   * The logic here is intentionally concervative.  While running delete
   * on a non-existant table is possible, or just adding when replace is
   * called on a table that doesn't exist.  I do not want to get into the
   * habit of just letting the front end get away with sloppy implementations.
   * Being conservative will allow us to identify issues which may cause
   * problems down the road by not guessing what the implimentor was
   * thinking.
   */
  private async reconcileFileInfo(): Promise<IFileProcessingError[]> {
    const retval: IFileProcessingError[] = [];
    const addedFileNames: string[] = [];
    const processedTableFiles: {fileName: string; tableName: string}[] = [];
    for (let i = 0; i < this.fileInfo.length; i++) {
      const fileInfo = this.fileInfo[i];
      if (
        processedTableFiles.find(
          a =>
            a.tableName === fileInfo.tableName &&
            a.fileName === fileInfo.fileName
        )
      ) {
        const message = `A file/table combinatoin for clientId: ${this.clientId}, modelId: ${this.modelId}, tableName: ${fileInfo.tableName}, fileName: ${fileInfo.fileName} has already been checked for processing.  Each fileName/TableName combination must be unique`;
        retval.push({
          fileName: fileInfo.fileName,
          tableName: fileInfo.tableName,
          errorType: FILE_PROCESSING_ERROR_TYPES.INVALID_TABLE_SET,
          message: message,
        });
      } else if (
        fileInfo.operation === fileIngestion.constants.FILE_OPERATION.ADD
      ) {
        if (
          await this.athenaManager.tableExists(
            generalPurposeFunctions.fileIngestion.getFullTableName(
              this.clientId,
              this.modelId,
              fileInfo.tableName
            )
          )
        ) {
          const message = `A table for clientId: ${this.clientId}, modelId: ${this.modelId}, tableName: ${fileInfo.tableName} aready exits in the database.  You must remove it before adding or call replace`;
          retval.push({
            fileName: fileInfo.fileName,
            tableName: fileInfo.tableName,
            errorType: FILE_PROCESSING_ERROR_TYPES.TABLE_ALREADY_EXISTS,
            message: message,
          });
        } else if (addedFileNames.find(f => f === fileInfo.tableName)) {
          const message = `A table for clientId: ${this.clientId}, modelId: ${this.modelId}, tableName: ${fileInfo.tableName} has already been flagged for add on this set of operations. A Second add does not make sense`;
          retval.push({
            fileName: fileInfo.fileName,
            tableName: fileInfo.tableName,
            errorType: FILE_PROCESSING_ERROR_TYPES.INVALID_TABLE_SET,
            message: message,
          });
        } else {
          addedFileNames.push(fileInfo.tableName);
        }
        //An append can be called if we are plannig on adding a table in this operation.
      } else if (
        fileInfo.operation === fileIngestion.constants.FILE_OPERATION.APPEND
      ) {
        if (
          !(await this.athenaManager.tableExists(
            generalPurposeFunctions.fileIngestion.getFullTableName(
              this.clientId,
              this.modelId,
              fileInfo.tableName
            )
          )) &&
          !addedFileNames.find(f => f === fileInfo.tableName)
        ) {
          const message = `A table for clientId: ${this.clientId}, modelId: ${this.modelId}, tableName: ${fileInfo.tableName} does not exits in the database.  You cannot append a file to a non existant table`;
          retval.push({
            fileName: fileInfo.fileName,
            tableName: fileInfo.tableName,
            errorType: FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST,
            message: message,
          });
        } else {
          const fileName =
            generalPurposeFunctions.fileIngestion.getTableParquetPath(
              this.clientId,
              this.modelId,
              fileInfo.tableName
            ) + fileInfo.fileName;
          if (await this.s3Manager.fileExists(fileName)) {
            const message = `A file for clientId: ${this.clientId}, modelId: ${this.modelId}, tableName: ${fileInfo.tableName}, fileeName: ${fileInfo.fileName} Has allready been uploaded.  You can append a new file, but you cannot overwrite an existing file.`;
            retval.push({
              fileName: fileInfo.fileName,
              tableName: fileInfo.tableName,
              errorType: FILE_PROCESSING_ERROR_TYPES.FILE_ALREADY_EXISTS,
              message: message,
            });
          }
        }
      } else if (
        fileInfo.operation === fileIngestion.constants.FILE_OPERATION.REPLACE &&
        !(await this.athenaManager.tableExists(
          generalPurposeFunctions.fileIngestion.getFullTableName(
            this.clientId,
            this.modelId,
            fileInfo.tableName
          )
        ))
      ) {
        const message = `A table for clientId: ${this.clientId}, modelId: ${this.modelId}, tableName: ${fileInfo.tableName} does not exits in the database.  You cannot replace a table that does not exist `;
        retval.push({
          fileName: fileInfo.fileName,
          tableName: fileInfo.tableName,
          errorType: FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST,
          message: message,
        });
      } else if (
        fileInfo.operation === fileIngestion.constants.FILE_OPERATION.DELETE &&
        !(await this.athenaManager.tableExists(
          generalPurposeFunctions.fileIngestion.getFullTableName(
            this.clientId,
            this.modelId,
            fileInfo.tableName
          )
        ))
      ) {
        const message = `A table for clientId: ${this.clientId}, modelId: ${this.modelId}, tableName: ${fileInfo.tableName} does not exits in the database.  You cannot delete a table that does not exist `;
        retval.push({
          fileName: fileInfo.fileName,
          tableName: fileInfo.tableName,
          errorType: FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST,
          message: message,
        });
      }

      processedTableFiles.push({
        fileName: fileInfo.fileName,
        tableName: fileInfo.tableName,
      });
    }

    return retval;
  }

  private async processFiles(): Promise<boolean> {
    let viewAffectingOperations = false;
    for (let i = 0; i < this.fileInfo.length; i++) {
      const fileInformation = this.fileInfo[i];
      if (
        fileInformation.operation === fileIngestion.constants.FILE_OPERATION.ADD
      ) {
        //1. Adding a table starts at rowid = 0
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
        //2. Appending a file will require that we get the row id.
        await this.appendFile(
          fileInformation.tableName,
          fileInformation.fileName,
          fileInformation.fileStream
        );
      } else if (
        fileInformation.operation ===
        fileIngestion.constants.FILE_OPERATION.REPLACE
      ) {
        //3. Replace will drop and start over so rowid starts at 0
        await this.replaceTable(
          fileInformation.tableName,
          fileInformation.fileName,
          fileInformation.fileStream
        );
        viewAffectingOperations = true;
      } else {
        //4. no need for rowid here.
        await this.deleteTable(fileInformation.tableName);
        viewAffectingOperations = true;
      }
    }
    return viewAffectingOperations;
  }

  public async process(): Promise<IFileProcessingResult> {
    let joinInformation: IJoinTableDefinition[] = [];
    let fileInfoForReturn: fileIngestion.IFileStats[] = [];
    let processingResults = FILE_PROCESSING_STATUS.UNKNOWN;
    const viewName = generalPurposeFunctions.fileIngestion.getViewName(
      this.clientId,
      this.modelId
    );
    const errors: IFileProcessingError[] = await this.reconcileFileInfo();
    if (errors.length) {
      this.processedFileErrorInformation.push(...errors);
      fileInfoForReturn = this.fileStatistics;
      processingResults = FILE_PROCESSING_STATUS.ERROR;
    } else {
      try {
        const needsViewUpdates = await this.processFiles();
        if (needsViewUpdates) {
          const reconFileInformation =
            FileReconciliator.reconcileFileInformation(
              this.clientId,
              this.modelId,
              this.fileInfo,
              this.processedFileInformation,
              this.fileStatistics
            );
          fileInfoForReturn = reconFileInformation.allFiles;
          //If we delete all of the tables we will have nothing to create.
          if (fileInfoForReturn.length) {
            //5. We will need to update the view so that we selct the row id as the rowid from the left most column.
            joinInformation = (await this.basicAthenaProcessor?.processTables(
              generalPurposeFunctions.fileIngestion.getViewName(
                this.clientId,
                this.modelId
              ),
              reconFileInformation.accumFiles
            )) as IJoinTableDefinition[];
          }
        } else {
          fileInfoForReturn = this.fileStatistics;
        }
        processingResults = this.processedFileErrorInformation.length
          ? FILE_PROCESSING_STATUS.WARNING
          : FILE_PROCESSING_STATUS.OK;
        await projectService.updateProject(this.modelId, {
          files: fileInfoForReturn,
          viewName: viewName,
        });
      } catch (err) {
        const message = `An unexpected error occurred while processing the files.  See the inner errors for additional information: ${err}`;
        this.processedFileErrorInformation.push({
          fileName: 'unknown',
          message: message,
          errorType: FILE_PROCESSING_ERROR_TYPES.UNEXPECTED_ERROR,
        });
        if (err instanceof error.GlyphxError) {
          err.publish();
        } else {
          new error.GlyphxError(message, 999, err, 'UnexpectedError').publish();
        }
        processingResults = FILE_PROCESSING_STATUS.ERROR;
      }
    }

    return {
      fileInformation: fileInfoForReturn,
      fileProcessingErrors: this.processedFileErrorInformation,
      joinInformation: joinInformation,
      status: processingResults,
      viewName: viewName,
    };
  }
}
