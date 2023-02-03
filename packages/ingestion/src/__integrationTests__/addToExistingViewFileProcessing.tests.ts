import {assert} from 'chai';
import {aws} from '@glyphx/core';
import {FileIngestor} from '../fileIngestor';
import addFilesJson from './assets/addTables.json';
import addFilesJson2 from './assets/addTables2.json';
//eslint-disable-next-line
import {fileIngestion} from '@glyphx/types';
import * as fileProcessingHelpers from './fileProcessingHelpers';

import {Initializer, dbConnection} from '@glyphx/business';
import {v4} from 'uuid';

const UNIQUE_KEY = v4().replaceAll('-', '');

const INPUT_PROJECT = {
  name: 'testProject' + UNIQUE_KEY,
  sdtPath: 'testsdtPath' + UNIQUE_KEY,
  organization: {},
  slug: 'testSlug' + UNIQUE_KEY,
  isTemplate: false,
  type: {},
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
  const fileIngestor = new FileIngestor(payload, addFilesJson.databaseName);
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
      await dbConnection.models.ProjectModel.findByIdAndDelete(projectId);
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
      console.log('I am done');
    });
  });
});
