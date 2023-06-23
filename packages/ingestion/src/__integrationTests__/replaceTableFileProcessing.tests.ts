import {assert} from 'chai';
import {aws, generalPurposeFunctions} from '@glyphx/core';
import {FileIngestor} from '../fileIngestor';
import addFilesJson from './assets/addTables.json';
import replaceFilesJson from './assets/replaceTables.json';
//eslint-disable-next-line
import {fileIngestion} from '@glyphx/types';
import * as fileProcessingHelpers from './fileProcessingHelpers';

import {config} from '../config';
import {
  Initializer,
  processTrackingService,
  dbConnection,
} from '@glyphx/business';
import {v4} from 'uuid';

const UNIQUE_KEY = v4().replaceAll('-', '');
const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
const PROCESS_ID2 = generalPurposeFunctions.processTracking.getProcessId();
const PROCESS_NAME = 'addFileProcessing' + UNIQUE_KEY;

const INPUT_PROJECT = {
  name: 'testProject' + UNIQUE_KEY,
  sdtPath: 'testsdtPath' + UNIQUE_KEY,
  organization: {},
  slug: 'testSlug' + UNIQUE_KEY,
  template: {},
  owner: {},
  state: {},
  files: [],
};
async function setupExistingAssets() {
  const payload = addFilesJson.payload as fileIngestion.IPayload;
  fileProcessingHelpers.loadTableStreams(
    addFilesJson.testDataDirectory,
    payload
  );
  await processTrackingService.createProcessTracking(PROCESS_ID2, PROCESS_NAME);
  const fileIngestor = new FileIngestor(
    payload,
    addFilesJson.databaseName,
    PROCESS_ID2
  );
  await fileIngestor.init();
  await fileIngestor.process();
}

describe('#fileProcessing', () => {
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
    let projectId: any;

    before(async () => {
      (config as any).inited = false;
      await Initializer.init();
      const projectDocument = (
        await dbConnection.models.ProjectModel.create([INPUT_PROJECT], {
          validateBeforeSave: false,
        })
      )[0];
      projectId = projectDocument._id;
      assert.isOk(projectId);
      addFilesJson.payload.modelId = projectId.toString();
      replaceFilesJson.payload.modelId = projectId.toString();

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
      await processTrackingService.createProcessTracking(
        PROCESS_ID,
        PROCESS_NAME
      );
      await setupExistingAssets();
      (config as any).inited = false;
    });

    after(async () => {
      await fileProcessingHelpers.cleanupAws(
        payload,
        clientId,
        modelId,
        s3Bucket,
        athenaManager
      );
      await dbConnection.models.ProjectModel.findByIdAndDelete(projectId);
      await processTrackingService.removeProcessTrackingDocument(PROCESS_ID);
      await processTrackingService.removeProcessTrackingDocument(PROCESS_ID2);
    });
    it('Basic pipeline test', async () => {
      const fileIngestor = new FileIngestor(payload, databaseName, PROCESS_ID);
      await fileIngestor.init();
      const {joinInformation} = await fileIngestor.process();
      await fileProcessingHelpers.validateTableResults(
        joinInformation,
        athenaManager
      );
      await fileProcessingHelpers.validateViewResults(
        athenaManager,
        `glyphx_${clientId}_${modelId}_view`,
        joinInformation
      );
      const query = `SELECT * FROM glyphx_${clientId}_${modelId}_view WHERE col1 = 163`;
      const results = (await athenaManager.runQuery(query)) as unknown as any[];
      assert.isAtLeast(results.length, 1);

      const query2 = `SELECT * FROM glyphx_${clientId}_${modelId}_view WHERE col1 = 63`;
      const results2 = (await athenaManager.runQuery(
        query2
      )) as unknown as any[];
      assert.strictEqual(results2.length, 0);
      console.log('I am done');
    });
  });
});
