import {assert} from 'chai';
import {aws, generalPurposeFunctions} from '@glyphx/core';
import {FileIngestor} from '../fileIngestor';
import addFilesJson from './assets/addTables.json';
import appendFilesJson from './assets/appendTables.json';
//eslint-disable-next-line
import {fileIngestion} from '@glyphx/types';
import * as fileProcessingHelpers from './fileProcessingHelpers';
import {GLYPHX_ID_COLUMN_NAME} from 'fileProcessing/basicFileTransformer';

import {
  Initializer,
  processTrackingService,
  dbConnection,
} from '@glyphx/business';
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
      appendFilesJson.payload.modelId = projectId.toString();

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
      const res = await fileIngestor.process();
      const {joinInformation} = res;
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

      const foundIds: number[] = [];
      let maxRowId = 0;
      const glyphIdQuery = `SELECT ${GLYPHX_ID_COLUMN_NAME} from glyphx_${clientId}_${modelId}_view`;
      const rowIdResults = (await athenaManager.runQuery(
        glyphIdQuery
      )) as unknown as any[];

      rowIdResults.forEach(r => {
        const id = r[GLYPHX_ID_COLUMN_NAME];
        assert.notOk(foundIds.find(i => i === id));
        if (id > maxRowId) maxRowId = id;
        foundIds.push(id);
      });
      assert.isAtLeast(rowIdResults.length, 101);
      assert.strictEqual(rowIdResults.length, foundIds.length);
      assert.isAtLeast(maxRowId, rowIdResults.length - 1);
      console.log('I am done');
    });
  });
});
