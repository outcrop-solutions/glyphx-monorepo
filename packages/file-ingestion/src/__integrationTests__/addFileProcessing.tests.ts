import {assert} from 'chai';
import {aws} from '@glyphx/core';
import {FileIngestor} from '../fileIngestor';
import addFilesJson from './assets/addTables.json';
//eslint-disable-next-line
import {fileIngestion} from '@glyphx/types';
import * as fileProcessingHelpers from './fileProcessingHelpers';

describe('#fileProcessing', () => {
  context('Inbound s3 file to parquet to S3', () => {
    let s3Bucket: aws.S3Manager;
    let athenaManager: aws.AthenaManager;

    let bucketName: string;
    let databaseName: string;
    let clientId: string;
    let modelId: string;
    let testDataDirectory: string;
    let payload: fileIngestion.IPayload;
    let fileNames: string[];

    before(async () => {
      bucketName = addFilesJson.bucketName;
      databaseName = addFilesJson.databaseName;
      clientId = addFilesJson.payload.clientId;
      modelId = addFilesJson.payload.modelId;
      testDataDirectory = addFilesJson.testDataDirectory;

      assert.isNotEmpty(bucketName);
      assert.isNotEmpty(databaseName);
      assert.isNotEmpty(clientId);
      assert.isNotEmpty(modelId);
      assert.isNotEmpty(testDataDirectory);

      payload = addFilesJson.payload as fileIngestion.IPayload;
      assert.isOk(payload);

      fileNames = payload.fileStats.map(f => f.fileName);
      assert.isAtLeast(fileNames.length, 1);

      s3Bucket = new aws.S3Manager(bucketName);
      await s3Bucket.init();

      athenaManager = new aws.AthenaManager(databaseName);
      await athenaManager.init();

      await fileProcessingHelpers.cleanupAws(
        payload,
        clientId,
        modelId,
        s3Bucket,
        athenaManager
      );
      fileProcessingHelpers.loadTableStreams(testDataDirectory, payload);
    });

    after(async () => {
      await fileProcessingHelpers.cleanupAws(
        payload,
        clientId,
        modelId,
        s3Bucket,
        athenaManager
      );
    });
    it('Basic pipeline test', async () => {
      console.log('stuff spun up ok');
      const fileIngestor = new FileIngestor(payload, databaseName);
      await fileIngestor.init();
      const {joinInformation} = await fileIngestor.process();
      await fileProcessingHelpers.validateTableResults(
        joinInformation,
        athenaManager
      );
      await fileProcessingHelpers.validateViewResults(
        athenaManager,
        `${clientId}_${modelId}_view`,
        joinInformation
      );
      console.log('I am done');
    });
  });
});
