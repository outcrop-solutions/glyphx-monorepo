import {
  aws,
  error,
  generalPurposeFunctions as coreFunctions,
} from '@glyphx/core';
import {generalPurposeFunctions} from '@util';
import {PassThrough} from 'stream';
import {pipeline} from 'node:stream/promises';

interface IArchivedFileInformation {
  fileName: string;
  archiveFileName: string;
}

interface IArchivedTableInformation {
  tableName: string;
  timeStamp: string;
  affectedFiles: IArchivedFileInformation[];
}
export class TableArchiver {
  private readonly clientId: string;
  private readonly modelId: string;
  private readonly s3Manager: aws.S3Manager;
  private readonly timeStamp: string;

  public get isSafe(): boolean {
    if (!this.s3Manager.inited)
      throw new error.InvalidOperationError(
        'The supplied S3Manager, must be inited before calling methods on this class',
        {s3Manager: {inited: false}}
      );
    return true;
  }

  constructor(clientId: string, modelId: string, s3Manager: aws.S3Manager) {
    this.clientId = clientId;
    this.modelId = modelId;
    this.s3Manager = s3Manager;
    this.timeStamp = coreFunctions.date.getTimeStamp();
  }

  public async archiveFile(
    key: string,
    timestamp: string
  ): Promise<IArchivedFileInformation> {
    this.isSafe;
    const archivePath = generalPurposeFunctions.getArchiveFilePath(
      this.clientId,
      this.modelId,
      key,
      timestamp
    );
    try {
      const srcStream = await this.s3Manager?.getObjectStream(key);
      const passThrough = new PassThrough();

      const uploader = this.s3Manager?.getUploadStream(
        archivePath,
        passThrough
      );

      pipeline(srcStream, passThrough);
      await uploader?.done();

      await this.s3Manager?.removeObject(key);
    } catch (err) {
      throw new error.InvalidOperationError(
        'An unexpected error occurred while archiving the file,  See the inner error for additional information',
        {
          fileName: key,
          archiveFileName: archivePath,
          s3BucketName: this.s3Manager.bucketName,
        },
        err
      );
    }
    return {fileName: key, archiveFileName: archivePath};
  }

  public async archiveTable(
    tableName: string
  ): Promise<IArchivedTableInformation> {
    const retval: IArchivedTableInformation = {
      tableName: tableName,
      timeStamp: this.timeStamp,
      affectedFiles: [],
    };
    this.isSafe;
    try {
      const csvPath = generalPurposeFunctions.getTableCsvPath(
        this.clientId,
        this.modelId,
        tableName
      );
      const parquetPath = generalPurposeFunctions.getTableParquetPath(
        this.clientId,
        this.modelId,
        tableName
      );
      const fileList = await this.s3Manager.listObjects(csvPath);
      fileList.push(...(await this.s3Manager.listObjects(parquetPath)));

      if (fileList.length) {
        for (let i = 0; i < fileList.length; i++) {
          const key = fileList[i];
          const archiveResult = await this.archiveFile(key, this.timeStamp);
          retval.affectedFiles.push(archiveResult);
        }
      }
    } catch (err) {
      throw new error.InvalidOperationError(
        `An unexpected error occurred while archiving the files for table ${tableName}.  We have immediately suspended processing, but the table may be in an unusable state.  See the inner errors for additional information`,
        {processingInformation: retval},
        err
      );
    }

    return retval;
  }
}
