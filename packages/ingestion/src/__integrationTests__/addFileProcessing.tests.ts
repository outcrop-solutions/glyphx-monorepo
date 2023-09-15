import 'mocha';
import {assert} from 'chai';
import {aws, generalPurposeFunctions} from 'core';
import {FileIngestor} from '../fileIngestor';
import addFilesJson from './assets/addTables.json';
//eslint-disable-next-line
import {fileIngestionTypes, databaseTypes} from 'types';
import * as fileProcessingHelpers from './fileProcessingHelpers';
import {Initializer, processTrackingService, projectService, dbConnection} from 'business';
import {v4} from 'uuid';
import {config} from '../config';
const UNIQUE_KEY = v4().replaceAll('-', '');

const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
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

describe('#fileProcessing', () => {
  context('Inbound s3 file to parquet to S3', () => {
    let s3Bucket: aws.S3Manager;
    let athenaManager: aws.AthenaManager;

    let bucketName: string;
    let databaseName: string;
    let clientId: string;
    let modelId: string;
    let testDataDirectory: string;
    let payload: fileIngestionTypes.IPayload;
    let fileNames: string[];
    let projectId: any;
    let viewName: any;

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

      bucketName = addFilesJson.bucketName;
      databaseName = addFilesJson.databaseName;
      clientId = addFilesJson.payload.clientId;
      modelId = addFilesJson.payload.modelId;
      testDataDirectory = addFilesJson.testDataDirectory;
      viewName = generalPurposeFunctions.fileIngestion.getViewName(clientId, modelId);

      assert.isNotEmpty(bucketName);
      assert.isNotEmpty(databaseName);
      assert.isNotEmpty(clientId);
      assert.isNotEmpty(modelId);
      assert.isNotEmpty(testDataDirectory);
      assert.isNotEmpty(viewName);

      payload = addFilesJson.payload as fileIngestionTypes.IPayload;
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
    });

    after(async () => {
      await fileProcessingHelpers.cleanupAws(payload, clientId, modelId, s3Bucket, athenaManager);

      await dbConnection.models.ProjectModel.findByIdAndDelete(projectId);
      await processTrackingService.removeProcessTrackingDocument(PROCESS_ID);
    });

    it('Basic pipeline test', async () => {
      console.log('stuff spun up ok');
      const fileIngestor = new FileIngestor(payload, databaseName, PROCESS_ID);
      await fileIngestor.init();
      const {fileInformation, joinInformation, viewName: savedViewName, status} = await fileIngestor.process();
      await fileProcessingHelpers.validateTableResults(joinInformation, athenaManager);
      await fileProcessingHelpers.validateViewResults(
        athenaManager,
        `glyphx_${clientId}_${modelId}_view`,
        joinInformation
      );

      assert.strictEqual(savedViewName, viewName);

      const fileStats = await projectService.getProjectFileStats(payload.modelId);
      assert.strictEqual(fileStats.length, fileInformation.length);
      assert.strictEqual(fileStats[0].fileName, fileInformation[0].fileName);

      const documentViewName = await projectService.getProjectViewName(payload.modelId);
      assert.strictEqual(documentViewName, viewName);

      const processStatus = await processTrackingService.getProcessStatus(PROCESS_ID);
      assert.strictEqual(processStatus?.processStatus, databaseTypes.constants.PROCESS_STATUS.COMPLETED);

      assert.strictEqual(processStatus?.processResult?.status, status);
      console.log('I am done');
    });
  });
});
