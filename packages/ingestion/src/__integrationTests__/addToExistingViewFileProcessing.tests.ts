import {assert} from 'chai';
import {aws, generalPurposeFunctions} from 'core';
import {FileIngestor} from '../fileIngestor';
import addFilesJson from './assets/addTables.json';
import addFilesJson2 from './assets/addTables2.json';
//eslint-disable-next-line
import {fileIngestionTypes} from 'types';
import * as fileProcessingHelpers from './fileProcessingHelpers';

import {Initializer, processTrackingService, dbConnection} from 'business';
import {v4} from 'uuid';

import {config} from '../config';
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
  fileProcessingHelpers.loadTableStreams(addFilesJson.testDataDirectory, payload);
  await processTrackingService.createProcessTracking(PROCESS_ID2, PROCESS_NAME);
  const fileIngestor = new FileIngestor(payload, addFilesJson.databaseName, PROCESS_ID2);
  await fileIngestor.init();
  await fileIngestor.process();
}

describe('#fileProcessing', () => {
  context('add table to exisitng view', () => {
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
      addFilesJson2.payload.modelId = projectId.toString();

      bucketName = addFilesJson2.bucketName;
      databaseName = addFilesJson2.databaseName;
      clientId = addFilesJson2.payload.clientId;
      modelId = addFilesJson2.payload.modelId;
      testDataDirectory = addFilesJson2.testDataDirectory;

      assert.isNotEmpty(bucketName);
      assert.isNotEmpty(databaseName);
      assert.isNotEmpty(clientId);
      assert.isNotEmpty(modelId);
      assert.isNotEmpty(testDataDirectory);

      payload = addFilesJson2.payload as fileIngestion.IPayload;
      assert.isOk(payload);

      fileNames = payload.fileStats.map((f) => f.fileName);
      assert.isAtLeast(fileNames.length, 1);

      s3Bucket = new aws.S3Manager(bucketName);
      await s3Bucket.init();

      athenaManager = new aws.AthenaManager(databaseName);
      await athenaManager.init();

      await fileProcessingHelpers.cleanupAws(payload, clientId, modelId, s3Bucket, athenaManager);
      fileProcessingHelpers.loadTableStreams(testDataDirectory, payload);
      await processTrackingService.createProcessTracking(PROCESS_ID, PROCESS_NAME);
      await setupExistingAssets();
      (config as any).inited = false;
    });

    after(async () => {
      await fileProcessingHelpers.cleanupAws(payload, clientId, modelId, s3Bucket, athenaManager);
      await dbConnection.models.ProjectModel.findByIdAndDelete(projectId);
      await processTrackingService.removeProcessTrackingDocument(PROCESS_ID);
      await processTrackingService.removeProcessTrackingDocument(PROCESS_ID2);
    });
    it('Basic pipeline test', async () => {
      const fileIngestor = new FileIngestor(payload, databaseName, PROCESS_ID);
      await fileIngestor.init();
      const {joinInformation} = await fileIngestor.process();
      await fileProcessingHelpers.validateTableResults(joinInformation, athenaManager);
      await fileProcessingHelpers.validateViewResults(
        athenaManager,
        `glyphx_${clientId}_${modelId}_view`,
        joinInformation
      );
      console.log('I am done');
    });
  });
});
