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
  workspaceCode: 'testWorkspace' + UNIQUE_KEY,
  inviteCode: 'testWorkspace' + UNIQUE_KEY,
  name: 'testName' + UNIQUE_KEY,
  slug: 'testSlug' + UNIQUE_KEY,
  updatedAt: new Date(),
  createdAt: new Date(),
  description: 'testDescription',
  creator: {},
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
const INPUT_CREATED_WORKSPACE = {
  workspaceCode: 'testWorkspace1' + UNIQUE_KEY,
  inviteCode: 'testWorkspace1' + UNIQUE_KEY,
  name: 'testName1' + UNIQUE_KEY,
  slug: 'testSlug1' + UNIQUE_KEY,
  updatedAt: new Date(),
  createdAt: new Date(),
  description: 'testDescription1',
  creator: {},
};

const INPUT_CREATED_WORKSPACE2 = {
  workspaceCode: 'testWorkspace2' + UNIQUE_KEY,
  inviteCode: 'testWorkspace2' + UNIQUE_KEY,
  name: 'testName2' + UNIQUE_KEY,
  slug: 'testSlug2' + UNIQUE_KEY,
  updatedAt: new Date(),
  createdAt: new Date(),
  description: 'testDescription2',
  creator: {},
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

const INPUT_CUSTOMER_PAYMENT = {
  paymentId: 'testPaymentId' + UNIQUE_KEY,
  customerId: 'testCustomerId' + UNIQUE_KEY,
  email: 'testemail@gmail.com',
  subscriptionType: databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
  createdAt: new Date(),
  updatedAt: new Date(),
  customer: {},
};

const INPUT_DATA = {
  userCode: 'testUserCode' + UNIQUE_KEY,
  name: 'testUser' + UNIQUE_KEY,
  username: 'testUserName' + UNIQUE_KEY,
  email: 'testEmail' + UNIQUE_KEY + '@email.com',
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

const INPUT_DATA2 = {
  userCode: 'testUserCode2' + UNIQUE_KEY,
  name: 'testUser2' + UNIQUE_KEY,
  username: 'testUserName2' + UNIQUE_KEY,
  email: 'testEmail2' + UNIQUE_KEY + '@email.com',
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
describe('#UserModel', () => {
  context('test the crud functions of the user model', () => {
    const mongoConnection = new MongoDbConnection();
    const userModel = mongoConnection.models.UserModel;
    let userId: ObjectId;
    let userId2: ObjectId;

    let workspaceId: ObjectId;

    let accountId: ObjectId;
    let accountDocument: any;

    let accountId2: ObjectId;

    let sessionId: ObjectId;
    let sessionDocument: any;

    let sessionId2: ObjectId;

    let webhookId: ObjectId;
    let webhookDocument: any;

    let webhookId2: ObjectId;

    let createdWorkspaceId: ObjectId;
    let createdWorkspaceDocument: any;

    let createdWorkspaceId2: ObjectId;

    let projectId: ObjectId;
    let projectDocument: any;
    let projectId2: ObjectId;

    let customerPaymentId: ObjectId;
    let customerPaymentDocument: any;

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

      await workspaceModel.create([INPUT_CREATED_WORKSPACE], {
        validateBeforeSave: false,
      });
      const savedOwnedWorkspaceDocument = await workspaceModel
        .findOne({name: INPUT_CREATED_WORKSPACE.name})
        .lean();
      createdWorkspaceId =
        savedOwnedWorkspaceDocument?._id as mongooseTypes.ObjectId;

      createdWorkspaceDocument = savedOwnedWorkspaceDocument;

      assert.isOk(createdWorkspaceId);

      await workspaceModel.create([INPUT_CREATED_WORKSPACE2], {
        validateBeforeSave: false,
      });
      const savedOwnedWorkspaceDocument2 = await workspaceModel
        .findOne({name: INPUT_CREATED_WORKSPACE2.name})
        .lean();
      createdWorkspaceId2 =
        savedOwnedWorkspaceDocument2?._id as mongooseTypes.ObjectId;

      assert.isOk(createdWorkspaceId2);

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

      const customerPaymentModel = mongoConnection.models.CustomerPaymentModel;
      await customerPaymentModel.create([INPUT_CUSTOMER_PAYMENT], {
        validateBeforeSave: false,
      });
      const savedCustomerPaymentDocument = await customerPaymentModel
        .findOne({paymentId: INPUT_CUSTOMER_PAYMENT.paymentId})
        .lean();
      customerPaymentId =
        savedCustomerPaymentDocument?._id as mongooseTypes.ObjectId;

      customerPaymentDocument = savedCustomerPaymentDocument;

      assert.isOk(customerPaymentId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);
      await workspaceModel.findByIdAndDelete(createdWorkspaceId);
      await workspaceModel.findByIdAndDelete(createdWorkspaceId2);

      const accountModel = mongoConnection.models.AccountModel;
      await accountModel.findByIdAndDelete(accountId);
      await accountModel.findByIdAndDelete(accountId2);

      const sessionModel = mongoConnection.models.SessionModel;
      await sessionModel.findByIdAndDelete(sessionId);
      await sessionModel.findByIdAndDelete(sessionId2);

      const webhookModel = mongoConnection.models.WebhookModel;
      await webhookModel.findByIdAndDelete(webhookId);
      await webhookModel.findByIdAndDelete(webhookId2);

      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);
      await projectModel.findByIdAndDelete(projectId2);

      const customerPaymentModel = mongoConnection.models.CustomerPaymentModel;
      await customerPaymentModel.findByIdAndDelete(customerPaymentId);

      if (userId) {
        await userModel.findByIdAndDelete(userId);
      }

      if (userId2) {
        await userModel.findByIdAndDelete(userId2);
      }
    });

    it('add a new user ', async () => {
      const userInput = JSON.parse(JSON.stringify(INPUT_DATA));
      userInput.accounts.push(accountDocument);
      userInput.sessions.push(sessionDocument);
      userInput.webhooks.push(webhookDocument);
      userInput.createdWorkspaces.push(createdWorkspaceDocument);
      userInput.projects.push(projectDocument);
      userInput.customerPayment = customerPaymentDocument;

      const userDocument = await userModel.createUser(userInput);

      assert.isOk(userDocument);
      assert.strictEqual(userDocument.name, userInput.name);

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
        userDocument.createdWorkspaces[0]._id?.toString(),
        createdWorkspaceId.toString()
      );

      assert.strictEqual(
        userDocument.projects[0]._id?.toString(),
        projectId.toString()
      );

      assert.strictEqual(
        userDocument.customerPayment?._id?.toString(),
        customerPaymentId.toString()
      );

      userId = userDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a user', async () => {
      assert.isOk(userId);
      const user = await userModel.getUserById(userId);

      assert.isOk(user);
      assert.strictEqual(user._id?.toString(), userId.toString());
    });

    it('Get multiple users without a filter', async () => {
      assert.isOk(userId);
      const userInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      userInput.accounts.push(accountDocument);
      userInput.sessions.push(sessionDocument);
      userInput.webhooks.push(webhookDocument);
      userInput.createdWorkspaces.push(createdWorkspaceDocument);
      userInput.projects.push(projectDocument);
      userInput.customerPayment = customerPaymentDocument;
      const userDocument = await userModel.createUser(userInput);

      assert.isOk(userDocument);
      userId2 = userDocument._id as mongooseTypes.ObjectId;

      const users = await userModel.queryUsers();
      assert.isArray(users.results);
      assert.isAtLeast(users.numberOfItems, 2);
      const expectedDocumentCount =
        users.numberOfItems <= users.itemsPerPage
          ? users.numberOfItems
          : users.itemsPerPage;
      assert.strictEqual(users.results.length, expectedDocumentCount);
    });

    it('Get multiple users with a filter', async () => {
      assert.isOk(userId2);
      const results = await userModel.queryUsers({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page users', async () => {
      assert.isOk(accountId2);
      const results = await userModel.queryUsers({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await userModel.queryUsers({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
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
        createdWorkspaceId2,
      ]);
      assert.strictEqual(updatedUserDocument.createdWorkspaces.length, 2);
      assert.strictEqual(
        updatedUserDocument.createdWorkspaces[1]?._id?.toString(),
        createdWorkspaceId2.toString()
      );
    });

    it('remove an workspace from the user', async () => {
      assert.isOk(userId);
      const updatedUserDocument = await userModel.removeWorkspaces(userId, [
        createdWorkspaceId2,
      ]);
      assert.strictEqual(updatedUserDocument.createdWorkspaces.length, 1);
      assert.strictEqual(
        updatedUserDocument.createdWorkspaces[0]?._id?.toString(),
        createdWorkspaceId.toString()
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
