import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import rewire from 'rewire';
import {aws, error} from 'core';
import s3Connection from '../../lib/s3Connection';

describe('#lib/s3Connection', () => {
  context('validate the singleton', () => {
    it('will validate the exported singleton', () => {
      assert.throws(() => {
        s3Connection.s3Manager;
      }, error.InvalidOperationError);
      assert.isFalse(s3Connection.inited);
    });
  });
  context('constructor', () => {
    it('will construct a new object', () => {
      const rw = rewire('../../lib/s3Connection');
      const s3Class = rw.__get__('S3Connection');

      const newObject = new s3Class();
      assert.throws(() => {
        newObject.s3Manager;
      }, error.InvalidOperationError);

      assert.isFalse(newObject.inited);
    });
  });
  context('init', () => {
    const sandbox = createSandbox();
    const mockSecret = {
      bucketName: 'testbucketName',
    };

    afterEach(() => {
      sandbox.restore();
    });

    it('will initialize our s3Manager', async () => {
      const rw = rewire('../../lib/s3Connection');
      const getSecretsMock = sandbox.stub();
      getSecretsMock.resolves(mockSecret);
      sandbox.replace(aws.SecretManager.prototype, 'getSecrets', getSecretsMock);

      const s3ManagerInitMock = sandbox.stub();
      s3ManagerInitMock.resolves(null as unknown as void);
      sandbox.replace(aws.S3Manager.prototype, 'init', s3ManagerInitMock);

      const s3Class = rw.__get__('S3Connection');

      const newObject = new s3Class();

      await newObject.init();

      assert.strictEqual(newObject.bucketName, mockSecret.bucketName);
      assert.isOk(newObject.s3Manager);

      assert.isTrue(getSecretsMock.calledOnce);
      assert.isTrue(s3ManagerInitMock.calledOnce);
      assert.isTrue(newObject.inited);
    });
    it('will initialize our connection only once', async () => {
      const rw = rewire('../../lib/s3Connection');
      const getSecretsMock = sandbox.stub();
      getSecretsMock.resolves(mockSecret);
      sandbox.replace(aws.SecretManager.prototype, 'getSecrets', getSecretsMock);

      const s3ManagerInitMock = sandbox.stub();
      s3ManagerInitMock.resolves(null as unknown as void);
      sandbox.replace(aws.S3Manager.prototype, 'init', s3ManagerInitMock);

      const s3Class = rw.__get__('S3Connection');

      const newObject = new s3Class();

      await newObject.init();
      assert.isTrue(newObject.inited);
      await newObject.init();

      assert.strictEqual(newObject.bucketName, mockSecret.bucketName);
      assert.isOk(newObject.s3Manager);

      assert.isTrue(s3ManagerInitMock.calledOnce);
    });
  });
});
