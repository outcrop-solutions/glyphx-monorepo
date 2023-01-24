import 'mocha';
import {mongoDbConnection} from '../../mongoose/mongooseConnection';
import {createSandbox} from 'sinon';
import mongoose from 'mongoose';
import {aws, error} from '@glyphx/core';
import {assert} from 'chai';

const mockDbSecrets = {
  endpoint: 'testEndpoint',
  database: 'testDatabase',
  user: 'testUser',
  password: 'testPassword',
};
describe('#mongoose/mongooseConnection', () => {
  context('Build a new mongoose connection', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('will build a new mongoose connection', async () => {
      const connectStub = sandbox.stub();
      connectStub.resolves(true);
      sandbox.replace(mongoose, 'connect', connectStub);

      const secretManagerStub = sandbox.stub();
      secretManagerStub.resolves(mockDbSecrets);
      sandbox.replace(
        aws.SecretManager.prototype,
        'getSecrets',
        secretManagerStub
      );

      const connection = new mongoDbConnection();
      await connection.init();

      assert.isTrue(connectStub.calledOnce);
      assert.isTrue(connectStub.calledOnce);

      assert.strictEqual(connection.password, mockDbSecrets.password);
      assert.strictEqual(connection.user, mockDbSecrets.user);
      assert.strictEqual(connection.endpoint, mockDbSecrets.endpoint);
      assert.strictEqual(connection.database, mockDbSecrets.database);

      assert.isNotEmpty(connection.connectionString);

      assert.isOk(connection.models.ProjectModel);
    });

    it('will throw a DatabaseOperationError when mongoose.connect throws an exception', async () => {
      const connectStub = sandbox.stub();
      connectStub.rejects('The tigers broke free');
      sandbox.replace(mongoose, 'connect', connectStub);

      const secretManagerStub = sandbox.stub();
      secretManagerStub.resolves(mockDbSecrets);
      sandbox.replace(
        aws.SecretManager.prototype,
        'getSecrets',
        secretManagerStub
      );

      const connection = new mongoDbConnection();
      let errored = false;
      try {
        await connection.init();
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
});
