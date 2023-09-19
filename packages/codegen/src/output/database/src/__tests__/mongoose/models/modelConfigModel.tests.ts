// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import { ModelConfigModel} from '../../../mongoose/models/modelConfig'
import * as mocks from '../../../mongoose/mocks';
// eslint-disable-next-line import/no-duplicates
import { minColorSchema } from '../../../mongoose/schemas'
import {IQueryResult, databaseTypes} from 'types'
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/modelConfig', () => {
  context('modelConfigIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the modelConfigId exists', async () => {
      const modelConfigId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: modelConfigId});
      sandbox.replace(ModelConfigModel, 'findById', findByIdStub);

      const result = await ModelConfigModel.modelConfigIdExists(modelConfigId);

      assert.isTrue(result);
    });

    it('should return false if the modelConfigId does not exist', async () => {
      const modelConfigId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ModelConfigModel, 'findById', findByIdStub);

      const result = await ModelConfigModel.modelConfigIdExists(modelConfigId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const modelConfigId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(ModelConfigModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await ModelConfigModel.modelConfigIdExists(modelConfigId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allModelConfigIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the modelConfig ids exist', async () => {
      const modelConfigIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedModelConfigIds = modelConfigIds.map(modelConfigId => {
        return {
          _id: modelConfigId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedModelConfigIds);
      sandbox.replace(ModelConfigModel, 'find', findStub);

      assert.isTrue(await ModelConfigModel.allModelConfigIdsExist(modelConfigIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const modelConfigIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedModelConfigIds = [
        {
          _id: modelConfigIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedModelConfigIds);
      sandbox.replace(ModelConfigModel, 'find', findStub);
      let errored = false;
      try {
        await ModelConfigModel.allModelConfigIdsExist(modelConfigIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          modelConfigIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const modelConfigIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(ModelConfigModel, 'find', findStub);
      let errored = false;
      try {
        await ModelConfigModel.allModelConfigIdsExist(modelConfigIds);
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

      let errored = false;

      try {
        await ModelConfigModel.validateUpdateObject(mocks.MOCK_MODELCONFIG as unknown as Omit<Partial<databaseTypes.IModelConfig>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {

      let errored = false;

      try {
        await ModelConfigModel.validateUpdateObject(mocks.MOCK_MODELCONFIG as unknown as Omit<Partial<databaseTypes.IModelConfig>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });



    it('will fail when trying to update the _id', async () => {

      let errored = false;

      try {
        await ModelConfigModel.validateUpdateObject({...mocks.MOCK_MODELCONFIG, _id: new mongoose.Types.ObjectId() } as unknown as Omit<Partial<databaseTypes.IModelConfig>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {

      let errored = false;

      try {
        await ModelConfigModel.validateUpdateObject({...mocks.MOCK_MODELCONFIG, createdAt: new Date() } as unknown as Omit<Partial<databaseTypes.IModelConfig>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {

      let errored = false;

      try {
        await ModelConfigModel.validateUpdateObject({...mocks.MOCK_MODELCONFIG, updatedAt: new Date() }  as unknown as Omit<Partial<databaseTypes.IModelConfig>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createModelConfig', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a modelConfig document', async () => {

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ModelConfigModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(ModelConfigModel, 'validate', sandbox.stub().resolves(true));
      
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ModelConfigModel, 'getModelConfigById', stub);

      const modelConfigDocument = await ModelConfigModel.createModelConfig(mocks.MOCK_MODELCONFIG);

      assert.strictEqual(modelConfigDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });



    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ModelConfigModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        ModelConfigModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ModelConfigModel, 'getModelConfigById', stub);
      let hasError = false;
      try {
        await ModelConfigModel.createModelConfig(mocks.MOCK_MODELCONFIG);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ModelConfigModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ModelConfigModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ModelConfigModel, 'getModelConfigById', stub);

      let hasError = false;
      try {
        await ModelConfigModel.createModelConfig(mocks.MOCK_MODELCONFIG);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ModelConfigModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        ModelConfigModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ModelConfigModel, 'getModelConfigById', stub);
      let hasError = false;
      try {
        await ModelConfigModel.createModelConfig(mocks.MOCK_MODELCONFIG);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getModelConfigById', () => {
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

    it('will retreive a modelConfig document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_MODELCONFIG));
      sandbox.replace(ModelConfigModel, 'findById', findByIdStub);

      const doc = await ModelConfigModel.getModelConfigById(
        mocks.MOCK_MODELCONFIG._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_MODELCONFIG._id);
    });

    it('will throw a DataNotFoundError when the modelConfig does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ModelConfigModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ModelConfigModel.getModelConfigById(
          mocks.MOCK_MODELCONFIG._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(
        new MockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(ModelConfigModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ModelConfigModel.getModelConfigById(
          mocks.MOCK_MODELCONFIG._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryModelConfigs', () => {
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

    const mockModelConfigs = [
      {
       ...mocks.MOCK_MODELCONFIG,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IModelConfig,
      {
        ...mocks.MOCK_MODELCONFIG,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IModelConfig,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered modelConfigs', async () => {
      sandbox.replace(
        ModelConfigModel,
        'count',
        sandbox.stub().resolves(mockModelConfigs.length)
      );

      sandbox.replace(
        ModelConfigModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockModelConfigs))
      );

      const results = await ModelConfigModel.queryModelConfigs({});

      assert.strictEqual(results.numberOfItems, mockModelConfigs.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockModelConfigs.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(ModelConfigModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        ModelConfigModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockModelConfigs))
      );

      let errored = false;
      try {
        await ModelConfigModel.queryModelConfigs();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        ModelConfigModel,
        'count',
        sandbox.stub().resolves(mockModelConfigs.length)
      );

      sandbox.replace(
        ModelConfigModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockModelConfigs))
      );

      let errored = false;
      try {
        await ModelConfigModel.queryModelConfigs({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        ModelConfigModel,
        'count',
        sandbox.stub().resolves(mockModelConfigs.length)
      );

      sandbox.replace(
        ModelConfigModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await ModelConfigModel.queryModelConfigs({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateModelConfigById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a modelConfig', async () => {
      const updateModelConfig = {
        ...mocks.MOCK_MODELCONFIG,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IModelConfig;

      const modelConfigId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ModelConfigModel, 'updateOne', updateStub);

      const getModelConfigStub = sandbox.stub();
      getModelConfigStub.resolves({_id: modelConfigId});
      sandbox.replace(ModelConfigModel, 'getModelConfigById', getModelConfigStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ModelConfigModel, 'validateUpdateObject', validateStub);

      const result = await ModelConfigModel.updateModelConfigById(
        modelConfigId,
        updateModelConfig
      );

      assert.strictEqual(result._id, modelConfigId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getModelConfigStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a modelConfig with references as ObjectIds', async () => {
      const updateModelConfig = {
        ...mocks.MOCK_MODELCONFIG,
        deletedAt: new Date()
      } as unknown as databaseTypes.IModelConfig;

      const modelConfigId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ModelConfigModel, 'updateOne', updateStub);

      const getModelConfigStub = sandbox.stub();
      getModelConfigStub.resolves({_id: modelConfigId});
      sandbox.replace(ModelConfigModel, 'getModelConfigById', getModelConfigStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ModelConfigModel, 'validateUpdateObject', validateStub);

      const result = await ModelConfigModel.updateModelConfigById(
        modelConfigId,
        updateModelConfig
      );

      assert.strictEqual(result._id, modelConfigId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getModelConfigStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the modelConfig does not exist', async () => {
      const updateModelConfig = {
        ...mocks.MOCK_MODELCONFIG,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IModelConfig;

      const modelConfigId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(ModelConfigModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(ModelConfigModel, 'validateUpdateObject', validateStub);

      const getModelConfigStub = sandbox.stub();
      getModelConfigStub.resolves({_id: modelConfigId});
      sandbox.replace(ModelConfigModel, 'getModelConfigById', getModelConfigStub);

      let errorred = false;
      try {
        await ModelConfigModel.updateModelConfigById(modelConfigId, updateModelConfig);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateModelConfig = {
       ...mocks.MOCK_MODELCONFIG,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IModelConfig;

      const modelConfigId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ModelConfigModel, 'updateOne', updateStub);

      const getModelConfigStub = sandbox.stub();
      getModelConfigStub.resolves({_id: modelConfigId});
      sandbox.replace(ModelConfigModel, 'getModelConfigById', getModelConfigStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(ModelConfigModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await ModelConfigModel.updateModelConfigById(modelConfigId, updateModelConfig);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateModelConfig = {
       ...mocks.MOCK_MODELCONFIG,
        deletedAt: new Date()
      } as unknown as databaseTypes.IModelConfig;

      const modelConfigId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(ModelConfigModel, 'updateOne', updateStub);

      const getModelConfigStub = sandbox.stub();
      getModelConfigStub.resolves({_id: modelConfigId});
      sandbox.replace(ModelConfigModel, 'getModelConfigById', getModelConfigStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ModelConfigModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await ModelConfigModel.updateModelConfigById(modelConfigId, updateModelConfig);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a modelConfig document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a modelConfig', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ModelConfigModel, 'deleteOne', deleteStub);

      const modelConfigId = new mongoose.Types.ObjectId();

      await ModelConfigModel.deleteModelConfigById(modelConfigId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the modelConfig does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(ModelConfigModel, 'deleteOne', deleteStub);

      const modelConfigId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ModelConfigModel.deleteModelConfigById(modelConfigId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(ModelConfigModel, 'deleteOne', deleteStub);

      const modelConfigId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ModelConfigModel.deleteModelConfigById(modelConfigId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

});
