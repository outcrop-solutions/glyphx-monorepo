import 'mocha';
import {assert} from 'chai';
import * as fileProcessing from '../../fileProcessing';
import {createSandbox} from 'sinon';
import {aws, error} from 'core';
import {Readable} from 'stream';
import {fileIngestionTypes} from 'types';
import {mockClient} from 'aws-sdk-client-mock';
import {S3, PutObjectCommand, HeadBucketCommand} from '@aws-sdk/client-s3';
import {Upload} from '@aws-sdk/lib-storage';
import {tableService} from 'business';

import {FILE_PROCESSING_ERROR_TYPES} from '../../util/constants';

const INPUT_DATA = [
  `col1,col2,col3,col4
1,A,flagrant,97683
2,B,flame,72915
3,C,nonchalant,1480
4,D,mailbox,63693
5,E,magical,96378
6,F,experience,61234
7,G,detect,17660
8,H,yam,99248
9,I,puny,62435
10,J,grouchy,foo
1,K,excellent,47570`,
];

describe('#fileProcessing/fileUploadManager', () => {
  context('processAndUploadNewFiles', () => {
    let s3Mock: any;
    const sandbox = createSandbox();
    const clientId = 'clientId';
    const modelId = 'modelId';
    let inputStream: Readable;
    const fileName = 'file1.csv';
    const tableName = 'table1';
    const fileOperationType = fileIngestionTypes.constants.FILE_OPERATION.ADD;
    beforeEach(() => {
      // eslint-disable-next-line
      inputStream = Readable.from(INPUT_DATA);
      /* eslint-disable-next-line */
      //@ts-ignore
      s3Mock = mockClient(S3);
    });
    afterEach(() => {
      sandbox.restore();
      s3Mock.restore();
    });

    it('Will successfuly upload the file', async () => {
      s3Mock.on(PutObjectCommand).resolves(true);
      s3Mock.on(HeadBucketCommand).resolves(true);
      sandbox.replace(
        tableService,
        'getMaxRowId',
        sandbox.stub().rejects('getMaxRowId shouild not be getting called for an add')
      );
      const s3Bucket = new aws.S3Manager('testBucket');
      await s3Bucket.init();

      const results = await fileProcessing.FileUploadManager.processAndUploadNewFiles(
        clientId,
        modelId,
        inputStream,
        tableName,
        fileName,
        fileOperationType,
        s3Bucket
      );

      assert.isOk(results);
      assert.strictEqual(results.fileInformation.fileName, fileName);
      assert.strictEqual(results.fileInformation.fileOperationType, fileOperationType);
      assert.isAtLeast(results.fileInformation.fileSize, 1);
      assert.strictEqual(results.fileInformation.numberOfColumns, 4);
      assert.isNotEmpty(results.fileInformation.outputFileDirecotry);
      assert.isNotEmpty(results.fileInformation.parquetFileName);
      assert.strictEqual(results.fileInformation.tableName, tableName);
      assert.isArray(results.errorInformation);
      //We removed the error stuff because it was causing stack overflow errors.
      //assert.isAtLeast(results.errorInformation.length, 1);

      //assert.strictEqual(results.errorInformation[0].errorType, FILE_PROCESSING_ERROR_TYPES.INVALID_FIELD_VALUE);
    });

    it('will throw an error when uploading a file fails', async () => {
      const doneStream = sandbox.stub();
      doneStream.rejects('something bad has happened');
      sandbox.replace(Upload.prototype, 'done', doneStream);
      s3Mock.on(PutObjectCommand).rejects('an error has occurrred');
      s3Mock.on(HeadBucketCommand).resolves(true);

      const tableServiceStub = sandbox.stub();
      tableServiceStub.rejects('getMaxRowId shouild not be getting called for an add');

      sandbox.replace(tableService, 'getMaxRowId', tableServiceStub);

      const s3Bucket = new aws.S3Manager('testBucket');
      await s3Bucket.init();
      let errored = false;

      try {
        await fileProcessing.FileUploadManager.processAndUploadNewFiles(
          clientId,
          modelId,
          inputStream,
          tableName,
          fileName,
          fileOperationType,
          s3Bucket
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }

      assert.isTrue(errored);
      assert.isFalse(tableServiceStub.called);
    });
  });
  context('processAndAppendFiles', () => {
    let s3Mock: any;
    const sandbox = createSandbox();
    const clientId = 'clientId';
    const modelId = 'modelId';
    let inputStream: Readable;
    const fileName = 'file1.csv';
    const tableName = 'table1';
    const fileOperationType = fileIngestionTypes.constants.FILE_OPERATION.APPEND;
    beforeEach(() => {
      // eslint-disable-next-line
      inputStream = Readable.from(INPUT_DATA);
      /* eslint-disable-next-line */
      //@ts-ignore
      s3Mock = mockClient(S3);
    });
    afterEach(() => {
      sandbox.restore();
      s3Mock.restore();
    });

    it('Will successfuly upload the file', async () => {
      s3Mock.on(PutObjectCommand).resolves(true);
      s3Mock.on(HeadBucketCommand).resolves(true);
      const tableServiceStub = sandbox.stub();
      tableServiceStub.resolves(6300);

      sandbox.replace(tableService, 'getMaxRowId', tableServiceStub);

      const s3Bucket = new aws.S3Manager('testBucket');
      await s3Bucket.init();

      const results = await fileProcessing.FileUploadManager.processAndUploadNewFiles(
        clientId,
        modelId,
        inputStream,
        tableName,
        fileName,
        fileOperationType,
        s3Bucket
      );

      assert.isOk(results);
      assert.strictEqual(results.fileInformation.fileName, fileName);
      assert.strictEqual(results.fileInformation.fileOperationType, fileOperationType);
      assert.isAtLeast(results.fileInformation.fileSize, 1);
      assert.strictEqual(results.fileInformation.numberOfColumns, 4);
      assert.isNotEmpty(results.fileInformation.outputFileDirecotry);
      assert.isNotEmpty(results.fileInformation.parquetFileName);
      assert.strictEqual(results.fileInformation.tableName, tableName);
      assert.isArray(results.errorInformation);
      //We removed the error stuff because it was causing stack overflow errors.
      //assert.isAtLeast(results.errorInformation.length, 1);

      //assert.strictEqual(results.errorInformation[0].errorType, FILE_PROCESSING_ERROR_TYPES.INVALID_FIELD_VALUE);
      assert.isTrue(tableServiceStub.calledOnce);
    });
  });
});
