import {assert} from 'chai';
import * as aws from '@aws';
import {FileIngestor} from '../fileIngestor';
import addFilesJson from './assets/addTables.json';
import replaceFilesJson from './assets/replaceTables.json';
//eslint-disable-next-line
import {fileIngestion} from 'glyphx-types';
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

describe.only('#fileProcessing', () => {
  context('Replace file to existing view', () => {
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
      bucketName = replaceFilesJson.bucketName;
      databaseName = replaceFilesJson.databaseName;
      clientId = replaceFilesJson.payload.clientId;
      modelId = replaceFilesJson.payload.modelId;
      testDataDirectory = replaceFilesJson.testDataDirectory;

      assert.isNotEmpty(bucketName);
      assert.isNotEmpty(databaseName);
      assert.isNotEmpty(clientId);
      assert.isNotEmpty(modelId);
      assert.isNotEmpty(testDataDirectory);

      payload = replaceFilesJson.payload as fileIngestion.IPayload;
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

      const query2 = `SELECT * FROM ${clientId}_${modelId}_view WHERE col1 = 63`;
      const results2 = (await athenaManager.runQuery(
        query2
      )) as unknown as any[];
      assert.strictEqual(results2.length, 0);
      console.log('I am done');
    });
  });
});
