import {assert} from 'chai';
import {aws, generalPurposeFunctions} from 'core';
import {FileIngestor} from '../fileIngestor';
import addFilesJson from './assets/addTables.json';
import deleteFilesJson from './assets/deleteTables.json';
//eslint-disable-next-line
import {fileIngestionTypes} from 'types';
import * as fileProcessingHelpers from './fileProcessingHelpers';

import {config} from '../config';
import {Initializer, processTrackingService, dbConnection} from 'business';
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
  context('Delete file on an existing view', () => {
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
      deleteFilesJson.payload.modelId = projectId.toString();

      bucketName = deleteFilesJson.bucketName;
      databaseName = deleteFilesJson.databaseName;
      clientId = deleteFilesJson.payload.clientId;
      modelId = deleteFilesJson.payload.modelId;
      testDataDirectory = deleteFilesJson.testDataDirectory;

      assert.isNotEmpty(bucketName);
      assert.isNotEmpty(databaseName);
      assert.isNotEmpty(clientId);
      assert.isNotEmpty(modelId);
      assert.isNotEmpty(testDataDirectory);

      payload = deleteFilesJson.payload as fileIngestion.IPayload;
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
      const query = `SELECT * FROM glyphx_${clientId}_${modelId}_view WHERE col1 = 63`;
      const results = (await athenaManager.runQuery(query)) as unknown as any[];
      assert.isAtLeast(results.length, 1);

      assert.isDefined(results[0].col1);
      assert.isDefined(results[0].col2);
      assert.isDefined(results[0].col5);
      assert.isUndefined(results[0].col3);
      assert.isUndefined(results[0].col4);

      console.log('I am done');
    });
  });
});
