import {assert} from 'chai';
import { aws } from '@glyphx/core';
import {FileIngestor} from '../fileIngestor';
import addFilesJson from './assets/addTables.json';
import appendFilesJson from './assets/appendTables.json';
//eslint-disable-next-line
import {fileIngestion} from '@glyphx/types';
import * as fileProcessingHelpers from './fileProcessingHelpers';

async function setupExistingAssets() {
  const payload = addFilesJson.payload as fileIngestion.IPayload;
  fileProcessingHelpers.loadTableStreams(
    addFilesJson.testDataDirectory,
    payload
  );
  const fileIngestor = new FileIngestor(payload, addFilesJson.databaseName);
  await fileIngestor.init();
  await fileIngestor.process();
}

describe('#fileProcessing', () => {
  context('Append file to existing view', () => {
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
      bucketName = appendFilesJson.bucketName;
      databaseName = appendFilesJson.databaseName;
      clientId = appendFilesJson.payload.clientId;
      modelId = appendFilesJson.payload.modelId;
      testDataDirectory = appendFilesJson.testDataDirectory;

      assert.isNotEmpty(bucketName);
      assert.isNotEmpty(databaseName);
      assert.isNotEmpty(clientId);
      assert.isNotEmpty(modelId);
      assert.isNotEmpty(testDataDirectory);

      payload = appendFilesJson.payload as fileIngestion.IPayload;
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
      await setupExistingAssets();
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
      const query = `SELECT * FROM ${clientId}_${modelId}_view WHERE col1 = 163`;
      const results = (await athenaManager.runQuery(query)) as unknown as any[];
      assert.isAtLeast(results.length, 1);
      console.log('I am done');
    });
  });
});
