import {fileIngestion} from '@glyphx/types';
import {error, streams, generalPurposeFunctions, aws} from '@glyphx/core';
import {
  BasicFileTransformer,
  BasicParquetProcessor,
  BasicColumnNameCleaner,
} from './';
import {BasicFieldTypeCalculator} from '../fieldProcessing';
import {Readable, PassThrough} from 'node:stream';
import * as csv from 'csv';
import {
  IFileInformation,
  IFileProcessingError,
} from '../interfaces/fileProcessing';
import {tableService} from '@glyphx/business';

export class FileUploadManager {
  private static creatBaseStream(fileStream: Readable) {
    const csvStream = csv.parse({columns: true, delimiter: ','});
    const splitStream = new streams.ForkingStream(fileStream, csvStream);
    return splitStream;
  }
  private static createCsvStream(
    csvFileName: string,
    s3Manager: aws.S3Manager,
    splitStream: streams.ForkingStream
  ) {
    const csvStringify = csv.stringify({quoted: true});
    const passThrough = new PassThrough({objectMode: true});
    const upload = s3Manager.getUploadStream(csvFileName, passThrough);
    splitStream.fork('csvWriter', csvStringify, passThrough);
    return upload;
  }
  private static createParquetStream(
    fileName: string,
    parquetFileName: string,
    parquetPath: string,
    tableName: string,
    fileOperationType: fileIngestion.constants.FILE_OPERATION,
    splitStream: streams.ForkingStream,
    s3Manager: aws.S3Manager,
    processedFileInformation: IFileInformation,
    processedFileErrorInformation: IFileProcessingError[],
    startingRowId: number
  ) {
    const fileTransformer = new BasicFileTransformer(
      fileName,
      parquetFileName,
      parquetPath,
      tableName,
      fileOperationType,
      input => {
        processedFileInformation.columns = input.columns;
        processedFileInformation.fileOperationType = input.fileOperationType;
        processedFileInformation.tableName = input.tableName;
        processedFileInformation.parquetFileName = input.parquetFileName;
        processedFileInformation.outputFileDirecotry =
          input.outputFileDirecotry;
        processedFileInformation.fileName = input.fileName;
        processedFileInformation.fileSize = input.fileSize;
        processedFileInformation.numberOfColumns = input.numberOfColumns;
        processedFileInformation.numberOfRows = input.numberOfRows;
      },
      input => {
        processedFileErrorInformation.push(input);
      },
      BasicFieldTypeCalculator,
      BasicColumnNameCleaner,
      startingRowId
    );
    const parquetWriter = new BasicParquetProcessor();
    const passThrough2 = new PassThrough();

    splitStream.fork(
      'parquetWriter',
      fileTransformer,
      parquetWriter,
      passThrough2
    );
    const parquetUpload = s3Manager.getUploadStream(
      parquetPath + parquetFileName,
      passThrough2
    );
    return {
      parquetUpload,
    };
  }

  private static getParquetFileName(
    csvFileName: string,
    clientId: string,
    modelId: string,
    tableName: string
  ) {
    const deconstructedOutputFileName =
      generalPurposeFunctions.string.deconstructFilePath(csvFileName);

    const parquetPath =
      generalPurposeFunctions.fileIngestion.getTableParquetPath(
        clientId,
        modelId,
        tableName
      );
    const parquetFileName = deconstructedOutputFileName.baseName + '.parquet';
    return {parquetFileName, parquetPath};
  }

  public static async processAndUploadNewFiles(
    clientId: string,
    modelId: string,
    fileStream: Readable,
    tableName: string,
    fileName: string,
    fileOperationType: fileIngestion.constants.FILE_OPERATION,
    s3Manager: aws.S3Manager
  ) {
    try {
      const csvFileName =
        generalPurposeFunctions.fileIngestion.getTableCsvPath(
          clientId,
          modelId,
          tableName
        ) + fileName;
      const splitStream = FileUploadManager.creatBaseStream(fileStream);

      //Create our fork for the csv stream
      const csvUpload = FileUploadManager.createCsvStream(
        csvFileName,
        s3Manager,
        splitStream
      );

      //create our fork for our parquet file
      const {parquetFileName, parquetPath} =
        FileUploadManager.getParquetFileName(
          csvFileName,
          clientId,
          modelId,
          tableName
        );

      const processedFileInformation: IFileInformation = {} as IFileInformation;
      const processedFileErrorInformation: IFileProcessingError[] = [];
      const startingRowId =
        fileOperationType !== fileIngestion.constants.FILE_OPERATION.APPEND
          ? 0
          : await FileUploadManager.getMaxRowId(clientId, modelId, tableName);
      const {parquetUpload} = FileUploadManager.createParquetStream(
        fileName,
        parquetFileName,
        parquetPath,
        tableName,
        fileOperationType,
        splitStream,
        s3Manager,
        processedFileInformation,
        processedFileErrorInformation,
        startingRowId
      );
      splitStream.startPipeline();
      //Calling done here is important as it
      //will pull all errors into the main thread and
      //so that they can be caught.
      //We have to wait for our uploads to finish as they are not part of the forked stream.
      await Promise.all([csvUpload.done(), parquetUpload.done()]);

      return {
        fileInformation: processedFileInformation,
        errorInformation: processedFileErrorInformation,
      };
    } catch (err) {
      throw new error.InvalidOperationError(
        'An unexpected error occurred while uploading the file.  See the inner error for additional information',
        {},
        err
      );
    }
  }

  static async getMaxRowId(
    clientId: string,
    modelId: string,
    tableName: string
  ): Promise<number> {
    const fullTableName =
      generalPurposeFunctions.fileIngestion.getFullTableName(
        clientId,
        modelId,
        tableName
      );
    const maxRowId = await tableService.getMaxRowId(fullTableName);
    return maxRowId;
  }
}
