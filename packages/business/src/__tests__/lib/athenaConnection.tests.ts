import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import rewire from 'rewire';
import {aws, error} from 'core';
import athenaConnection from '../../lib/athenaConnection';

describe('#lib/athenaConnection', () => {
  context('validate the singleton', () => {
    it('will validate the exported singleton', () => {
      assert.throws(() => {
        athenaConnection.connection;
      }, error.InvalidOperationError);
      assert.isFalse(athenaConnection.inited);
    });
  });
  context('constructor', () => {
    it('will construct a new object', () => {
      const rw = rewire('../../../lib/athenaConnection');
      const athenaClass = rw.__get__('AthenaConnection');

      const newObject = new athenaClass();
      assert.throws(() => {
        newObject.databaseName;
      }, error.InvalidOperationError);

      assert.throws(() => {
        newObject.connection;
      }, error.InvalidOperationError);
      assert.isFalse(newObject.inited);
    });
  });
  context('init', () => {
    const sandbox = createSandbox();
    const mockSecret = {
      databaseName: 'testdatabaseName',
    };

    afterEach(() => {
      sandbox.restore();
    });

    it('will initialize our connection', async () => {
      const rw = rewire('../../../lib/athenaConnection');
      const getSecretsMock = sandbox.stub();
      getSecretsMock.resolves(mockSecret);
      sandbox.replace(aws.SecretManager.prototype, 'getSecrets', getSecretsMock);

      const athenaManagerInitMock = sandbox.stub();
      athenaManagerInitMock.resolves(null as unknown as void);
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaManagerInitMock);

      const athenaClass = rw.__get__('AthenaConnection');

      const newObject = new athenaClass();

      await newObject.init();

      assert.strictEqual(newObject.databaseName, mockSecret.databaseName);
      assert.isOk(newObject.connection);

      assert.isTrue(getSecretsMock.calledOnce);
      assert.isTrue(athenaManagerInitMock.calledOnce);
      assert.isTrue(newObject.inited);
    });
    it('will initialize our connection only once', async () => {
      const rw = rewire('../../../lib/athenaConnection');
      const getSecretsMock = sandbox.stub();
      getSecretsMock.resolves(mockSecret);
      sandbox.replace(aws.SecretManager.prototype, 'getSecrets', getSecretsMock);

      const athenaManagerInitMock = sandbox.stub();
      athenaManagerInitMock.resolves(null as unknown as void);
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaManagerInitMock);

      const athenaClass = rw.__get__('AthenaConnection');

      const newObject = new athenaClass();

      await newObject.init();
      assert.isTrue(newObject.inited);
      await newObject.init();

      assert.strictEqual(newObject.databaseName, mockSecret.databaseName);
      assert.isOk(newObject.connection);

      assert.isTrue(athenaManagerInitMock.calledOnce);
    });
  });
});
