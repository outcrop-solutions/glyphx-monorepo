import 'mocha';
import {assert} from 'chai';
import {v4} from 'uuid';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {databaseTypes} from 'types';
import {activityLogService} from '../services';

type ObjectId = mongooseTypes.ObjectId;
const UNIQUE_KEY = v4().replaceAll('-', '');

const INPUT_USER: databaseTypes.IUser = {
  _id: new mongooseTypes.ObjectId(),
  name: 'testUser' + UNIQUE_KEY,
  userCode: 'testUserCode' + UNIQUE_KEY,
  username: 'testUserName' + UNIQUE_KEY,
  email: 'testemail' + UNIQUE_KEY + '@gmail.com',
  emailVerified: new Date(),
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [],
  sessions: [],
  membership: [],
  invitedMembers: [],
  createdWorkspaces: [],
  projects: [],
  webhooks: [],
};

const INPUT_WORKSPACE: databaseTypes.IWorkspace = {
  _id: new mongooseTypes.ObjectId(),
  workspaceCode: 'testWorkspace' + UNIQUE_KEY,
  inviteCode: 'testWorkspace' + UNIQUE_KEY,
  name: 'testName' + UNIQUE_KEY,
  slug: 'testSlug' + UNIQUE_KEY,
  updatedAt: new Date(),
  createdAt: new Date(),
  description: 'testDescription',
  tags: [],
  projects: [],
  members: [],
  states: [],
  creator: INPUT_USER,
};

const INPUT_ACTIVITY_LOG: databaseTypes.IActivityLog = {
  _id: new mongooseTypes.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  actor: INPUT_USER,
  workspaceId: INPUT_WORKSPACE._id,
  location: 'ipaddresstest', // IP address
  userAgent: {
    userAgent: '',
    platform: '',
    appName: '',
    appVersion: '',
    vendor: '',
    language: '',
    cookieEnabled: false,
  },
  action: databaseTypes.constants.ACTION_TYPE.CREATED,
  onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
  resource: INPUT_WORKSPACE,
};

describe('#ActivityLogService', () => {
  const mongoConnection = new MongoDbConnection();

  context('test the functions of the activityLog service', () => {
    let activityLogId: ObjectId;
    let workspaceId: ObjectId;
    let userId: ObjectId;
    let activityLogDocument;
    let workspaceDocument;
    let userDocument;

    let createdLog;

    before(async () => {
      await mongoConnection.init();

      // create workspace
      const workspaceModel = mongoConnection.models.ActivityLogModel;
      await workspaceModel.create(INPUT_WORKSPACE as databaseTypes.IWorkspace);

      const savedWorkspaceDocument = await workspaceModel
        .findOne({workspaceCode: INPUT_WORKSPACE.workspaceCode})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;

      workspaceDocument = savedWorkspaceDocument;

      assert.isOk(workspaceId);

      // create user
      const userModel = mongoConnection.models.UserModel;

      await userModel.create(INPUT_USER as databaseTypes.IUser);
      const savedUserDocument = await userModel.findOne({userCode: INPUT_USER.userCode}).lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;

      assert.isOk(userId);

      // create log
      const activityLogModel = mongoConnection.models.ActivityLogModel;
      await activityLogModel.createActivityLog(INPUT_ACTIVITY_LOG as databaseTypes.IActivityLog);

      const savedActivityLogDocument = await activityLogModel.findOne({location: INPUT_ACTIVITY_LOG.location}).lean();
      activityLogId = savedActivityLogDocument?._id as mongooseTypes.ObjectId;

      activityLogDocument = savedActivityLogDocument;

      assert.isOk(activityLogId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const userModel = mongoConnection.models.UserModel;
      const activityLogModel = mongoConnection.models.ActivityLogModel;

      // delete workspace
      if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }

      // delete user
      if (userId) {
        await userModel.findByIdAndDelete(userId);
      }

      // delete logs
      if (activityLogId) {
        await activityLogModel.findByIdAndDelete(activityLogId);
      }

      // delete created log
      if (createdLog) {
        await activityLogModel.findByIdAndDelete(createdLog._id);
      }
    });

    it('will retreive our activityLog from the database', async () => {
      const activityLog = await activityLogService.getLog(activityLogId.toString());
      assert.isOk(activityLog);
      assert.strictEqual(activityLog?.location, activityLogDocument.location);
    });
    it('will retreive activityLogs from the database', async () => {
      const activityLogs = await activityLogService.getLogs(
        workspaceDocument._id.toString(),
        databaseTypes.constants.RESOURCE_MODEL.WORKSPACE
      );
      assert.isOk(activityLogs);
    });
    it('will create an activityLog', async () => {
      const activityLog = await activityLogService.createLog({
        resourceId: workspaceDocument._id.toString(),
        actorId: userDocument._id.toString(),
        workspaceId: workspaceDocument._id.toString(),
        location: INPUT_ACTIVITY_LOG.location,
        userAgent: INPUT_ACTIVITY_LOG.userAgent,
        onModel: INPUT_ACTIVITY_LOG.onModel,
        action: INPUT_ACTIVITY_LOG.action,
      });
      createdLog = activityLog;

      assert.isOk(activityLog);
    });
  });
});
