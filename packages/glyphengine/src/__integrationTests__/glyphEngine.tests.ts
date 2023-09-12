import 'mocha';
import {assert} from 'chai';
import {aws, generalPurposeFunctions} from 'core';
import {FileIngestor} from 'fileingestion';
import {Initializer, processTrackingService, dbConnection, s3Connection, athenaConnection} from 'business';

import addFilesJson from './assets/addTables.json';
import {v4} from 'uuid';
import * as fileProcessingHelpers from './fileProcessingHelpers';

import {fileIngestionTypes, databaseTypes} from 'types';
import {GlyphEngine} from '../glyphEngine';
import {Initializer as glyphEngineInitializer} from '../init';
import {S3Manager} from 'core/src/aws';
const UNIQUE_KEY = v4().replaceAll('-', '');

const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
const INGESTION_PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
const PROCESS_NAME = 'glyphEngine' + UNIQUE_KEY;
const INGESTION_PROCESS_NAME = 'fileIngestion' + UNIQUE_KEY;

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

describe('GlyphEngine', () => {
  context('BasicTests', () => {
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

    let inputBucketName: string;

    let data: Map<string, string>;
    before(async () => {
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
      inputBucketName = addFilesJson.inputBucketName;
      databaseName = addFilesJson.databaseName;
      clientId = addFilesJson.payload.clientId + UNIQUE_KEY;
      modelId = projectId.toString();
      testDataDirectory = addFilesJson.testDataDirectory;
      viewName = generalPurposeFunctions.fileIngestion.getViewName(clientId, modelId);

      assert.isNotEmpty(bucketName);
      assert.isNotEmpty(databaseName);
      assert.isNotEmpty(clientId);
      assert.isNotEmpty(modelId);
      assert.isNotEmpty(testDataDirectory);
      assert.isNotEmpty(viewName);

      payload = addFilesJson.payload as fileIngestionTypes.IPayload;
      payload.clientId = clientId;
      payload.modelId = modelId;
      assert.isOk(payload);

      fileNames = payload.fileStats.map((f) => f.fileName);
      assert.isAtLeast(fileNames.length, 1);

      s3Bucket = s3Connection.s3Manager;

      athenaManager = athenaConnection.connection;

      await fileProcessingHelpers.cleanupAws(payload, clientId, modelId, s3Bucket, athenaManager);
      fileProcessingHelpers.loadTableStreams(testDataDirectory, payload);
      await processTrackingService.createProcessTracking(INGESTION_PROCESS_ID, INGESTION_PROCESS_NAME);
      const fileIngestor = new FileIngestor(payload, databaseName, INGESTION_PROCESS_ID);
      await fileIngestor.init();

      await fileIngestor.process();
      data = new Map<string, string>([
        ['x_axis', 'col1'],
        ['y_axis', 'col2'],
        ['z_axis', 'col4'],
        ['type_x', 'number'],
        ['type_y', 'string'],
        ['type_z', 'number'],
        ['x_func', 'LIN'],
        ['y_func', 'LIN'],
        ['z_func', 'LIN'],
        ['x_direction', 'ASC'],
        ['y_direction', 'ASC'],
        ['z_direction', 'ASC'],
        ['model_id', modelId],
        ['client_id', clientId],
      ]);
      await processTrackingService.createProcessTracking(PROCESS_ID, PROCESS_NAME);
    });

    after(async () => {
      await fileProcessingHelpers.cleanupAws(payload, clientId, modelId, s3Bucket, athenaManager);

      await dbConnection.models.ProjectModel.findByIdAndDelete(projectId);
      await processTrackingService.removeProcessTrackingDocument(PROCESS_ID);
      await processTrackingService.removeProcessTrackingDocument(INGESTION_PROCESS_ID);
    });

    it('will run glyphEngine over our view', async () => {
      await glyphEngineInitializer.init();
      const glyphEngine = new GlyphEngine(s3Bucket, s3Bucket, athenaManager, PROCESS_ID);

      await glyphEngine.init();
      const {sdtFileName, sgnFileName, sgcFileName} = await glyphEngine.process(data);

      assert.isTrue(await s3Bucket.fileExists(sdtFileName));
      assert.isTrue(await s3Bucket.fileExists(sgnFileName));
      assert.isTrue(await s3Bucket.fileExists(sgcFileName));
      const processStatus = await processTrackingService.getProcessStatus(PROCESS_ID);
      assert.strictEqual(processStatus?.processStatus, databaseTypes.constants.PROCESS_STATUS.COMPLETED);
    });
  });
});
