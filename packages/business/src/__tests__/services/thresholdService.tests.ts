// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { thresholdService} from '../../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/threshold', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createThreshold', () => {
    it('will create a Threshold', async () => {
      const thresholdId = new mongooseTypes.ObjectId();
      const idId = new mongooseTypes.ObjectId();
      const actionTypeId = new mongooseTypes.ObjectId();
      const actionPayloadId = new mongooseTypes.ObjectId();
      const operatorId = new mongooseTypes.ObjectId();

      // createThreshold
      const createThresholdFromModelStub = sandbox.stub();
      createThresholdFromModelStub.resolves({
         ...mocks.MOCK_THRESHOLD,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IThreshold);

      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'createThreshold',
        createThresholdFromModelStub
      );

      const doc = await thresholdService.createThreshold(
       {
         ...mocks.MOCK_THRESHOLD,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IThreshold
      );

      assert.isTrue(createThresholdFromModelStub.calledOnce);
    });
    // threshold model fails
    it('will publish and rethrow an InvalidArgumentError when threshold model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createThreshold
      const createThresholdFromModelStub = sandbox.stub();
      createThresholdFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'createThreshold',
        createThresholdFromModelStub
      );


      function fakePublish() {
        
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
        await thresholdService.createThreshold(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when threshold model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createThreshold
      const createThresholdFromModelStub = sandbox.stub();
      createThresholdFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'createThreshold',
        createThresholdFromModelStub
      );
      
      function fakePublish() {
        
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
        await thresholdService.createThreshold(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when threshold model throws it', async () => {
      const createThresholdFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createThresholdFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'createThreshold',
        createThresholdFromModelStub
      );

      function fakePublish() {
        
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
        await thresholdService.createThreshold(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when threshold model throws a DataOperationError', async () => {
      const createThresholdFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createThresholdFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'createThreshold',
        createThresholdFromModelStub
      );

      function fakePublish() {
        
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
        await thresholdService.createThreshold(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when threshold model throws a UnexpectedError', async () => {
      const createThresholdFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createThresholdFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'createThreshold',
        createThresholdFromModelStub
      );

      function fakePublish() {
        
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
        await thresholdService.createThreshold(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getThreshold', () => {
    it('should get a threshold by id', async () => {
      const thresholdId = new mongooseTypes.ObjectId().toString();

      const getThresholdFromModelStub = sandbox.stub();
      getThresholdFromModelStub.resolves({
        _id: thresholdId,
      } as unknown as databaseTypes.IThreshold);
      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'getThresholdById',
        getThresholdFromModelStub
      );

      const threshold = await thresholdService.getThreshold(thresholdId);
      assert.isOk(threshold);
      assert.strictEqual(threshold?._id?.toString(), thresholdId.toString());

      assert.isTrue(getThresholdFromModelStub.calledOnce);
    });
    it('should get a threshold by id when id is a string', async () => {
      const thresholdId = new mongooseTypes.ObjectId();

      const getThresholdFromModelStub = sandbox.stub();
      getThresholdFromModelStub.resolves({
        _id: thresholdId,
      } as unknown as databaseTypes.IThreshold);
      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'getThresholdById',
        getThresholdFromModelStub
      );

      const threshold = await thresholdService.getThreshold(thresholdId.toString());
      assert.isOk(threshold);
      assert.strictEqual(threshold?._id?.toString(), thresholdId.toString());

      assert.isTrue(getThresholdFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the threshold cannot be found', async () => {
      const thresholdId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'thresholdId',
        thresholdId
      );
      const getThresholdFromModelStub = sandbox.stub();
      getThresholdFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'getThresholdById',
        getThresholdFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const threshold = await thresholdService.getThreshold(thresholdId);
      assert.notOk(threshold);

      assert.isTrue(getThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const thresholdId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getThresholdById'
      );
      const getThresholdFromModelStub = sandbox.stub();
      getThresholdFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'getThresholdById',
        getThresholdFromModelStub
      );
      function fakePublish() {
        
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
        await thresholdService.getThreshold(thresholdId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getThresholds', () => {
    it('should get thresholds by filter', async () => {
      const thresholdId = new mongooseTypes.ObjectId();
      const thresholdId2 = new mongooseTypes.ObjectId();
      const thresholdFilter = {_id: thresholdId};

      const queryThresholdsFromModelStub = sandbox.stub();
      queryThresholdsFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_THRESHOLD,
        _id: thresholdId,
        } as unknown as databaseTypes.IThreshold,
        {
         ...mocks.MOCK_THRESHOLD,
        _id: thresholdId2,
        } as unknown as databaseTypes.IThreshold
        ],
      } as unknown as databaseTypes.IThreshold[]);

      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'queryThresholds',
        queryThresholdsFromModelStub
      );

      const thresholds = await thresholdService.getThresholds(thresholdFilter);
      assert.isOk(thresholds![0]);
      assert.strictEqual(thresholds![0]._id?.toString(), thresholdId.toString());
      assert.isTrue(queryThresholdsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the thresholds cannot be found', async () => {
      const thresholdName = 'thresholdName1';
      const thresholdFilter = {name: thresholdName};
      const errMessage = 'Cannot find the threshold';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        thresholdFilter
      );
      const getThresholdFromModelStub = sandbox.stub();
      getThresholdFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'queryThresholds',
        getThresholdFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const threshold = await thresholdService.getThresholds(thresholdFilter);
      assert.notOk(threshold);

      assert.isTrue(getThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const thresholdName = 'thresholdName1';
      const thresholdFilter = {name: thresholdName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getThresholdByEmail'
      );
      const getThresholdFromModelStub = sandbox.stub();
      getThresholdFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'queryThresholds',
        getThresholdFromModelStub
      );
      function fakePublish() {
        
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
        await thresholdService.getThresholds(thresholdFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateThreshold', () => {
    it('will update a threshold', async () => {
      const thresholdId = new mongooseTypes.ObjectId().toString();
      const updateThresholdFromModelStub = sandbox.stub();
      updateThresholdFromModelStub.resolves({
         ...mocks.MOCK_THRESHOLD,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
      } as unknown as databaseTypes.IThreshold);
      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'updateThresholdById',
        updateThresholdFromModelStub
      );

      const threshold = await thresholdService.updateThreshold(thresholdId, {
        deletedAt: new Date(),
      });
      assert.isOk(threshold);
      assert.strictEqual(threshold.id, 'id');
      assert.isOk(threshold.deletedAt);
      assert.isTrue(updateThresholdFromModelStub.calledOnce);
    });
    it('will update a threshold when the id is a string', async () => {
     const thresholdId = new mongooseTypes.ObjectId();
      const updateThresholdFromModelStub = sandbox.stub();
      updateThresholdFromModelStub.resolves({
         ...mocks.MOCK_THRESHOLD,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
      } as unknown as databaseTypes.IThreshold);
      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'updateThresholdById',
        updateThresholdFromModelStub
      );

      const threshold = await thresholdService.updateThreshold(thresholdId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(threshold);
      assert.strictEqual(threshold.id, 'id');
      assert.isOk(threshold.deletedAt);
      assert.isTrue(updateThresholdFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when threshold model throws it', async () => {
      const thresholdId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateThresholdFromModelStub = sandbox.stub();
      updateThresholdFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'updateThresholdById',
        updateThresholdFromModelStub
      );

      function fakePublish() {
        
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
        await thresholdService.updateThreshold(thresholdId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when threshold model throws it ', async () => {
      const thresholdId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateThresholdFromModelStub = sandbox.stub();
      updateThresholdFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'updateThresholdById',
        updateThresholdFromModelStub
      );

      function fakePublish() {
        
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
        await thresholdService.updateThreshold(thresholdId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when threshold model throws a DataOperationError ', async () => {
      const thresholdId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateThresholdById'
      );
      const updateThresholdFromModelStub = sandbox.stub();
      updateThresholdFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ThresholdModel,
        'updateThresholdById',
        updateThresholdFromModelStub
      );

      function fakePublish() {
        
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
        await thresholdService.updateThreshold(thresholdId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateThresholdFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
