import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import rewire from 'rewire';
import {aws, error} from '@glyphx/core';
import athenaClient from '../../io/athenaClient';

describe('#lib/athenaConnection', () => {
  context('validate the singleton', () => {
    it('will validate the exported singleton', () => {
      assert.throws(() => {
        athenaClient.connection;
      }, error.InvalidOperationError);
      assert.isFalse(athenaClient.inited);
    });
  });
  context('constructor', () => {
    it('will construct a new object', () => {
      const rw = rewire('../../io/athenaClient');
      const athenaClass = rw.__get__('AthenaClient');

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
      const rw = rewire('../../io/athenaClient');
      const getSecretsMock = sandbox.stub();
      getSecretsMock.resolves(mockSecret);
      sandbox.replace(
        aws.SecretManager.prototype,
        'getSecrets',
        getSecretsMock
      );

      const athenaManagerInitMock = sandbox.stub();
      athenaManagerInitMock.resolves(null as unknown as void);
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        athenaManagerInitMock
      );

      const athenaClass = rw.__get__('AthenaClient');

      const newObject = new athenaClass();

      await newObject.init();

      assert.strictEqual(newObject.databaseName, mockSecret.databaseName);
      assert.isOk(newObject.connection);

      assert.isTrue(getSecretsMock.calledOnce);
      assert.isTrue(athenaManagerInitMock.calledOnce);
      assert.isTrue(newObject.inited);
    });

    it('will initialize our connection only once', async () => {
      const rw = rewire('../../io/athenaClient');
      const getSecretsMock = sandbox.stub();
      getSecretsMock.resolves(mockSecret);
      sandbox.replace(
        aws.SecretManager.prototype,
        'getSecrets',
        getSecretsMock
      );

      const athenaManagerInitMock = sandbox.stub();
      athenaManagerInitMock.resolves(null as unknown as void);
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        athenaManagerInitMock
      );

      const athenaClass = rw.__get__('AthenaClient');

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
