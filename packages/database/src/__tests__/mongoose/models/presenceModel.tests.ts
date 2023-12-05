// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {PresenceModel} from '../../../mongoose/models/presence';
import * as mocks from '../../../mongoose/mocks';
// eslint-disable-next-line import/no-duplicates
import {cursorSchema} from '../../../mongoose/schemas';
// eslint-disable-next-line import/no-duplicates
import {cameraSchema} from '../../../mongoose/schemas';
import {ModelConfigModel} from '../../../mongoose/models/modelConfig';
import {IQueryResult, databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/presence', () => {
  context('presenceIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the presenceId exists', async () => {
      const presenceId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: presenceId});
      sandbox.replace(PresenceModel, 'findById', findByIdStub);

      const result = await PresenceModel.presenceIdExists(presenceId);

      assert.isTrue(result);
    });

    it('should return false if the presenceId does not exist', async () => {
      const presenceId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(PresenceModel, 'findById', findByIdStub);

      const result = await PresenceModel.presenceIdExists(presenceId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const presenceId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(PresenceModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await PresenceModel.presenceIdExists(presenceId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allPresenceIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the presence ids exist', async () => {
      const presenceIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedPresenceIds = presenceIds.map((presenceId) => {
        return {
          _id: presenceId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedPresenceIds);
      sandbox.replace(PresenceModel, 'find', findStub);

      assert.isTrue(await PresenceModel.allPresenceIdsExist(presenceIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const presenceIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedPresenceIds = [
        {
          _id: presenceIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedPresenceIds);
      sandbox.replace(PresenceModel, 'find', findStub);
      let errored = false;
      try {
        await PresenceModel.allPresenceIdsExist(presenceIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(err.data.value[0].toString(), presenceIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const presenceIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(PresenceModel, 'find', findStub);
      let errored = false;
      try {
        await PresenceModel.allPresenceIdsExist(presenceIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will not throw an error when no unsafe fields are present', async () => {
      const configStub = sandbox.stub();
      configStub.resolves(true);
      sandbox.replace(ModelConfigModel, 'modelConfigIdExists', configStub);

      let errored = false;

      try {
        await PresenceModel.validateUpdateObject(
          mocks.MOCK_PRESENCE as unknown as Omit<Partial<databaseTypes.IPresence>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const configStub = sandbox.stub();
      configStub.resolves(true);
      sandbox.replace(ModelConfigModel, 'modelConfigIdExists', configStub);

      let errored = false;

      try {
        await PresenceModel.validateUpdateObject(
          mocks.MOCK_PRESENCE as unknown as Omit<Partial<databaseTypes.IPresence>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(configStub.calledOnce);
    });

    it('will fail when the config does not exist.', async () => {
      const configStub = sandbox.stub();
      configStub.resolves(false);
      sandbox.replace(ModelConfigModel, 'modelConfigIdExists', configStub);

      let errored = false;

      try {
        await PresenceModel.validateUpdateObject(
          mocks.MOCK_PRESENCE as unknown as Omit<Partial<databaseTypes.IPresence>, '_id'>
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const configStub = sandbox.stub();
      configStub.resolves(true);
      sandbox.replace(ModelConfigModel, 'modelConfigIdExists', configStub);

      let errored = false;

      try {
        await PresenceModel.validateUpdateObject({
          ...mocks.MOCK_PRESENCE,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IPresence>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const configStub = sandbox.stub();
      configStub.resolves(true);
      sandbox.replace(ModelConfigModel, 'modelConfigIdExists', configStub);

      let errored = false;

      try {
        await PresenceModel.validateUpdateObject({...mocks.MOCK_PRESENCE, createdAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IPresence>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const configStub = sandbox.stub();
      configStub.resolves(true);
      sandbox.replace(ModelConfigModel, 'modelConfigIdExists', configStub);

      let errored = false;

      try {
        await PresenceModel.validateUpdateObject({...mocks.MOCK_PRESENCE, updatedAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IPresence>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createPresence', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a presence document', async () => {
      sandbox.replace(PresenceModel, 'validateConfig', sandbox.stub().resolves(mocks.MOCK_PRESENCE.config));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(PresenceModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(PresenceModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(PresenceModel, 'getPresenceById', stub);

      const presenceDocument = await PresenceModel.createPresence(mocks.MOCK_PRESENCE);

      assert.strictEqual(presenceDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when the config validator throws one', async () => {
      sandbox.replace(
        PresenceModel,
        'validateConfig',
        sandbox.stub().rejects(new error.DataValidationError('The config does not exist', 'config ', {}))
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(PresenceModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(PresenceModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(PresenceModel, 'getPresenceById', stub);

      let errored = false;

      try {
        await PresenceModel.createPresence(mocks.MOCK_PRESENCE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(PresenceModel, 'validateConfig', sandbox.stub().resolves(mocks.MOCK_PRESENCE.config));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(PresenceModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(PresenceModel, 'create', sandbox.stub().rejects('oops, something bad has happened'));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(PresenceModel, 'getPresenceById', stub);
      let hasError = false;
      try {
        await PresenceModel.createPresence(mocks.MOCK_PRESENCE);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(PresenceModel, 'validateConfig', sandbox.stub().resolves(mocks.MOCK_PRESENCE.config));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(PresenceModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(PresenceModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(PresenceModel, 'getPresenceById', stub);

      let hasError = false;
      try {
        await PresenceModel.createPresence(mocks.MOCK_PRESENCE);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(PresenceModel, 'validateConfig', sandbox.stub().resolves(mocks.MOCK_PRESENCE.config));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(PresenceModel, 'validate', sandbox.stub().rejects('oops an error has occurred'));
      sandbox.replace(PresenceModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(PresenceModel, 'getPresenceById', stub);
      let hasError = false;
      try {
        await PresenceModel.createPresence(mocks.MOCK_PRESENCE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getPresenceById', () => {
    class MockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError = false) {
        this.mockData = input;
        this.throwError = throwError;
      }
      populate() {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a presence document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_PRESENCE));
      sandbox.replace(PresenceModel, 'findById', findByIdStub);

      const doc = await PresenceModel.getPresenceById(mocks.MOCK_PRESENCE._id as mongoose.Types.ObjectId);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.config as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_PRESENCE._id);
    });

    it('will throw a DataNotFoundError when the presence does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(PresenceModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await PresenceModel.getPresenceById(mocks.MOCK_PRESENCE._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(PresenceModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await PresenceModel.getPresenceById(mocks.MOCK_PRESENCE._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryPresences', () => {
    class MockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError = false) {
        this.mockData = input;
        this.throwError = throwError;
      }

      populate() {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const mockPresences = [
      {
        ...mocks.MOCK_PRESENCE,
        _id: new mongoose.Types.ObjectId(),
        config: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IModelConfig,
      } as databaseTypes.IPresence,
      {
        ...mocks.MOCK_PRESENCE,
        _id: new mongoose.Types.ObjectId(),
        config: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IModelConfig,
      } as databaseTypes.IPresence,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered presences', async () => {
      sandbox.replace(PresenceModel, 'count', sandbox.stub().resolves(mockPresences.length));

      sandbox.replace(PresenceModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockPresences)));

      const results = await PresenceModel.queryPresences({});

      assert.strictEqual(results.numberOfItems, mockPresences.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockPresences.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.config as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(PresenceModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(PresenceModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockPresences)));

      let errored = false;
      try {
        await PresenceModel.queryPresences();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(PresenceModel, 'count', sandbox.stub().resolves(mockPresences.length));

      sandbox.replace(PresenceModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockPresences)));

      let errored = false;
      try {
        await PresenceModel.queryPresences({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(PresenceModel, 'count', sandbox.stub().resolves(mockPresences.length));

      sandbox.replace(
        PresenceModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await PresenceModel.queryPresences({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updatePresenceById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a presence', async () => {
      const updatePresence = {
        ...mocks.MOCK_PRESENCE,
        deletedAt: new Date(),
        config: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IModelConfig,
      } as unknown as databaseTypes.IPresence;

      const presenceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(PresenceModel, 'updateOne', updateStub);

      const getPresenceStub = sandbox.stub();
      getPresenceStub.resolves({_id: presenceId});
      sandbox.replace(PresenceModel, 'getPresenceById', getPresenceStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(PresenceModel, 'validateUpdateObject', validateStub);

      const result = await PresenceModel.updatePresenceById(presenceId, updatePresence);

      assert.strictEqual(result._id, presenceId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getPresenceStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a presence with references as ObjectIds', async () => {
      const updatePresence = {
        ...mocks.MOCK_PRESENCE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IPresence;

      const presenceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(PresenceModel, 'updateOne', updateStub);

      const getPresenceStub = sandbox.stub();
      getPresenceStub.resolves({_id: presenceId});
      sandbox.replace(PresenceModel, 'getPresenceById', getPresenceStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(PresenceModel, 'validateUpdateObject', validateStub);

      const result = await PresenceModel.updatePresenceById(presenceId, updatePresence);

      assert.strictEqual(result._id, presenceId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getPresenceStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the presence does not exist', async () => {
      const updatePresence = {
        ...mocks.MOCK_PRESENCE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IPresence;

      const presenceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(PresenceModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(PresenceModel, 'validateUpdateObject', validateStub);

      const getPresenceStub = sandbox.stub();
      getPresenceStub.resolves({_id: presenceId});
      sandbox.replace(PresenceModel, 'getPresenceById', getPresenceStub);

      let errorred = false;
      try {
        await PresenceModel.updatePresenceById(presenceId, updatePresence);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updatePresence = {
        ...mocks.MOCK_PRESENCE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IPresence;

      const presenceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(PresenceModel, 'updateOne', updateStub);

      const getPresenceStub = sandbox.stub();
      getPresenceStub.resolves({_id: presenceId});
      sandbox.replace(PresenceModel, 'getPresenceById', getPresenceStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(new error.InvalidOperationError("You can't do this", {}));
      sandbox.replace(PresenceModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await PresenceModel.updatePresenceById(presenceId, updatePresence);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updatePresence = {
        ...mocks.MOCK_PRESENCE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IPresence;

      const presenceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(PresenceModel, 'updateOne', updateStub);

      const getPresenceStub = sandbox.stub();
      getPresenceStub.resolves({_id: presenceId});
      sandbox.replace(PresenceModel, 'getPresenceById', getPresenceStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(PresenceModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await PresenceModel.updatePresenceById(presenceId, updatePresence);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a presence document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a presence', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(PresenceModel, 'deleteOne', deleteStub);

      const presenceId = new mongoose.Types.ObjectId();

      await PresenceModel.deletePresenceById(presenceId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the presence does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(PresenceModel, 'deleteOne', deleteStub);

      const presenceId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await PresenceModel.deletePresenceById(presenceId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(PresenceModel, 'deleteOne', deleteStub);

      const presenceId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await PresenceModel.deletePresenceById(presenceId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});
