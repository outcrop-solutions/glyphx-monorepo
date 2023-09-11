// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import {activityLogService} from '../services';
import * as mocks from 'database/src/mongoose/mocks';

describe('#services/activityLog', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createActivityLog', () => {
    it('will create a ActivityLog', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const createdAtId = new mongooseTypes.ObjectId();
      const actorId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const projectId = new mongooseTypes.ObjectId();
      const userAgentId = new mongooseTypes.ObjectId();
      const actionId = new mongooseTypes.ObjectId();
      const onModelId = new mongooseTypes.ObjectId();

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        ...mocks.MOCK_ACTIVITYLOG,
        _id: new mongooseTypes.ObjectId(),
        actor: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        userAgent: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUserAgent,
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      const doc = await activityLogService.createActivityLog({
        ...mocks.MOCK_ACTIVITYLOG,
        _id: new mongooseTypes.ObjectId(),
        actor: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        userAgent: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUserAgent,
      } as unknown as databaseTypes.IActivityLog);

      assert.isTrue(createActivityLogFromModelStub.calledOnce);
    });
    // activityLog model fails
    it('will publish and rethrow an InvalidArgumentError when activityLog model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
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
        await activityLogService.createActivityLog({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when activityLog model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.rejects(err);

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
        await activityLogService.createActivityLog({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when activityLog model throws it', async () => {
      const createActivityLogFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createActivityLogFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
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
        await activityLogService.createActivityLog({});
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when activityLog model throws a DataOperationError', async () => {
      const createActivityLogFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createActivityLogFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
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
        await activityLogService.createActivityLog({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when activityLog model throws a UnexpectedError', async () => {
      const createActivityLogFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(errMessage, 'mongodDb');

      createActivityLogFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
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
        await activityLogService.createActivityLog({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getActivityLog', () => {
    it('should get a activityLog by id', async () => {
      const activityLogId = new mongooseTypes.ObjectId();

      const getActivityLogFromModelStub = sandbox.stub();
      getActivityLogFromModelStub.resolves({
        _id: activityLogId,
      } as unknown as databaseTypes.IActivityLog);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'getActivityLogById',
        getActivityLogFromModelStub
      );

      const activityLog =
        await activityLogService.getActivityLog(activityLogId);
      assert.isOk(activityLog);
      assert.strictEqual(
        activityLog?._id?.toString(),
        activityLogId.toString()
      );

      assert.isTrue(getActivityLogFromModelStub.calledOnce);
    });
    it('should get a activityLog by id when id is a string', async () => {
      const activityLogId = new mongooseTypes.ObjectId();

      const getActivityLogFromModelStub = sandbox.stub();
      getActivityLogFromModelStub.resolves({
        _id: activityLogId,
      } as unknown as databaseTypes.IActivityLog);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'getActivityLogById',
        getActivityLogFromModelStub
      );

      const activityLog = await activityLogService.getActivityLog(
        activityLogId.toString()
      );
      assert.isOk(activityLog);
      assert.strictEqual(
        activityLog?._id?.toString(),
        activityLogId.toString()
      );

      assert.isTrue(getActivityLogFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the activityLog cannot be found', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'activityLogId',
        activityLogId
      );
      const getActivityLogFromModelStub = sandbox.stub();
      getActivityLogFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'getActivityLogById',
        getActivityLogFromModelStub
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

      const activityLog =
        await activityLogService.getActivityLog(activityLogId);
      assert.notOk(activityLog);

      assert.isTrue(getActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getActivityLogById'
      );
      const getActivityLogFromModelStub = sandbox.stub();
      getActivityLogFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'getActivityLogById',
        getActivityLogFromModelStub
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
        await activityLogService.getActivityLog(activityLogId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getActivityLogs', () => {
    it('should get activityLogs by filter', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogId2 = new mongooseTypes.ObjectId();
      const activityLogFilter = {_id: activityLogId};

      const queryActivityLogsFromModelStub = sandbox.stub();
      queryActivityLogsFromModelStub.resolves({
        results: [
          {
            ...mocks.MOCK_ACTIVITYLOG,
            _id: activityLogId,
            actor: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            workspace: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IWorkspace,
            project: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IProject,
            userAgent: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUserAgent,
          } as unknown as databaseTypes.IActivityLog,
          {
            ...mocks.MOCK_ACTIVITYLOG,
            _id: activityLogId2,
            actor: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            workspace: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IWorkspace,
            project: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IProject,
            userAgent: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUserAgent,
          } as unknown as databaseTypes.IActivityLog,
        ],
      } as unknown as databaseTypes.IActivityLog[]);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'queryActivityLogs',
        queryActivityLogsFromModelStub
      );

      const activityLogs =
        await activityLogService.getActivityLogs(activityLogFilter);
      assert.isOk(activityLogs![0]);
      assert.strictEqual(
        activityLogs![0]._id?.toString(),
        activityLogId.toString()
      );
      assert.isTrue(queryActivityLogsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the activityLogs cannot be found', async () => {
      const activityLogName = 'activityLogName1';
      const activityLogFilter = {name: activityLogName};
      const errMessage = 'Cannot find the activityLog';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        activityLogFilter
      );
      const getActivityLogFromModelStub = sandbox.stub();
      getActivityLogFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'queryActivityLogs',
        getActivityLogFromModelStub
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

      const activityLog =
        await activityLogService.getActivityLogs(activityLogFilter);
      assert.notOk(activityLog);

      assert.isTrue(getActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const activityLogName = 'activityLogName1';
      const activityLogFilter = {name: activityLogName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getActivityLogByEmail'
      );
      const getActivityLogFromModelStub = sandbox.stub();
      getActivityLogFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'queryActivityLogs',
        getActivityLogFromModelStub
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
        await activityLogService.getActivityLogs(activityLogFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateActivityLog', () => {
    it('will update a activityLog', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const updateActivityLogFromModelStub = sandbox.stub();
      updateActivityLogFromModelStub.resolves({
        ...mocks.MOCK_ACTIVITYLOG,
        _id: new mongooseTypes.ObjectId(),
        actor: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        userAgent: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUserAgent,
      } as unknown as databaseTypes.IActivityLog);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'updateActivityLogById',
        updateActivityLogFromModelStub
      );

      const activityLog = await activityLogService.updateActivityLog(
        activityLogId,
        {
          deletedAt: new Date(),
        }
      );
      assert.isOk(activityLog);
      assert.strictEqual(activityLog._id, activityLogId);
      assert.isOk(activityLog.deletedAt);
      assert.isTrue(updateActivityLogFromModelStub.calledOnce);
    });
    it('will update a activityLog when the id is a string', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const updateActivityLogFromModelStub = sandbox.stub();
      updateActivityLogFromModelStub.resolves({
        ...mocks.MOCK_ACTIVITYLOG,
        _id: new mongooseTypes.ObjectId(),
        actor: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        userAgent: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUserAgent,
      } as unknown as databaseTypes.IActivityLog);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'updateActivityLogById',
        updateActivityLogFromModelStub
      );

      const activityLog = await activityLogService.updateActivityLog(
        activityLogId.toString(),
        {
          deletedAt: new Date(),
        }
      );
      assert.isOk(activityLog);
      assert.strictEqual(activityLog._id, activityLogId);
      assert.isOk(activityLog.deletedAt);
      assert.isTrue(updateActivityLogFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when activityLog model throws it ', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateActivityLogFromModelStub = sandbox.stub();
      updateActivityLogFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'updateActivityLogById',
        updateActivityLogFromModelStub
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
        await activityLogService.updateActivityLog(activityLogId, {
          deletedAt: new Date(),
        });
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when activityLog model throws it ', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateActivityLogFromModelStub = sandbox.stub();
      updateActivityLogFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'updateActivityLogById',
        updateActivityLogFromModelStub
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
        await activityLogService.updateActivityLog(activityLogId, {
          deletedAt: new Date(),
        });
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when activityLog model throws a DataOperationError ', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateActivityLogById'
      );
      const updateActivityLogFromModelStub = sandbox.stub();
      updateActivityLogFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'updateActivityLogById',
        updateActivityLogFromModelStub
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
        await activityLogService.updateActivityLog(activityLogId, {
          deletedAt: new Date(),
        });
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
