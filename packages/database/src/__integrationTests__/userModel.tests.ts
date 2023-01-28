import 'mocha';
import {assert} from 'chai';
import {mongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const uniqueKey = v4().replaceAll('-', '');
//1. Organization
const inputOrganization = {
  name: 'testOrganization' + uniqueKey,
  description: 'testorganization' + uniqueKey,
  owner: {},
  members: [],
  projects: [],
};
//2. Account
const inputAccount = {
  type: databaseTypes.constants.ACCOUNT_TYPE.CUSTOMER,
  provider: databaseTypes.constants.ACCOUNT_PROVIDER.COGNITO,
  providerAccountId: 'accountId' + uniqueKey,
  refresh_token: 'refreshToken' + uniqueKey,
  refresh_token_expires_in: new Date().getTime(),
  access_token: 'accessToken' + uniqueKey,
  expires_at: new Date().getTime(),
  token_type: databaseTypes.constants.TOKEN_TYPE.ACCESS,
  scope: 'scope' + uniqueKey,
  id_token: 'idToken' + uniqueKey,
  session_state: databaseTypes.constants.SESSION_STATE.NEW,
  oauth_token_secret: 'oauthTokenSecret' + uniqueKey,
  oauth_token: 'oauthToken' + uniqueKey,
  user: {},
};
//3. Session

const inputSession = {
  sessionToken: 'testSessionToken' + uniqueKey,
  expires: new Date(),
  user: {},
};

//4. Webhooks
const inputWebhook = {
  name: 'testWebhook' + uniqueKey,
  url: 'testurl' + uniqueKey,
  user: {},
};
//5. Owned Orgs
const inputOwnedOrganization = {
  name: 'testOwnedOrganization' + uniqueKey,
  description: 'testOwnedOrganization' + uniqueKey,
  owner: {},
  members: [],
  projects: [],
};
//6. Projects
const inputProject = {
  name: 'testProject' + uniqueKey,
  sdtPath: 'testsdtPath' + uniqueKey,
  organization: {},
  slug: 'testSlug' + uniqueKey,
  isTemplate: false,
  type: {},
  owner: {},
  state: {},
  files: [],
};

const inputProject2 = {
  name: 'testProject2' + uniqueKey,
  sdtPath: 'testsdtPath2' + uniqueKey,
  organization: {},
  slug: 'testSlug2' + uniqueKey,
  isTemplate: false,
  type: {},
  owner: {},
  state: {},
  files: [],
};

const inputData = {
  name: 'testUser' + uniqueKey,
  username: 'testUserName' + uniqueKey,
  gh_username: 'testGhUserName' + uniqueKey,
  email: 'testEmail' + uniqueKey + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  image: 'testimage' + uniqueKey,
  apiKey: 'testApiKey' + uniqueKey,
  role: databaseTypes.constants.ROLE.USER,
  organization: {},
  accounts: [],
  sessions: [],
  webhooks: [],
  ownedOrgs: [],
  projects: [],
};

describe('#UserModel', () => {
  context('test the crud functions of the user model', () => {
    const mongoConnection = new mongoDbConnection();
    const userModel = mongoConnection.models.UserModel;
    let userId: ObjectId;

    let organizationId: ObjectId;
    let organizationDocument: any;

    let accountId: ObjectId;
    let accountDocument: any;

    let sessionId: ObjectId;
    let sessionDocument: any;

    let webhookId: ObjectId;
    let webhookDocument: any;

    let ownedOrganizationId: ObjectId;
    let ownedOrganizationDocument: any;

    let projectId: ObjectId;
    let projectDocument: any;
    let projectId2: ObjectId;
    let projectDocument2: any;

    before(async () => {
      await mongoConnection.init();

      const organizationModel = mongoConnection.models.OrganizationModel;
      await organizationModel.create([inputOrganization], {
        validateBeforeSave: false,
      });
      const savedOrganizationDocument = await organizationModel
        .findOne({name: inputOrganization.name})
        .lean();
      organizationId = savedOrganizationDocument?._id as mongooseTypes.ObjectId;

      organizationDocument = savedOrganizationDocument;

      assert.isOk(organizationId);

      const accountModel = mongoConnection.models.AccountModel;
      await accountModel.create([inputAccount], {
        validateBeforeSave: false,
      });
      const savedAccountDocument = await accountModel
        .findOne({providerAccountId: inputAccount.providerAccountId})
        .lean();
      accountId = savedAccountDocument?._id as mongooseTypes.ObjectId;

      accountDocument = savedAccountDocument;

      assert.isOk(accountId);

      const sessionModel = mongoConnection.models.SessionModel;
      await sessionModel.create([inputSession], {
        validateBeforeSave: false,
      });
      const savedSessionDocument = await sessionModel
        .findOne({sessionToken: inputSession.sessionToken})
        .lean();
      sessionId = savedSessionDocument?._id as mongooseTypes.ObjectId;

      sessionDocument = savedSessionDocument;

      assert.isOk(sessionId);

      const webhookModel = mongoConnection.models.WebhookModel;
      await webhookModel.create([inputWebhook], {
        validateBeforeSave: false,
      });
      const savedWebhookDocument = await webhookModel
        .findOne({name: inputWebhook.name})
        .lean();
      webhookId = savedWebhookDocument?._id as mongooseTypes.ObjectId;

      webhookDocument = savedWebhookDocument;

      assert.isOk(webhookId);

      await organizationModel.create([inputOwnedOrganization], {
        validateBeforeSave: false,
      });
      const savedOwnedOrganizationDocument = await organizationModel
        .findOne({name: inputOwnedOrganization.name})
        .lean();
      ownedOrganizationId =
        savedOwnedOrganizationDocument?._id as mongooseTypes.ObjectId;

      ownedOrganizationDocument = savedOwnedOrganizationDocument;

      assert.isOk(ownedOrganizationId);

      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.create([inputProject], {
        validateBeforeSave: false,
      });
      const savedProjectDocument = await projectModel
        .findOne({name: inputProject.name})
        .lean();
      projectId = savedProjectDocument?._id as mongooseTypes.ObjectId;

      projectDocument = savedProjectDocument;

      assert.isOk(projectId);

      await projectModel.create([inputProject2], {
        validateBeforeSave: false,
      });
      const savedProjectDocument2 = await projectModel
        .findOne({name: inputProject2.name})
        .lean();
      projectId2 = savedProjectDocument2?._id as mongooseTypes.ObjectId;

      projectDocument2 = savedProjectDocument2;

      assert.isOk(projectId2);
    });

    after(async () => {
      const organizationModel = mongoConnection.models.OrganizationModel;
      await organizationModel.findByIdAndDelete(organizationId);

      const accountModel = mongoConnection.models.AccountModel;
      await accountModel.findByIdAndDelete(accountId);

      const sessionModel = mongoConnection.models.SessionModel;
      await sessionModel.findByIdAndDelete(sessionId);

      const webhookModel = mongoConnection.models.WebhookModel;
      await webhookModel.findByIdAndDelete(webhookId);

      await organizationModel.findByIdAndDelete(ownedOrganizationId);

      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);
      await projectModel.findByIdAndDelete(projectId2);

      if (userId) {
        await userModel.findByIdAndDelete(userId);
      }
    });

    it('add a new user ', async () => {
      const userInput = JSON.parse(JSON.stringify(inputData));
      userInput.organization = organizationDocument;
      userInput.accounts.push(accountDocument);
      userInput.sessions.push(sessionDocument);
      userInput.webhooks.push(webhookDocument);
      userInput.ownedOrgs.push(ownedOrganizationDocument);
      userInput.projects.push(projectDocument);

      const userDocument = await userModel.createUser(userInput);

      assert.isOk(userDocument);
      assert.strictEqual(userDocument.name, userInput.name);

      assert.strictEqual(
        userDocument.organization._id?.toString(),
        organizationId.toString()
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
        userDocument.ownedOrgs[0]._id?.toString(),
        ownedOrganizationId.toString()
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
    it('remove a user', async () => {
      assert.isOk(userId);
      await userModel.deleteUserById(userId);
      let errored = false;
      try {
        const document = await userModel.getUserById(userId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      userId = null as unknown as ObjectId;
    });
  });
});
