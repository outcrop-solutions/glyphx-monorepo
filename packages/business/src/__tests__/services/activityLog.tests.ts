import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from '@glyphx/database';
import {error} from '@glyphx/core';
import {activityLogService} from '../../services';

describe('#services/activityLog', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('getLog', () => {
    it('should get a log by id', async () => {
      const activityLogId = new mongooseTypes.ObjectId();

      const getLogFromModelStub = sandbox.stub();
      getLogFromModelStub.resolves({
        _id: activityLogId,
      } as unknown as databaseTypes.IActivityLog);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'getActivityLogById',
        getLogFromModelStub
      );

      const activityLog = await activityLogService.getLog(activityLogId);
      assert.isOk(activityLog);
      assert.strictEqual(
        activityLog?._id?.toString(),
        activityLogId.toString()
      );

      assert.isTrue(getLogFromModelStub.calledOnce);
    });

    it('should get a log by id when id is a string', async () => {
      const activityLogId = new mongooseTypes.ObjectId();

      const getLogFromModelStub = sandbox.stub();
      getLogFromModelStub.resolves({
        _id: activityLogId,
      } as unknown as databaseTypes.IActivityLog);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'getActivityLogById',
        getLogFromModelStub
      );

      const activityLog = await activityLogService.getLog(
        activityLogId.toString()
      );
      assert.isOk(activityLog);
      assert.strictEqual(
        activityLog?._id?.toString(),
        activityLogId.toString()
      );

      assert.isTrue(getLogFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the log cannot be found', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'getActivityLogById',
        activityLogId
      );
      const getLogFromModelStub = sandbox.stub();
      getLogFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'getActivityLogById',
        getLogFromModelStub
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

      const activityLog = await activityLogService.getLog(activityLogId);
      assert.notOk(activityLog);

      assert.isTrue(getLogFromModelStub.calledOnce);
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
      const getLogFromModelStub = sandbox.stub();
      getLogFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'getActivityLogById',
        getLogFromModelStub
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
        await activityLogService.getLog(activityLogId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getLogs', () => {
    it('should get activityLogs by filter', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const projectId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLog1';

      const queryActivityLogsFromModelStub = sandbox.stub();
      queryActivityLogsFromModelStub.resolves({
        results: [
          {
            _id: activityLogId,
            name: activityLogName,
          },
        ],
      } as unknown as databaseTypes.IActivityLog[]);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'queryActivityLogs',
        queryActivityLogsFromModelStub
      );

      const activityLogs = await activityLogService.getLogs(
        projectId,
        databaseTypes.constants.RESOURCE_MODEL.PROJECT
      );
      assert.isOk(activityLogs![0]);
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
      const getLogFromModelStub = sandbox.stub();
      getLogFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'queryActivityLogs',
        getLogFromModelStub
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

      const activityLog = await activityLogService.getLogs(activityLogFilter);
      assert.notOk(activityLog);

      assert.isTrue(getLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const activityLogName = 'activityLogName1';
      const activityLogFilter = {name: activityLogName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getLogByEmail'
      );
      const getLogFromModelStub = sandbox.stub();
      getLogFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'queryActivityLogs',
        getLogFromModelStub
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
        await activityLogService.getLogs(activityLogFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('createLog', () => {
    it('will create a ActivityLog, attach to workspace models, and create activityLog membership', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const memberEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.resolves({
        _id: memberId,
        type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IMember);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
      );

      // ActivityLog.addMembers
      const updateActivityLogStub = sandbox.stub();
      updateActivityLogStub.resolves({
        _id: activityLogId,
        members: [{_id: memberId}],
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'addMembers',
        updateActivityLogStub
      );

      // user.addMembership
      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        members: [{_id: memberId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addMembership',
        updateUserStub
      );

      // workspace.addActivityLogs
      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.resolves({
        _id: workspaceId,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addActivityLogs',
        updateWorkspaceStub
      );

      const doc = await activityLogService.createActivityLog(
        activityLogName,
        workspaceId,
        memberId.toString(),
        memberEmail
      );

      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(createActivityLogMemberFromModelStub.calledOnce);
      assert.isTrue(updateActivityLogStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(updateWorkspaceStub.calledOnce);
    });
    it('will create a ActivityLog, attach to workspace models, and create activityLog membership when workspaceId is a string', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.resolves({
        _id: memberId,
        type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IMember);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
      );

      // ActivityLog.addMembers
      const updateActivityLogStub = sandbox.stub();
      updateActivityLogStub.resolves({
        _id: activityLogId,
        members: [{_id: memberId}],
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'addMembers',
        updateActivityLogStub
      );

      // user.addMembership
      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        members: [{_id: memberId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addMembership',
        updateUserStub
      );

      // workspace.addActivityLogs
      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.resolves({
        _id: workspaceId,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addActivityLogs',
        updateWorkspaceStub
      );

      const doc = await activityLogService.createActivityLog(
        activityLogName,
        workspaceId.toString(),
        userId,
        userEmail
      );

      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(updateWorkspaceStub.calledOnce);
      // assert.isOk(doc.workspace.activityLogs);
    });
    it('will create a ActivityLog, attach to workspace models, and create activityLog membership when userId is a string', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.resolves({
        _id: memberId,
        type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IMember);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
      );

      // ActivityLog.addMembers
      const updateActivityLogStub = sandbox.stub();
      updateActivityLogStub.resolves({
        _id: activityLogId,
        members: [{_id: memberId}],
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'addMembers',
        updateActivityLogStub
      );

      // user.addMembership
      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        members: [{_id: memberId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addMembership',
        updateUserStub
      );

      // workspace.addActivityLogs
      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.resolves({
        _id: workspaceId,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addActivityLogs',
        updateWorkspaceStub
      );

      const doc = await activityLogService.createActivityLog(
        activityLogName,
        userId.toString(),
        workspaceId,
        userEmail
      );

      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(updateWorkspaceStub.calledOnce);
      assert.isOk(doc.workspace.activityLogs);
    });

    // activityLog model fails
    it('will publish and rethrow an DataValidationError when activityLog model throws it', async () => {
      const activityLogName = 'activityLogName1';
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'tetsinguseremail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();

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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId,
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when activityLog model throws a DataOperationError', async () => {
      const activityLogName = 'activityLogName1';
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'tetsinguseremail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();

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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId.toString(),
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when activityLog model throws a UnexpectedError', async () => {
      const activityLogName = 'activityLogName1';
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'tetsinguseremail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();

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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId.toString(),
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // member model fails
    it('will publish and rethrow an InvalidArgumentError when member model throws it', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId,
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(createActivityLogMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when member model throws it', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const memberId = new mongooseTypes.ObjectId();
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'tetsinguseremail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId.toString(),
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(createActivityLogMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when member model throws a DataOperationError', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.DatabaseOperationError(errMessage, '', '');

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId.toString(),
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(createActivityLogMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // activityLog model fails
    it('will publish and rethrow an InvalidArgumentError when pr model throws it', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.resolves({
        _id: memberId,
        type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IMember);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
      );

      // ActivityLog.addMembers
      const updateActivityLogStub = sandbox.stub();
      updateActivityLogStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'addMembers',
        updateActivityLogStub
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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId,
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(createActivityLogMemberFromModelStub.calledOnce);
      assert.isTrue(updateActivityLogStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when workspace model throws it', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.resolves({
        _id: memberId,
        type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IMember);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
      );

      // ActivityLog.addMembers
      const updateActivityLogStub = sandbox.stub();
      updateActivityLogStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'addMembers',
        updateActivityLogStub
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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId.toString(),
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(createActivityLogMemberFromModelStub.calledOnce);
      assert.isTrue(updateActivityLogStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when workspace model throws a DataOperationError', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.DatabaseOperationError(errMessage, '', '');

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.resolves({
        _id: memberId,
        type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IMember);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
      );

      // ActivityLog.addMembers
      const updateActivityLogStub = sandbox.stub();
      updateActivityLogStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'addMembers',
        updateActivityLogStub
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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId.toString(),
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(createActivityLogMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // user model fails
    it('will publish and rethrow an InvalidArgumentError when pr model throws it', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.resolves({
        _id: memberId,
        type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IMember);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
      );

      // ActivityLog.addMembers
      const updateActivityLogStub = sandbox.stub();
      updateActivityLogStub.resolves({
        _id: activityLogId,
        members: [{_id: memberId}],
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'addMembers',
        updateActivityLogStub
      );

      // user.addMembership
      const updateUserStub = sandbox.stub();
      updateUserStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addMembership',
        updateUserStub
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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId,
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(createActivityLogMemberFromModelStub.calledOnce);
      assert.isTrue(updateActivityLogStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when workspace model throws it', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.resolves({
        _id: memberId,
        type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IMember);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
      );

      // ActivityLog.addMembers
      const updateActivityLogStub = sandbox.stub();
      updateActivityLogStub.resolves({
        _id: activityLogId,
        members: [{_id: memberId}],
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'addMembers',
        updateActivityLogStub
      );

      // user.addMembership
      const updateUserStub = sandbox.stub();
      updateUserStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addMembership',
        updateUserStub
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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId.toString(),
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(createActivityLogMemberFromModelStub.calledOnce);
      assert.isTrue(updateActivityLogStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when workspace model throws a DataOperationError', async () => {
      const activityLogId = new mongooseTypes.ObjectId();
      const activityLogName = 'activityLogName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.DatabaseOperationError(errMessage, '', '');

      // createActivityLog
      const createActivityLogFromModelStub = sandbox.stub();
      createActivityLogFromModelStub.resolves({
        _id: activityLogId,
        name: activityLogName,
        members: {
          _id: memberId,
        },
        workspace: {
          _id: workspaceId,
          activityLogs: [
            {_id: activityLogId} as unknown as databaseTypes.IActivityLog,
          ],
        },
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'createActivityLog',
        createActivityLogFromModelStub
      );

      // createActivityLogMember
      const createActivityLogMemberFromModelStub = sandbox.stub();
      createActivityLogMemberFromModelStub.resolves({
        _id: memberId,
        type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        activityLogs: [{_id: activityLogId}],
      } as unknown as databaseTypes.IMember);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createActivityLogMember',
        createActivityLogMemberFromModelStub
      );

      // ActivityLog.addMembers
      const updateActivityLogStub = sandbox.stub();
      updateActivityLogStub.resolves({
        _id: activityLogId,
        members: [{_id: memberId}],
      } as unknown as databaseTypes.IActivityLog);

      sandbox.replace(
        dbConnection.models.ActivityLogModel,
        'addMembers',
        updateActivityLogStub
      );

      // user.addMembership
      const updateUserStub = sandbox.stub();
      updateUserStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addMembership',
        updateUserStub
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
        await activityLogService.createActivityLog(
          activityLogName,
          userId,
          workspaceId.toString(),
          userEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createActivityLogFromModelStub.calledOnce);
      assert.isTrue(createActivityLogMemberFromModelStub.calledOnce);
      assert.isTrue(updateActivityLogStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
