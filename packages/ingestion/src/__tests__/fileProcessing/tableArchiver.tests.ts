import {assert} from 'chai';
import {TableArchiver} from '@fileProcessing';
import {createSandbox} from 'sinon';
import {aws, error} from 'core';
import {Readable} from 'stream';

class MockS3Manger {
  public initedField: boolean;
  get inited(): boolean {
    return this.initedField;
  }

  set inited(value: boolean) {
    this.initedField = value;
  }

  public async listObjects() {
    return ['table1', 'table2', 'table3'];
  }

  public async getObjectStream() {
    //eslint-disable-next-line
    return Readable['from'](['I am a stream']);
  }

  public getUploadStream() {
    return {
      done: async () => {
        return true;
      },
    };
  }

  public async removeObject() {
    return;
  }
  constructor() {
    this.initedField = true;
  }
}

describe('#fileProcessing/TableArchiver', () => {
  context('constructor', () => {
    const clientId = 'testClientId';
    const modelId = 'testModelId';

    it('will build a new TableArchiverObject', () => {
      const s3Manager = new MockS3Manger() as unknown as aws.S3Manager;
      const tableArchiver = new TableArchiver(clientId, modelId, s3Manager);

      assert.strictEqual(tableArchiver['clientId'], clientId);
      assert.strictEqual(tableArchiver['modelId'], modelId);
      assert.strictEqual(tableArchiver['s3Manager'], s3Manager);
      assert.isNotEmpty(tableArchiver['timeStamp']);
    });
  });

  context('isSafe', () => {
    const clientId = 'testClientId';
    const modelId = 'testModelId';

    it('should be safe', () => {
      const s3Manager = new MockS3Manger() as unknown as aws.S3Manager;
      const tableArchiver = new TableArchiver(clientId, modelId, s3Manager);

      assert.isTrue(tableArchiver.isSafe);
    });

    it('should throw an exception because it is not safe', () => {
      const s3Manager = new MockS3Manger();
      s3Manager.inited = false;
      const tableArchiver = new TableArchiver(
        clientId,
        modelId,
        s3Manager as unknown as aws.S3Manager
      );

      let errored = false;
      try {
        tableArchiver.isSafe;
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('archiveTable', () => {
    const sandbox = createSandbox();
    const clientId = 'testClientId';
    const modelId = 'testModelId';
    beforeEach(() => {});

    afterEach(() => {
      sandbox.restore();
    });

    it('should archive the files in a table', async () => {
      const tableName = 'testTable';

      const s3Manager = new MockS3Manger() as unknown as aws.S3Manager;

      const tableArchiver = new TableArchiver(clientId, modelId, s3Manager);

      const results = await tableArchiver.archiveTable(tableName);

      assert.strictEqual(results.tableName, tableName);
      assert.isNotEmpty(results.timeStamp);
      assert.strictEqual(results.affectedFiles.length, 6);
    });
    it('will return if there are no files to archive', async () => {
      const tableName = 'testTable';

      const s3Manager = new MockS3Manger() as unknown as aws.S3Manager;
      sandbox.replace(s3Manager, 'listObjects', sandbox.fake.resolves([]));

      const tableArchiver = new TableArchiver(clientId, modelId, s3Manager);

      const results = await tableArchiver.archiveTable(tableName);

      assert.strictEqual(results.tableName, tableName);
      assert.isNotEmpty(results.timeStamp);
      assert.strictEqual(results.affectedFiles.length, 0);
    });

    it('should throw an exception when s3 manager throws an exception', async () => {
      const tableName = 'testTable';
      const s3Manager = new MockS3Manger() as unknown as aws.S3Manager;
      sandbox.replace(
        s3Manager,
        'listObjects',
        sandbox.fake.rejects('oops I did it again')
      );
      const tableArchiver = new TableArchiver(clientId, modelId, s3Manager);

      let errored = false;
      try {
        await tableArchiver.archiveTable(tableName);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        assert.strictEqual(
          (err as any).data.additionalInfo.processingInformation.affectedFiles
            .length,
          0
        );
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('should throw an exception when archiveFile throws an exception', async () => {
      const tableName = 'testTable';

      const s3Manager = new MockS3Manger() as unknown as aws.S3Manager;
      const tableArchiver = new TableArchiver(clientId, modelId, s3Manager);
      const stub = sandbox.stub(tableArchiver, 'archiveFile');
      stub.onCall(4).rejects('Oops something went wrong');
      stub.callsFake(async (key: string, timeStamp: string) => {
        return {fileName: key, archiveFileName: timeStamp};
      });
      let errored = false;
      try {
        await tableArchiver.archiveTable(tableName);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        assert.strictEqual(
          (err as any).data.additionalInfo.processingInformation.affectedFiles
            .length,
          4
        );
        errored = true;
      }

      assert.isTrue(errored);
    });
    it('file archiver will catch and throw an exception when underlying calls throw an exception', async () => {
      const tableName = 'testTable';

      const s3Manager = new MockS3Manger() as unknown as aws.S3Manager;
      sandbox.replace(
        s3Manager,
        'removeObject',
        sandbox.fake.rejects('Opps I did it again')
      );
      const tableArchiver = new TableArchiver(clientId, modelId, s3Manager);
      let errored = false;
      try {
        await tableArchiver.archiveTable(tableName);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        assert.strictEqual(
          (err as any).data.additionalInfo.processingInformation.affectedFiles
            .length,
          0
        );
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});
