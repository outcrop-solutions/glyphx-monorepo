import {assert} from 'chai';
import {ActivityLogModel} from '../../../mongoose/models/activityLog';
import {IActivityLogCreateInput} from '../../../mongoose/interfaces/iActivityLogCreateInput';
import {UserModel} from '../../../mongoose/models/user';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {StateModel} from '../../../mongoose/models/state';
import {ProjectModel} from '../../../mongoose/models/project';
import {MemberModel} from '../../../mongoose/models/member';
import {WebhookModel} from '../../../mongoose/models/webhook';
import {ProcessTrackingModel} from '../../../mongoose/models/processTracking';
import {CustomerPaymentModel} from '../../../mongoose/models/customerPayment';
import {databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

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
const MOCK_ACTIVITY_LOG = {
  createdAt: new Date(),
  updatedAt: new Date(),
  actor: {
    _id: new mongoose.Types.ObjectId(),
    __v: 1,
  } as unknown as databaseTypes.IUser,
  location: '127.0.0.1',
  userAgent: 'Chrome' as databaseTypes.IUserAgent,
  action: databaseTypes.constants.ACTION_TYPE.CREATED,
  onModel: databaseTypes.constants.RESOURCE_MODEL.PROCESS_TRACKING,
  resource: {
    _id: new mongoose.Types.ObjectId(),
    __v: 1,
  } as unknown as databaseTypes.IProcessTracking,
  __v: 1,
} as unknown as databaseTypes.IActivityLog;

describe('#mongoose/models/activityLog', () => {
  context('activityLogIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return true if the activityLogId exists', async () => {
      const activityLogId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      const result = await ActivityLogModel.activityLogIdExists(activityLogId);
      assert.isTrue(result);
    });
    it('will return false if the activityLogId does not exist', async () => {
      const activityLogId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves();
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      const result = await ActivityLogModel.activityLogIdExists(activityLogId);
      assert.isFalse(result);
    });
    it('will throw a DatabaseOperationError if the underlyong database call fails ', async () => {
      const activityLogId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('A database error has occurred');
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ActivityLogModel.activityLogIdExists(activityLogId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('allActivityLogIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return true if all the activityLogIds exist', async () => {
      const activityLogIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const findResult = activityLogIds.map((activityLogId) => {
        return {
          _id: activityLogId,
        } as databaseTypes.IActivityLog;
      });
      const findStub = sandbox.stub();
      findStub.resolves(findResult);
      sandbox.replace(ActivityLogModel, 'find', findStub);

      const result = await ActivityLogModel.allActivityLogIdsExist(activityLogIds);
      assert.isTrue(result);
    });

    it('will throw a DataNotFoundError if one or more activityLogIds are not found', async () => {
      const activityLogIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const findResult = [
        {
          _id: activityLogIds[0],
        } as databaseTypes.IActivityLog,
      ];
      const findStub = sandbox.stub();
      findStub.resolves(findResult);
      sandbox.replace(ActivityLogModel, 'find', findStub);

      let errored = false;
      try {
        await ActivityLogModel.allActivityLogIdsExist(activityLogIds);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a database operation error if the underlying database call fails', async () => {
      const activityLogIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const findStub = sandbox.stub();
      findStub.rejects('a database error has occured');
      sandbox.replace(ActivityLogModel, 'find', findStub);

      let errored = false;
      try {
        await ActivityLogModel.allActivityLogIdsExist(activityLogIds);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('getActivityLogById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the activityLog that exists', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(MOCK_ACTIVITY_LOG));
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      const result = await ActivityLogModel.getActivityLogById(MOCK_ACTIVITY_LOG._id as mongoose.Types.ObjectId);
      assert.isOk(result);
      assert.strictEqual(result._id?.toString(), MOCK_ACTIVITY_LOG._id?.toString());

      assert.isUndefined((result as any).__v);
      assert.isUndefined((result as any).actor.__v);
      assert.isUndefined((result as any).resource.__v);
    });

    it('will throw a DataNotFoundError when the ActivityLog does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(undefined));
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ActivityLogModel.getActivityLogById(MOCK_ACTIVITY_LOG._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database call fails', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('A database error has occured', true));
      sandbox.replace(ActivityLogModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ActivityLogModel.getActivityLogById(MOCK_ACTIVITY_LOG._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('queryActivityLogs', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('will return the activityLogs that match the query', async () => {
      const findStub = sandbox.stub();
      findStub.returns(new MockMongooseQuery([MOCK_ACTIVITY_LOG]));
      sandbox.replace(ActivityLogModel, 'find', findStub);

      const countStub = sandbox.stub();
      countStub.resolves(1);
      sandbox.replace(ActivityLogModel, 'count', countStub);

      const result = await ActivityLogModel.queryActivityLogs({}, 0, 10);
      assert.isOk(result);
      assert.strictEqual(result.numberOfItems, 1);
      assert.strictEqual(result.results.length, 1);
      assert.strictEqual(result.page, 0);
      assert.strictEqual(result.itemsPerPage, 10);

      const activityLog = result.results[0];
      assert.isUndefined((activityLog as any).__v);
      assert.isUndefined((activityLog as any).actor.__v);
      assert.isUndefined((activityLog as any).resource.__v);
    });

    it('will return the activityLogs that match the query with default page and pagesize', async () => {
      const findStub = sandbox.stub();
      findStub.returns(new MockMongooseQuery([MOCK_ACTIVITY_LOG]));
      sandbox.replace(ActivityLogModel, 'find', findStub);

      const countStub = sandbox.stub();
      countStub.resolves(1);
      sandbox.replace(ActivityLogModel, 'count', countStub);

      const result = await ActivityLogModel.queryActivityLogs({});
      assert.isOk(result);
      assert.strictEqual(result.numberOfItems, 1);
      assert.strictEqual(result.results.length, 1);
      assert.strictEqual(result.page, 0);
      assert.strictEqual(result.itemsPerPage, 10);

      const activityLog = result.results[0];
      assert.isUndefined((activityLog as any).__v);
      assert.isUndefined((activityLog as any).actor.__v);
      assert.isUndefined((activityLog as any).resource.__v);
    });
    it('will throw a DataNotFoundError if the filter yeilds 0 documents', async () => {
      const findStub = sandbox.stub();
      findStub.returns(new MockMongooseQuery([MOCK_ACTIVITY_LOG]));
      sandbox.replace(ActivityLogModel, 'find', findStub);

      const countStub = sandbox.stub();
      countStub.resolves(0);
      sandbox.replace(ActivityLogModel, 'count', countStub);
      let errored = false;
      try {
        await ActivityLogModel.queryActivityLogs({}, 0, 10);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError if the page number is out of bounds', async () => {
      const findStub = sandbox.stub();
      findStub.returns(new MockMongooseQuery([MOCK_ACTIVITY_LOG]));
      sandbox.replace(ActivityLogModel, 'find', findStub);

      const countStub = sandbox.stub();
      countStub.resolves(1);
      sandbox.replace(ActivityLogModel, 'count', countStub);
      let errored = false;
      try {
        await ActivityLogModel.queryActivityLogs({}, 2, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError if the underlyong database call fails', async () => {
      const findStub = sandbox.stub();
      findStub.rejects('a database error has occured');
      sandbox.replace(ActivityLogModel, 'find', findStub);

      const countStub = sandbox.stub();
      countStub.resolves(1);
      sandbox.replace(ActivityLogModel, 'count', countStub);
      let errored = false;
      try {
        await ActivityLogModel.queryActivityLogs({}, 0, 10);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
  context('createActivityLog', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create the activityLog with relations as objects/strings and User Resource', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = {
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUser;

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId().toString();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = {
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUser;
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.USER;
      //      const resourceIdExistsStub = sandbox.stub();
      //      resourceIdExistsStub.resolves(true);
      //      sandbox.replace(UserModel, 'userIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      const result = await ActivityLogModel.createActivityLog(mockActivityCopy);
      assert.isOk(result);
      assert.isTrue(userIdExistsStub.calledTwice);
      assert.isTrue(workspaceIdExistsStub.calledOnce);
      //      assert.isTrue(resourceIdExistsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
    });

    it('will create the activityLog with relations as ObjectIds and User Resource', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.USER;

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      const result = await ActivityLogModel.createActivityLog(mockActivityCopy);
      assert.isOk(result);
      assert.isTrue(userIdExistsStub.calledTwice);
      assert.isTrue(workspaceIdExistsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
    });

    it('will throw an InvalidArgumentError when the user resource does not exist', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      userIdExistsStub.onCall(1).resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.USER;

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will create the activityLog with relations as ObjectIds and Project Resource', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.PROJECT;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      const result = await ActivityLogModel.createActivityLog(mockActivityCopy);
      assert.isOk(result);
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(workspaceIdExistsStub.calledOnce);
      assert.isTrue(resourceIdExistsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
    });

    it('will throw an InvalidArgumentError when the project resource does not exist', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.PROJECT;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(false);
      sandbox.replace(ProjectModel, 'projectIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will create the activityLog with relations as ObjectIds and State Resource', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.STATE;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      const result = await ActivityLogModel.createActivityLog(mockActivityCopy);
      assert.isOk(result);
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(workspaceIdExistsStub.calledOnce);
      assert.isTrue(resourceIdExistsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
    });

    it('will throw an InvalidArgumentError when the state resource does not exist', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.STATE;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(false);
      sandbox.replace(StateModel, 'stateIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will create the activityLog with relations as ObjectIds and CustomerPayment Resource', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.CUSTOMER_PAYMENT;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(true);
      sandbox.replace(CustomerPaymentModel, 'customerPaymentIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      const result = await ActivityLogModel.createActivityLog(mockActivityCopy);
      assert.isOk(result);
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(workspaceIdExistsStub.calledOnce);
      assert.isTrue(resourceIdExistsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
    });

    it('will throw an InvalidArgumentError when the customerPayment resource does not exist', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.CUSTOMER_PAYMENT;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(false);
      sandbox.replace(CustomerPaymentModel, 'customerPaymentIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will create the activityLog with relations as ObjectIds and Member Resource', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.MEMBER;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(true);
      sandbox.replace(MemberModel, 'memberIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      const result = await ActivityLogModel.createActivityLog(mockActivityCopy);
      assert.isOk(result);
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(workspaceIdExistsStub.calledOnce);
      assert.isTrue(resourceIdExistsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
    });

    it('will throw an InvalidArgumentError when the member resource does not exist', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.MEMBER;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(false);
      sandbox.replace(MemberModel, 'memberIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will create the activityLog with relations as ObjectIds and Webhook Resource', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.WEBHOOK;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(true);
      sandbox.replace(WebhookModel, 'webhookIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      const result = await ActivityLogModel.createActivityLog(mockActivityCopy);
      assert.isOk(result);
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(workspaceIdExistsStub.calledOnce);
      assert.isTrue(resourceIdExistsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
    });

    it('will throw an InvalidArgumentError when the webhook resource does not exist', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.WEBHOOK;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(false);
      sandbox.replace(WebhookModel, 'webhookIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will create the activityLog with relations as ObjectIds and ProcessTracking Resource', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.PROCESS_TRACKING;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(true);
      sandbox.replace(ProcessTrackingModel, 'processTrackingIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      const result = await ActivityLogModel.createActivityLog(mockActivityCopy);
      assert.isOk(result);
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(workspaceIdExistsStub.calledOnce);
      assert.isTrue(resourceIdExistsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
    });

    it('will throw an InvalidArgumentError when the processTracking resource does not exist', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.PROCESS_TRACKING;
      const resourceIdExistsStub = sandbox.stub();
      resourceIdExistsStub.resolves(false);
      sandbox.replace(ProcessTrackingModel, 'processTrackingIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will create the activityLog with relations as ObjectIds and Workspace Resource', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.WORKSPACE;

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      const result = await ActivityLogModel.createActivityLog(mockActivityCopy);
      assert.isOk(result);
      assert.isTrue(userIdExistsStub.calledOnce);
      assert.isTrue(workspaceIdExistsStub.calledTwice);
      assert.isTrue(validateStub.calledOnce);
      assert.isTrue(createStub.calledOnce);
    });

    it('will throw an InvalidArgumentError when the workspoace resource does not exist', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = new mongoose.Types.ObjectId();

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      workspaceIdExistsStub.onCall(1).resolves(false);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = new mongoose.Types.ObjectId();
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.WORKSPACE;

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DataValidationError if the validation fails', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = {
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUser;

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId().toString();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = {
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUser;
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.USER;
      //      const resourceIdExistsStub = sandbox.stub();
      //      resourceIdExistsStub.resolves(true);
      //      sandbox.replace(UserModel, 'userIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.rejects('That is not valid');
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.resolves([{_id: new mongoose.Types.ObjectId()}]);
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError if the underlyong create fails', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = {
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUser;

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId().toString();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = {
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUser;
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.USER;
      //      const resourceIdExistsStub = sandbox.stub();
      //      resourceIdExistsStub.resolves(true);
      //      sandbox.replace(UserModel, 'userIdExists', resourceIdExistsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.rejects('you cannot create that');
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError if the user does not exist', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = {
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUser;

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId().toString();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = {
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUser;
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.USER;

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.rejects('you cannot create that');
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError if the workspace does not exist', async () => {
      const mockActivityCopy = {
        ...MOCK_ACTIVITY_LOG,
      } as IActivityLogCreateInput;
      mockActivityCopy.actor = {
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUser;

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      mockActivityCopy.workspaceId = new mongoose.Types.ObjectId().toString();
      const workspaceIdExistsStub = sandbox.stub();
      workspaceIdExistsStub.resolves(false);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceIdExistsStub);

      mockActivityCopy.resource = {
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUser;
      mockActivityCopy.onModel = databaseTypes.constants.RESOURCE_MODEL.USER;

      const validateStub = sandbox.stub();
      validateStub.resolves();
      sandbox.replace(ActivityLogModel, 'validate', validateStub);

      const createStub = sandbox.stub();
      createStub.rejects('you cannot create that');
      sandbox.replace(ActivityLogModel, 'create', createStub);

      const getActivityLogByIdStub = sandbox.stub();
      getActivityLogByIdStub.resolves(MOCK_ACTIVITY_LOG);
      sandbox.replace(ActivityLogModel, 'getActivityLogById', getActivityLogByIdStub);
      let errored = false;
      try {
        await ActivityLogModel.createActivityLog(mockActivityCopy);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
});
