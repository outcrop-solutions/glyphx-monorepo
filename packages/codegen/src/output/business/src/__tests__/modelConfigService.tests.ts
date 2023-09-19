// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { modelConfigService} from '../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/modelConfig', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createModelConfig', () => {
    it('will create a ModelConfig', async () => {
      const modelConfigId = new mongooseTypes.ObjectId();
      const updatedAtId = new mongooseTypes.ObjectId();
      const minColorId = new mongooseTypes.ObjectId();

      // createModelConfig
      const createModelConfigFromModelStub = sandbox.stub();
      createModelConfigFromModelStub.resolves({
         ...mocks.MOCK_MODELCONFIG,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IModelConfig);

      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'createModelConfig',
        createModelConfigFromModelStub
      );

      const doc = await modelConfigService.createModelConfig(
       {
         ...mocks.MOCK_MODELCONFIG,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IModelConfig
      );

      assert.isTrue(createModelConfigFromModelStub.calledOnce);
    });
    // modelConfig model fails
    it('will publish and rethrow an InvalidArgumentError when modelConfig model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createModelConfig
      const createModelConfigFromModelStub = sandbox.stub();
      createModelConfigFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'createModelConfig',
        createModelConfigFromModelStub
      );


      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await modelConfigService.createModelConfig(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when modelConfig model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createModelConfig
      const createModelConfigFromModelStub = sandbox.stub();
      createModelConfigFromModelStub.rejects(err);

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await modelConfigService.createModelConfig(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when modelConfig model throws it', async () => {
      const createModelConfigFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createModelConfigFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'createModelConfig',
        createModelConfigFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataValidationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await modelConfigService.createModelConfig(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when modelConfig model throws a DataOperationError', async () => {
      const createModelConfigFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createModelConfigFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'createModelConfig',
        createModelConfigFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await modelConfigService.createModelConfig(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when modelConfig model throws a UnexpectedError', async () => {
      const createModelConfigFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createModelConfigFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'createModelConfig',
        createModelConfigFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.UnexpectedError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await modelConfigService.createModelConfig(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getModelConfig', () => {
    it('should get a modelConfig by id', async () => {
      const modelConfigId = new mongooseTypes.ObjectId();

      const getModelConfigFromModelStub = sandbox.stub();
      getModelConfigFromModelStub.resolves({
        _id: modelConfigId,
      } as unknown as databaseTypes.IModelConfig);
      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'getModelConfigById',
        getModelConfigFromModelStub
      );

      const modelConfig = await modelConfigService.getModelConfig(modelConfigId);
      assert.isOk(modelConfig);
      assert.strictEqual(modelConfig?._id?.toString(), modelConfigId.toString());

      assert.isTrue(getModelConfigFromModelStub.calledOnce);
    });
    it('should get a modelConfig by id when id is a string', async () => {
      const modelConfigId = new mongooseTypes.ObjectId();

      const getModelConfigFromModelStub = sandbox.stub();
      getModelConfigFromModelStub.resolves({
        _id: modelConfigId,
      } as unknown as databaseTypes.IModelConfig);
      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'getModelConfigById',
        getModelConfigFromModelStub
      );

      const modelConfig = await modelConfigService.getModelConfig(modelConfigId.toString());
      assert.isOk(modelConfig);
      assert.strictEqual(modelConfig?._id?.toString(), modelConfigId.toString());

      assert.isTrue(getModelConfigFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the modelConfig cannot be found', async () => {
      const modelConfigId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'modelConfigId',
        modelConfigId
      );
      const getModelConfigFromModelStub = sandbox.stub();
      getModelConfigFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'getModelConfigById',
        getModelConfigFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const modelConfig = await modelConfigService.getModelConfig(modelConfigId);
      assert.notOk(modelConfig);

      assert.isTrue(getModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const modelConfigId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getModelConfigById'
      );
      const getModelConfigFromModelStub = sandbox.stub();
      getModelConfigFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'getModelConfigById',
        getModelConfigFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await modelConfigService.getModelConfig(modelConfigId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getModelConfigs', () => {
    it('should get modelConfigs by filter', async () => {
      const modelConfigId = new mongooseTypes.ObjectId();
      const modelConfigId2 = new mongooseTypes.ObjectId();
      const modelConfigFilter = {_id: modelConfigId};

      const queryModelConfigsFromModelStub = sandbox.stub();
      queryModelConfigsFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_MODELCONFIG,
        _id: modelConfigId,
        } as unknown as databaseTypes.IModelConfig,
        {
         ...mocks.MOCK_MODELCONFIG,
        _id: modelConfigId2,
        } as unknown as databaseTypes.IModelConfig
        ],
      } as unknown as databaseTypes.IModelConfig[]);

      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'queryModelConfigs',
        queryModelConfigsFromModelStub
      );

      const modelConfigs = await modelConfigService.getModelConfigs(modelConfigFilter);
      assert.isOk(modelConfigs![0]);
      assert.strictEqual(modelConfigs![0]._id?.toString(), modelConfigId.toString());
      assert.isTrue(queryModelConfigsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the modelConfigs cannot be found', async () => {
      const modelConfigName = 'modelConfigName1';
      const modelConfigFilter = {name: modelConfigName};
      const errMessage = 'Cannot find the modelConfig';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        modelConfigFilter
      );
      const getModelConfigFromModelStub = sandbox.stub();
      getModelConfigFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'queryModelConfigs',
        getModelConfigFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const modelConfig = await modelConfigService.getModelConfigs(modelConfigFilter);
      assert.notOk(modelConfig);

      assert.isTrue(getModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const modelConfigName = 'modelConfigName1';
      const modelConfigFilter = {name: modelConfigName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getModelConfigByEmail'
      );
      const getModelConfigFromModelStub = sandbox.stub();
      getModelConfigFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'queryModelConfigs',
        getModelConfigFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await modelConfigService.getModelConfigs(modelConfigFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateModelConfig', () => {
    it('will update a modelConfig', async () => {
      const modelConfigId = new mongooseTypes.ObjectId();
      const updateModelConfigFromModelStub = sandbox.stub();
      updateModelConfigFromModelStub.resolves({
         ...mocks.MOCK_MODELCONFIG,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IModelConfig);
      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'updateModelConfigById',
        updateModelConfigFromModelStub
      );

      const modelConfig = await modelConfigService.updateModelConfig(modelConfigId, {
        deletedAt: new Date(),
      });
      assert.isOk(modelConfig);
      assert.strictEqual(modelConfig._id, modelConfigId);
      assert.isOk(modelConfig.deletedAt);
      assert.isTrue(updateModelConfigFromModelStub.calledOnce);
    });
    it('will update a modelConfig when the id is a string', async () => {
     const modelConfigId = new mongooseTypes.ObjectId();
      const updateModelConfigFromModelStub = sandbox.stub();
      updateModelConfigFromModelStub.resolves({
         ...mocks.MOCK_MODELCONFIG,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IModelConfig);
      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'updateModelConfigById',
        updateModelConfigFromModelStub
      );

      const modelConfig = await modelConfigService.updateModelConfig(modelConfigId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(modelConfig);
      assert.strictEqual(modelConfig._id, modelConfigId);
      assert.isOk(modelConfig.deletedAt);
      assert.isTrue(updateModelConfigFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when modelConfig model throws it ', async () => {
      const modelConfigId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateModelConfigFromModelStub = sandbox.stub();
      updateModelConfigFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'updateModelConfigById',
        updateModelConfigFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await modelConfigService.updateModelConfig(modelConfigId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when modelConfig model throws it ', async () => {
      const modelConfigId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateModelConfigFromModelStub = sandbox.stub();
      updateModelConfigFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'updateModelConfigById',
        updateModelConfigFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await modelConfigService.updateModelConfig(modelConfigId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when modelConfig model throws a DataOperationError ', async () => {
      const modelConfigId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateModelConfigById'
      );
      const updateModelConfigFromModelStub = sandbox.stub();
      updateModelConfigFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ModelConfigModel,
        'updateModelConfigById',
        updateModelConfigFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await modelConfigService.updateModelConfig(modelConfigId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateModelConfigFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
