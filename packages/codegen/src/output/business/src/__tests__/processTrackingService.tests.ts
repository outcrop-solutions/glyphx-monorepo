// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import {processTrackingService} from '../services';
import * as mocks from 'database/src/mongoose/mocks';

describe('#services/processTracking', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createProcessTracking', () => {
    it('will create a ProcessTracking', async () => {
      const processTrackingId = new mongooseTypes.ObjectId();
      const createdAtId = new mongooseTypes.ObjectId();
      const processStatusId = new mongooseTypes.ObjectId();
      const processErrorId = new mongooseTypes.ObjectId();

      // createProcessTracking
      const createProcessTrackingFromModelStub = sandbox.stub();
      createProcessTrackingFromModelStub.resolves({
        ...mocks.MOCK_PROCESSTRACKING,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IProcessTracking);

      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'createProcessTracking',
        createProcessTrackingFromModelStub
      );

      const doc = await processTrackingService.createProcessTracking({
        ...mocks.MOCK_PROCESSTRACKING,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IProcessTracking);

      assert.isTrue(createProcessTrackingFromModelStub.calledOnce);
    });
    // processTracking model fails
    it('will publish and rethrow an InvalidArgumentError when processTracking model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createProcessTracking
      const createProcessTrackingFromModelStub = sandbox.stub();
      createProcessTrackingFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'createProcessTracking',
        createProcessTrackingFromModelStub
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
        await processTrackingService.createProcessTracking({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when processTracking model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createProcessTracking
      const createProcessTrackingFromModelStub = sandbox.stub();
      createProcessTrackingFromModelStub.rejects(err);

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
        await processTrackingService.createProcessTracking({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when processTracking model throws it', async () => {
      const createProcessTrackingFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createProcessTrackingFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'createProcessTracking',
        createProcessTrackingFromModelStub
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
        await processTrackingService.createProcessTracking({});
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when processTracking model throws a DataOperationError', async () => {
      const createProcessTrackingFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createProcessTrackingFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'createProcessTracking',
        createProcessTrackingFromModelStub
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
        await processTrackingService.createProcessTracking({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when processTracking model throws a UnexpectedError', async () => {
      const createProcessTrackingFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(errMessage, 'mongodDb');

      createProcessTrackingFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'createProcessTracking',
        createProcessTrackingFromModelStub
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
        await processTrackingService.createProcessTracking({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getProcessTracking', () => {
    it('should get a processTracking by id', async () => {
      const processTrackingId = new mongooseTypes.ObjectId();

      const getProcessTrackingFromModelStub = sandbox.stub();
      getProcessTrackingFromModelStub.resolves({
        _id: processTrackingId,
      } as unknown as databaseTypes.IProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingById',
        getProcessTrackingFromModelStub
      );

      const processTracking =
        await processTrackingService.getProcessTracking(processTrackingId);
      assert.isOk(processTracking);
      assert.strictEqual(
        processTracking?._id?.toString(),
        processTrackingId.toString()
      );

      assert.isTrue(getProcessTrackingFromModelStub.calledOnce);
    });
    it('should get a processTracking by id when id is a string', async () => {
      const processTrackingId = new mongooseTypes.ObjectId();

      const getProcessTrackingFromModelStub = sandbox.stub();
      getProcessTrackingFromModelStub.resolves({
        _id: processTrackingId,
      } as unknown as databaseTypes.IProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingById',
        getProcessTrackingFromModelStub
      );

      const processTracking = await processTrackingService.getProcessTracking(
        processTrackingId.toString()
      );
      assert.isOk(processTracking);
      assert.strictEqual(
        processTracking?._id?.toString(),
        processTrackingId.toString()
      );

      assert.isTrue(getProcessTrackingFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the processTracking cannot be found', async () => {
      const processTrackingId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'processTrackingId',
        processTrackingId
      );
      const getProcessTrackingFromModelStub = sandbox.stub();
      getProcessTrackingFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingById',
        getProcessTrackingFromModelStub
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

      const processTracking =
        await processTrackingService.getProcessTracking(processTrackingId);
      assert.notOk(processTracking);

      assert.isTrue(getProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const processTrackingId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getProcessTrackingById'
      );
      const getProcessTrackingFromModelStub = sandbox.stub();
      getProcessTrackingFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingById',
        getProcessTrackingFromModelStub
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
        await processTrackingService.getProcessTracking(processTrackingId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getProcessTrackings', () => {
    it('should get processTrackings by filter', async () => {
      const processTrackingId = new mongooseTypes.ObjectId();
      const processTrackingId2 = new mongooseTypes.ObjectId();
      const processTrackingFilter = {_id: processTrackingId};

      const queryProcessTrackingsFromModelStub = sandbox.stub();
      queryProcessTrackingsFromModelStub.resolves({
        results: [
          {
            ...mocks.MOCK_PROCESSTRACKING,
            _id: processTrackingId,
          } as unknown as databaseTypes.IProcessTracking,
          {
            ...mocks.MOCK_PROCESSTRACKING,
            _id: processTrackingId2,
          } as unknown as databaseTypes.IProcessTracking,
        ],
      } as unknown as databaseTypes.IProcessTracking[]);

      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'queryProcessTrackings',
        queryProcessTrackingsFromModelStub
      );

      const processTrackings = await processTrackingService.getProcessTrackings(
        processTrackingFilter
      );
      assert.isOk(processTrackings![0]);
      assert.strictEqual(
        processTrackings![0]._id?.toString(),
        processTrackingId.toString()
      );
      assert.isTrue(queryProcessTrackingsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the processTrackings cannot be found', async () => {
      const processTrackingName = 'processTrackingName1';
      const processTrackingFilter = {name: processTrackingName};
      const errMessage = 'Cannot find the processTracking';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        processTrackingFilter
      );
      const getProcessTrackingFromModelStub = sandbox.stub();
      getProcessTrackingFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'queryProcessTrackings',
        getProcessTrackingFromModelStub
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

      const processTracking = await processTrackingService.getProcessTrackings(
        processTrackingFilter
      );
      assert.notOk(processTracking);

      assert.isTrue(getProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const processTrackingName = 'processTrackingName1';
      const processTrackingFilter = {name: processTrackingName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getProcessTrackingByEmail'
      );
      const getProcessTrackingFromModelStub = sandbox.stub();
      getProcessTrackingFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'queryProcessTrackings',
        getProcessTrackingFromModelStub
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
        await processTrackingService.getProcessTrackings(processTrackingFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateProcessTracking', () => {
    it('will update a processTracking', async () => {
      const processTrackingId = new mongooseTypes.ObjectId();
      const updateProcessTrackingFromModelStub = sandbox.stub();
      updateProcessTrackingFromModelStub.resolves({
        ...mocks.MOCK_PROCESSTRACKING,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingById',
        updateProcessTrackingFromModelStub
      );

      const processTracking =
        await processTrackingService.updateProcessTracking(processTrackingId, {
          deletedAt: new Date(),
        });
      assert.isOk(processTracking);
      assert.strictEqual(processTracking._id, processTrackingId);
      assert.isOk(processTracking.deletedAt);
      assert.isTrue(updateProcessTrackingFromModelStub.calledOnce);
    });
    it('will update a processTracking when the id is a string', async () => {
      const processTrackingId = new mongooseTypes.ObjectId();
      const updateProcessTrackingFromModelStub = sandbox.stub();
      updateProcessTrackingFromModelStub.resolves({
        ...mocks.MOCK_PROCESSTRACKING,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingById',
        updateProcessTrackingFromModelStub
      );

      const processTracking =
        await processTrackingService.updateProcessTracking(
          processTrackingId.toString(),
          {
            deletedAt: new Date(),
          }
        );
      assert.isOk(processTracking);
      assert.strictEqual(processTracking._id, processTrackingId);
      assert.isOk(processTracking.deletedAt);
      assert.isTrue(updateProcessTrackingFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when processTracking model throws it ', async () => {
      const processTrackingId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateProcessTrackingFromModelStub = sandbox.stub();
      updateProcessTrackingFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingById',
        updateProcessTrackingFromModelStub
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
        await processTrackingService.updateProcessTracking(processTrackingId, {
          deletedAt: new Date(),
        });
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when processTracking model throws it ', async () => {
      const processTrackingId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateProcessTrackingFromModelStub = sandbox.stub();
      updateProcessTrackingFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingById',
        updateProcessTrackingFromModelStub
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
        await processTrackingService.updateProcessTracking(processTrackingId, {
          deletedAt: new Date(),
        });
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when processTracking model throws a DataOperationError ', async () => {
      const processTrackingId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateProcessTrackingById'
      );
      const updateProcessTrackingFromModelStub = sandbox.stub();
      updateProcessTrackingFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingById',
        updateProcessTrackingFromModelStub
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
        await processTrackingService.updateProcessTracking(processTrackingId, {
          deletedAt: new Date(),
        });
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProcessTrackingFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
