import {fileIngestion} from '@glyphx/types';
import {error, streams, generalPurposeFunctions, aws} from '@glyphx/core';
import {
  BasicAthenaProcessor,
  BasicFileTransformer,
  BasicParquetProcessor,
  BasicColumnNameCleaner,
} from '@fileProcessing';
import {BasicFieldTypeCalculator} from '@fieldProcessing';
import {Readable, PassThrough} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import * as csv from 'csv';
import {
  IFileInformation,
  IFileProcessingError,
  IJoinTableDefinition,
} from '@interfaces/fileProcessing';

export class FileIngestor {
  private readonly clientIdField: string;
  private readonly modelIdField: string;
  private readonly bucketNameField: string;
  private readonly fileStatisticsField: fileIngestion.IFileStats[];
  private readonly fileInfoField: fileIngestion.IFileInfo[];
  private readonly databaseNameField: string;
  private s3Manager?: aws.S3Manager;
  private athenaManager?: aws.AthenaManager;
  private basicAthenaProcessor?: BasicAthenaProcessor;
  private viewRemoved: boolean;
  private readonly processedFileInformation: IFileInformation[];
  private readonly processedFileErrorInformation: IFileProcessingError[];
  private initedField: boolean;

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

  public get fileStatistics() {
    return this.fileStatisticsField;
  }

  public get fileInfo() {
    return this.fileInfoField;
  }

  public get databaseName() {
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
  }

  public async init() {
    if (!this.inited) {
      try {
        this.s3Manager = new aws.S3Manager(this.bucketName);
        await this.s3Manager.init();

        this.athenaManager = new aws.AthenaManager(this.databaseName);
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

  private fileInformationCallback(input: IFileInformation) {
    //input.tableName = this.getFullTableName(input.tableName);
    this.processedFileInformation.push(input);
  }

  private fileErrorProcessingCallback(input: IFileProcessingError) {
    this.processedFileErrorInformation.push(input);
  }

  private getTableCsvPath(tableName: string): string {
    return `client/${this.clientId}/${this.modelId}/input/${tableName}/`;
  }

  private getTableParquetPath(tableName: string): string {
    return `client/${this.clientId}/${this.modelId}/data/${tableName}/`;
  }
  private getArchiveFilePath(key: string, timestamp: string) {
    const deconstructedFilePath =
      generalPurposeFunctions.string.deconstructFilePath(key);
    const src = deconstructedFilePath.pathParts[2];
    const tableName = deconstructedFilePath.pathParts[3];
    const fileName = deconstructedFilePath.fileName;

    //client/clientId/archive/moedlId/20221213091632/input/table1/table1.csv
    const retval = `client/${this.clientId}/archive/${this.modelId}/${timestamp}/${src}/${tableName}/${fileName}`;

    return retval;
  }
  async archiveFile(key: string, timestamp: string) {
    const archivePath = this.getArchiveFilePath(key, timestamp);

    const srcStream = await this.s3Manager?.getObjectStream(key);
    const passThrough = new PassThrough();

    const uploader = this.s3Manager?.getUploadStream(archivePath, passThrough);

    pipeline(srcStream, passThrough);

    await uploader?.done();

    await this.s3Manager?.removeObject(key);
  }

  private getFullTableName(tableName: string) {
    return `${this.clientId}_${this.modelId}_${tableName}`;
  }
  private getViewName() {
    return `${this.clientId}_${this.modelId}_view`;
  }

  async removeTableFromAthena(tableName: string) {
    const fullTableName = this.getFullTableName(tableName);

    const dropQuery = `DROP TABLE IF EXISTS ${fullTableName}`;

    await this.athenaManager?.runQuery(dropQuery);
  }
  async removeViewFromAthena() {
    if (!this.viewRemoved) {
      const viewName = this.getViewName();
      const dropQuery = `DROP VIEW IF EXISTS ${viewName}`;

      await this.athenaManager?.runQuery(dropQuery);

      this.viewRemoved = true;
    }
  }
  private async archiveFiles(
    path: string,
    tableName: string,
    timeStamp: string
  ) {
    const fileList = await this.s3Manager?.listObjects(path);

    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        const key = fileList[i];
        await this.archiveFile(key, timeStamp);
      }
    }
  }
  private async archiveCsvFiles(tableName: string, timeStamp: string) {
    const csvPath = this.getTableCsvPath(tableName);
    await this.archiveFiles(csvPath, tableName, timeStamp);
  }
  private async archiveParquetFiles(tableName: string, timeStamp: string) {
    const parquetPath = this.getTableParquetPath(tableName);
    await this.archiveFiles(parquetPath, tableName, timeStamp);
  }
  private async processAndUploadNewFiles(
    fileStream: Readable,
    tableName: string,
    fileName: string,
    fileOperationType: fileIngestion.constants.FILE_OPERATION
  ) {
    const csvStream = csv.parse({columns: true, delimiter: ','});
    const splitStream = new streams.ForkingStream(fileStream, csvStream);

    //Create our fork for the csv stream
    const csvStringify = csv.stringify({quoted: true});
    const outputFileName = this.getTableCsvPath(tableName) + fileName;
    const passThrough = new PassThrough({objectMode: true});
    const upload1 = this.s3Manager?.getUploadStream(
      outputFileName,
      passThrough
    );
    splitStream.fork('csvWriter', csvStringify, passThrough);

    //create our fork for our parquet file
    const deconstructedOutputFileName =
      generalPurposeFunctions.string.deconstructFilePath(outputFileName);

    const parquetPath = this.getTableParquetPath(tableName);
    const parquetFileName = deconstructedOutputFileName.baseName + '.parquet';
    const fileTransformer = new BasicFileTransformer(
      fileName,
      999999,
      parquetFileName,
      parquetPath,
      tableName,
      fileOperationType,
      this.fileInformationCallback.bind(this),
      this.fileErrorProcessingCallback.bind(this),
      BasicFieldTypeCalculator,
      BasicColumnNameCleaner
    );
    const parquetWriter = new BasicParquetProcessor();
    const passThrough2 = new PassThrough();

    splitStream.fork(
      'parquetWriter',
      fileTransformer,
      parquetWriter,
      passThrough2
    );
    const upload2 = this.s3Manager?.getUploadStream(
      parquetPath + parquetFileName,
      passThrough2
    );

    splitStream.startPipeline();
    await Promise.all([upload1?.done(), upload2?.done()]);
  }

  private async deleteTable(tableName: string, timeStamp: string) {
    await this.removeViewFromAthena();
    await this.removeTableFromAthena(tableName);
    await this.archiveCsvFiles(tableName, timeStamp);
    await this.archiveParquetFiles(tableName, timeStamp);
  }

  async replaceTable(
    tableName: string,
    fileName: string,
    fileStream: Readable,
    timeStamp: string
  ) {
    await this.removeViewFromAthena();
    await this.removeTableFromAthena(tableName);
    await this.archiveCsvFiles(tableName, timeStamp);
    await this.archiveParquetFiles(tableName, timeStamp);

    await this.processAndUploadNewFiles(
      fileStream,
      tableName,
      fileName,
      fileIngestion.constants.FILE_OPERATION.REPLACE
    );
  }

  private async appendFile(
    tableName: string,
    fileName: string,
    fileStream: Readable
  ) {
    //TODO: should I check for the append file or just trust the front end.
    await this.processAndUploadNewFiles(
      fileStream,
      tableName,
      fileName,
      fileIngestion.constants.FILE_OPERATION.APPEND
    );
  }
  private async addTable(
    tableName: string,
    fileName: string,
    fileStream: Readable
  ) {
    //This is a view affecting operation so remove it if it exists
    await this.removeViewFromAthena();
    await this.processAndUploadNewFiles(
      fileStream,
      tableName,
      fileName,
      fileIngestion.constants.FILE_OPERATION.ADD
    );
  }
  public async process() {
    const needsViewUpdates = await this.processFiles();
    let joinInformation: IJoinTableDefinition[] = [];
    let fileInfoForReturn: IFileInformation[] = [];
    if (needsViewUpdates) {
      const reconFileInformation = this.reconcileFileInformation();
      fileInfoForReturn = reconFileInformation.allFiles;
      //If we delete all of the tables we will have nothing to create.
      if (fileInfoForReturn.length) {
        joinInformation = (await this.basicAthenaProcessor?.processTables(
          this.getViewName(),
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
  private reconcileFileInformation(): {
    allFiles: IFileInformation[];
    accumFiles: IFileInformation[];
  } {
    const fileInfos: IFileInformation[] = [];

    const deletedTableNames = this.fileInfo
      .filter(
        d => d.operation === fileIngestion.constants.FILE_OPERATION.DELETE
      )
      .map(d => d.tableName);

    this.fileInfo.forEach(f => {
      if (f.operation === fileIngestion.constants.FILE_OPERATION.DELETE) return;
      const fileStats =
        this.processedFileInformation.find(
          fi => fi.tableName === f.tableName && fi.fileName === f.fileName
        ) ||
        (this.fileStatistics.find(
          fi => fi.tableName === f.tableName && fi.fileName === f.fileName
        ) as unknown as IFileInformation);
      fileInfos.push(fileStats);
    });

    this.fileStatistics.forEach(f => {
      const fInfo = f as unknown as IFileInformation;
      //we do not want any deleted tables
      if (deletedTableNames.find(d => d === f.tableName)) return;
      if (
        !fileInfos.find(
          fi => fi.tableName === f.tableName && fi.fileName === f.fileName
        )
      ) {
        //these are essentially no-ops for the Athena Proceser.  This will make sure that they are included in the view, but the table wwill not be regenerated.
        fInfo.fileOperationType = fileIngestion.constants.FILE_OPERATION.APPEND;
        fileInfos.push(fInfo);
      }
    });

    const groupedByTable = fileInfos.reduce((group, fileInfo) => {
      const {tableName} = fileInfo;
      const fullTableName = this.getFullTableName(tableName);
      group[fullTableName] = group[fullTableName] ?? [];
      group[fullTableName].push(fileInfo);
      return group;
    }, {} as Record<string, IFileInformation[]>);

    const retval: IFileInformation[] = [];

    for (const key in groupedByTable) {
      const mappedData = groupedByTable[key].reduce(
        (accum, g) => {
          accum.numberOfRows += g.numberOfRows;
          accum.fileSize += g.fileSize;
          if (
            accum.numberOfColumns === 0 ||
            g.fileOperationType > accum.fileOperationType
          ) {
            accum.numberOfColumns = g.numberOfColumns;
            accum.columns = g.columns;
            accum.fileOperationType = g.fileOperationType;
          }

          if (!accum.outputFileDirecotry)
            accum.outputFileDirecotry = g.outputFileDirecotry;

          return accum;
        },
        {
          tableName: key,
          fileName: '', //Doesn't matter in this context
          parquetFileName: '', //Doesn't matter in this context
          outputFileDirecotry: '', //Will get set above
          numberOfRows: 0,
          numberOfColumns: 0,
          columns: [],
          fileSize: 0,
          fileOperationType: fileIngestion.constants.FILE_OPERATION.DELETE,
        } as IFileInformation
      );

      retval.push(mappedData);
    }

    return {allFiles: fileInfos, accumFiles: retval};
  }

  private async processFiles(): Promise<boolean> {
    const operationTimeStamp = generalPurposeFunctions.date.getTimeStamp();
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
          fileInformation.fileStream,
          operationTimeStamp
        );
        viewAffectingOperations = true;
      } else {
        await this.deleteTable(fileInformation.tableName, operationTimeStamp);
        viewAffectingOperations = true;
      }
    }
    return viewAffectingOperations;
  }
}
