import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');
//1. Workspace
const INPUT_WORKSPACE = {
  name: 'testWorkspace' + UNIQUE_KEY,
  description: 'testworkspace' + UNIQUE_KEY,
  owner: {},
  members: [],
  projects: [],
};
//2. Account
const INPUT_ACCOUNT = {
  type: databaseTypes.constants.ACCOUNT_TYPE.CUSTOMER,
  provider: databaseTypes.constants.ACCOUNT_PROVIDER.COGNITO,
  providerAccountId: 'accountId' + UNIQUE_KEY,
  refresh_token: 'refreshToken' + UNIQUE_KEY,
  refresh_token_expires_in: new Date().getTime(),
  access_token: 'accessToken' + UNIQUE_KEY,
  expires_at: new Date().getTime(),
  token_type: databaseTypes.constants.TOKEN_TYPE.ACCESS,
  scope: 'scope' + UNIQUE_KEY,
  id_token: 'idToken' + UNIQUE_KEY,
  session_state: databaseTypes.constants.SESSION_STATE.NEW,
  oauth_token_secret: 'oauthTokenSecret' + UNIQUE_KEY,
  oauth_token: 'oauthToken' + UNIQUE_KEY,
  user: {},
};

const INPUT_ACCOUNT2 = {
  type: databaseTypes.constants.ACCOUNT_TYPE.CUSTOMER,
  provider: databaseTypes.constants.ACCOUNT_PROVIDER.COGNITO,
  providerAccountId: 'accountId2' + UNIQUE_KEY,
  refresh_token: 'refreshToken2' + UNIQUE_KEY,
  refresh_token_expires_in: new Date().getTime(),
  access_token: 'accessToken2' + UNIQUE_KEY,
  expires_at: new Date().getTime(),
  token_type: databaseTypes.constants.TOKEN_TYPE.ACCESS,
  scope: 'scope2' + UNIQUE_KEY,
  id_token: 'idToken2' + UNIQUE_KEY,
  session_state: databaseTypes.constants.SESSION_STATE.NEW,
  oauth_token_secret: 'oauthTokenSecret2' + UNIQUE_KEY,
  oauth_token: 'oauthToken2' + UNIQUE_KEY,
  user: {},
};
//3. Session

const INPUT_SESSION = {
  sessionToken: 'testSessionToken' + UNIQUE_KEY,
  expires: new Date(),
  user: {},
};

const INPUT_SESSION2 = {
  sessionToken: 'testSessionToken2' + UNIQUE_KEY,
  expires: new Date(),
  user: {},
};

//4. Webhooks
const INPUT_WEBHOOKS = {
  name: 'testWebhook' + UNIQUE_KEY,
  url: 'testurl' + UNIQUE_KEY,
  user: {},
};

const INPUT_WEBHOOKS2 = {
  name: 'testWebhook2' + UNIQUE_KEY,
  url: 'testurl2' + UNIQUE_KEY,
  user: {},
};

//5. Owned Orgs
const INPUT_OWNED_WORKSPACE = {
  name: 'testOwnedWorkspace' + UNIQUE_KEY,
  description: 'testOwnedWorkspace' + UNIQUE_KEY,
  owner: {},
  members: [],
  projects: [],
};

const INPUT_OWNED_WORKSPACE2 = {
  name: 'testOwnedWorkspace2' + UNIQUE_KEY,
  description: 'testOwnedWorkspace2' + UNIQUE_KEY,
  owner: {},
  members: [],
  projects: [],
};

//6. Projects
const INPUT_PROJECT = {
  name: 'testProject' + UNIQUE_KEY,
  sdtPath: 'testsdtPath' + UNIQUE_KEY,
  workspace: {},
  slug: 'testSlug' + UNIQUE_KEY,
  isTemplate: false,
  type: {},
  owner: {},
  state: {},
  files: [],
};

const INPUT_PROJECT2 = {
  name: 'testProject2' + UNIQUE_KEY,
  sdtPath: 'testsdtPath2' + UNIQUE_KEY,
  workspace: {},
  slug: 'testSlug2' + UNIQUE_KEY,
  isTemplate: false,
  type: {},
  owner: {},
  state: {},
  files: [],
};

const INPUT_DATA = {
  name: 'testUser' + UNIQUE_KEY,
  username: 'testUserName' + UNIQUE_KEY,
  gh_username: 'testGhUserName' + UNIQUE_KEY,
  email: 'testEmail' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  image: 'testimage' + UNIQUE_KEY,
  apiKey: 'testApiKey' + UNIQUE_KEY,
  role: databaseTypes.constants.ROLE.MEMBER,
  workspace: {},
  accounts: [],
  sessions: [],
  webhooks: [],
  createdWorkspace: [],
  projects: [],
};

describe('#UserModel', () => {
  context('test the crud functions of the user model', () => {
    const mongoConnection = new MongoDbConnection();
    const userModel = mongoConnection.models.UserModel;
    let userId: ObjectId;

    let workspaceId: ObjectId;
    let workspaceDocument: any;

    let accountId: ObjectId;
    let accountDocument: any;

    let accountId2: ObjectId;

    let sessionId: ObjectId;
    let sessionDocument: any;

    let sessionId2: ObjectId;

    let webhookId: ObjectId;
    let webhookDocument: any;

    let webhookId2: ObjectId;

    let ownedWorkspaceId: ObjectId;
    let ownedWorkspaceDocument: any;

    let ownedWorkspaceId2: ObjectId;

    let projectId: ObjectId;
    let projectDocument: any;
    let projectId2: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.create([INPUT_WORKSPACE], {
        validateBeforeSave: false,
      });
      const savedWorkspaceDocument = await workspaceModel
        .findOne({name: INPUT_WORKSPACE.name})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;

      workspaceDocument = savedWorkspaceDocument;

      assert.isOk(workspaceId);

      const accountModel = mongoConnection.models.AccountModel;
      await accountModel.create([INPUT_ACCOUNT], {
        validateBeforeSave: false,
      });
      const savedAccountDocument = await accountModel
        .findOne({providerAccountId: INPUT_ACCOUNT.providerAccountId})
        .lean();
      accountId = savedAccountDocument?._id as mongooseTypes.ObjectId;

      accountDocument = savedAccountDocument;

      assert.isOk(accountId);

      await accountModel.create([INPUT_ACCOUNT2], {
        validateBeforeSave: false,
      });
      const savedAccountDocument2 = await accountModel
        .findOne({providerAccountId: INPUT_ACCOUNT2.providerAccountId})
        .lean();
      accountId2 = savedAccountDocument2?._id as mongooseTypes.ObjectId;

      assert.isOk(accountId2);

      const sessionModel = mongoConnection.models.SessionModel;
      await sessionModel.create([INPUT_SESSION], {
        validateBeforeSave: false,
      });
      const savedSessionDocument = await sessionModel
        .findOne({sessionToken: INPUT_SESSION.sessionToken})
        .lean();
      sessionId = savedSessionDocument?._id as mongooseTypes.ObjectId;

      sessionDocument = savedSessionDocument;

      assert.isOk(sessionId);

      await sessionModel.create([INPUT_SESSION2], {
        validateBeforeSave: false,
      });
      const savedSessionDocument2 = await sessionModel
        .findOne({sessionToken: INPUT_SESSION2.sessionToken})
        .lean();
      sessionId2 = savedSessionDocument2?._id as mongooseTypes.ObjectId;

      assert.isOk(sessionId2);

      const webhookModel = mongoConnection.models.WebhookModel;
      await webhookModel.create([INPUT_WEBHOOKS], {
        validateBeforeSave: false,
      });
      const savedWebhookDocument = await webhookModel
        .findOne({name: INPUT_WEBHOOKS.name})
        .lean();
      webhookId = savedWebhookDocument?._id as mongooseTypes.ObjectId;

      webhookDocument = savedWebhookDocument;

      assert.isOk(webhookId);

      await webhookModel.create([INPUT_WEBHOOKS2], {
        validateBeforeSave: false,
      });
      const savedWebhookDocument2 = await webhookModel
        .findOne({name: INPUT_WEBHOOKS2.name})
        .lean();
      webhookId2 = savedWebhookDocument2?._id as mongooseTypes.ObjectId;

      assert.isOk(webhookId2);

      await workspaceModel.create([INPUT_OWNED_WORKSPACE], {
        validateBeforeSave: false,
      });
      const savedOwnedWorkspaceDocument = await workspaceModel
        .findOne({name: INPUT_OWNED_WORKSPACE.name})
        .lean();
      ownedWorkspaceId =
        savedOwnedWorkspaceDocument?._id as mongooseTypes.ObjectId;

      ownedWorkspaceDocument = savedOwnedWorkspaceDocument;

      assert.isOk(ownedWorkspaceId);

      await workspaceModel.create([INPUT_OWNED_WORKSPACE2], {
        validateBeforeSave: false,
      });
      const savedOwnedWorkspaceDocument2 = await workspaceModel
        .findOne({name: INPUT_OWNED_WORKSPACE2.name})
        .lean();
      ownedWorkspaceId2 =
        savedOwnedWorkspaceDocument2?._id as mongooseTypes.ObjectId;

      assert.isOk(ownedWorkspaceId2);

      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.create([INPUT_PROJECT], {
        validateBeforeSave: false,
      });
      const savedProjectDocument = await projectModel
        .findOne({name: INPUT_PROJECT.name})
        .lean();
      projectId = savedProjectDocument?._id as mongooseTypes.ObjectId;

      projectDocument = savedProjectDocument;

      assert.isOk(projectId);

      await projectModel.create([INPUT_PROJECT2], {
        validateBeforeSave: false,
      });
      const savedProjectDocument2 = await projectModel
        .findOne({name: INPUT_PROJECT2.name})
        .lean();
      projectId2 = savedProjectDocument2?._id as mongooseTypes.ObjectId;

      assert.isOk(projectId2);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const accountModel = mongoConnection.models.AccountModel;
      await accountModel.findByIdAndDelete(accountId);
      await accountModel.findByIdAndDelete(accountId2);

      const sessionModel = mongoConnection.models.SessionModel;
      await sessionModel.findByIdAndDelete(sessionId);
      await sessionModel.findByIdAndDelete(sessionId2);

      const webhookModel = mongoConnection.models.WebhookModel;
      await webhookModel.findByIdAndDelete(webhookId);
      await webhookModel.findByIdAndDelete(webhookId2);

      await workspaceModel.findByIdAndDelete(ownedWorkspaceId);
      await workspaceModel.findByIdAndDelete(ownedWorkspaceId2);

      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);
      await projectModel.findByIdAndDelete(projectId2);

      if (userId) {
        await userModel.findByIdAndDelete(userId);
      }
    });

    it('add a new user ', async () => {
      const userInput = JSON.parse(JSON.stringify(INPUT_DATA));
      userInput.workspace = workspaceDocument;
      userInput.accounts.push(accountDocument);
      userInput.sessions.push(sessionDocument);
      userInput.webhooks.push(webhookDocument);
      userInput.createdWorkspace.push(ownedWorkspaceDocument);
      userInput.projects.push(projectDocument);

      const userDocument = await userModel.createUser(userInput);

      assert.isOk(userDocument);
      assert.strictEqual(userDocument.name, userInput.name);

      assert.strictEqual(
        userDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      assert.strictEqual(
        userDocument.accounts[0]._id?.toString(),
        accountId.toString()
      );

      assert.strictEqual(
        userDocument.sessions[0]._id?.toString(),
        sessionId.toString()
      );

      assert.strictEqual(
        userDocument.webhooks[0]._id?.toString(),
        webhookId.toString()
      );

      assert.strictEqual(
        userDocument.createdWorkspace[0]._id?.toString(),
        ownedWorkspaceId.toString()
      );

      assert.strictEqual(
        userDocument.projects[0]._id?.toString(),
        projectId.toString()
      );

      userId = userDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a user', async () => {
      assert.isOk(userId);
      const user = await userModel.getUserById(userId);

      assert.isOk(user);
      assert.strictEqual(user._id?.toString(), userId.toString());
    });

    it('modify a user', async () => {
      assert.isOk(userId);
      const input = {name: 'a modified name'};
      const updatedDocument = await userModel.updateUserById(userId, input);
      assert.strictEqual(updatedDocument.name, input.name);
    });

    it('add a project to the user', async () => {
      assert.isOk(userId);
      const updatedUserDocument = await userModel.addProjects(userId, [
        projectId2,
      ]);
      assert.strictEqual(updatedUserDocument.projects.length, 2);
      assert.strictEqual(
        updatedUserDocument.projects[1]?._id?.toString(),
        projectId2.toString()
      );
    });

    it('remove a project from the user', async () => {
      assert.isOk(userId);
      const updatedUserDocument = await userModel.removeProjects(userId, [
        projectId2,
      ]);
      assert.strictEqual(updatedUserDocument.projects.length, 1);
      assert.strictEqual(
        updatedUserDocument.projects[0]?._id?.toString(),
        projectId.toString()
      );
    });

    it('add an account to the user', async () => {
      assert.isOk(userId);
      const updatedUserDocument = await userModel.addAccounts(userId, [
        accountId2,
      ]);
      assert.strictEqual(updatedUserDocument.accounts.length, 2);
      assert.strictEqual(
        updatedUserDocument.accounts[1]?._id?.toString(),
        accountId2.toString()
      );
    });

    it('remove an account from the user', async () => {
      assert.isOk(userId);
      const updatedUserDocument = await userModel.removeAccounts(userId, [
        accountId2,
      ]);
      assert.strictEqual(updatedUserDocument.accounts.length, 1);
      assert.strictEqual(
        updatedUserDocument.accounts[0]?._id?.toString(),
        accountId.toString()
      );
    });

    it('add a session to the user', async () => {
      assert.isOk(userId);
      const updatedUserDocument = await userModel.addSessions(userId, [
        sessionId2,
      ]);
      assert.strictEqual(updatedUserDocument.sessions.length, 2);
      assert.strictEqual(
        updatedUserDocument.sessions[1]?._id?.toString(),
        sessionId2.toString()
      );
    });

    it('remove a sassion from the user', async () => {
      assert.isOk(userId);
      const updatedUserDocument = await userModel.removeSessions(userId, [
        sessionId2,
      ]);
      assert.strictEqual(updatedUserDocument.sessions.length, 1);
      assert.strictEqual(
        updatedUserDocument.sessions[0]?._id?.toString(),
        sessionId.toString()
      );
    });

    it('add a webhook to the user', async () => {
      assert.isOk(userId);
      const updatedUserDocument = await userModel.addWebhooks(userId, [
        webhookId2,
      ]);
      assert.strictEqual(updatedUserDocument.webhooks.length, 2);
      assert.strictEqual(
        updatedUserDocument.webhooks[1]?._id?.toString(),
        webhookId2.toString()
      );
    });

    it('remove a webhook from the user', async () => {
      assert.isOk(userId);
      const updatedUserDocument = await userModel.removeWebhooks(userId, [
        webhookId2,
      ]);
      assert.strictEqual(updatedUserDocument.webhooks.length, 1);
      assert.strictEqual(
        updatedUserDocument.webhooks[0]?._id?.toString(),
        webhookId.toString()
      );
    });

    it('add an workspace to the user', async () => {
      assert.isOk(userId);
      const updatedUserDocument = await userModel.addWorkspaces(userId, [
        ownedWorkspaceId2,
      ]);
      assert.strictEqual(updatedUserDocument.createdWorkspace.length, 2);
      assert.strictEqual(
        updatedUserDocument.createdWorkspace[1]?._id?.toString(),
        ownedWorkspaceId2.toString()
      );
    });

    it('remove an workspace from the user', async () => {
      assert.isOk(userId);
      const updatedUserDocument = await userModel.removeWorkspaces(userId, [
        ownedWorkspaceId2,
      ]);
      assert.strictEqual(updatedUserDocument.createdWorkspace.length, 1);
      assert.strictEqual(
        updatedUserDocument.createdWorkspace[0]?._id?.toString(),
        ownedWorkspaceId.toString()
      );
    });

    it('remove a user', async () => {
      assert.isOk(userId);
      await userModel.deleteUserById(userId);
      let errored = false;
      try {
        await userModel.getUserById(userId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      userId = null as unknown as ObjectId;
    });
  });
});
