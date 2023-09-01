import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

const INPUT_USER = {
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

const INPUT_DATA = {
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

const INPUT_DATA2 = {
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
describe('#accountModel', () => {
  context('test the crud functions of the account model', () => {
    const mongoConnection = new MongoDbConnection();
    const accountModel = mongoConnection.models.AccountModel;
    let accountId: ObjectId;
    let accountId2: ObjectId;
    let userId: ObjectId;
    let userDocument: any;
    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      await userModel.createUser(INPUT_USER as databaseTypes.IUser);

      const savedUserDocument = await userModel
        .findOne({name: INPUT_USER.name})
        .lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;

      assert.isOk(userId);
    });

    after(async () => {
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);

      if (accountId) {
        await accountModel.findByIdAndDelete(accountId);
      }

      if (accountId2) {
        await accountModel.findByIdAndDelete(accountId2);
      }
    });

    it('add a new account', async () => {
      const accountInput = JSON.parse(JSON.stringify(INPUT_DATA));
      accountInput.user = userDocument;
      const accountDocument = await accountModel.createAccount(accountInput);

      assert.isOk(accountDocument);
      assert.strictEqual(
        accountDocument.refresh_token,
        accountInput.refresh_token
      );
      assert.strictEqual(
        accountDocument.user._id?.toString(),
        userId.toString()
      );

      accountId = accountDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a account', async () => {
      assert.isOk(accountId);
      const account = await accountModel.getAccountById(accountId);

      assert.isOk(account);
      assert.strictEqual(account._id?.toString(), accountId.toString());
    });

    it('modify an account', async () => {
      assert.isOk(accountId);
      const input = {refresh_token: 'a modified refresh_token'};
      const updatedDocument = await accountModel.updateAccountById(
        accountId,
        input
      );
      assert.strictEqual(updatedDocument.refresh_token, input.refresh_token);
    });

    it('Get multiple accounts without a filter', async () => {
      assert.isOk(accountId);
      const accountInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      accountInput.user = userDocument;
      const accountDocument = await accountModel.createAccount(accountInput);

      assert.isOk(accountDocument);
      accountId2 = accountDocument._id as mongooseTypes.ObjectId;

      const accounts = await accountModel.queryAccounts();
      assert.isArray(accounts.results);
      assert.isAtLeast(accounts.numberOfItems, 2);
      const expectedDocumentCount =
        accounts.numberOfItems <= accounts.itemsPerPage
          ? accounts.numberOfItems
          : accounts.itemsPerPage;
      assert.strictEqual(accounts.results.length, expectedDocumentCount);
    });

    it('Get multiple accounts with a filter', async () => {
      assert.isOk(accountId2);
      const results = await accountModel.queryAccounts({
        providerAccountId: INPUT_DATA.providerAccountId,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(
        results.results[0]?.providerAccountId,
        INPUT_DATA.providerAccountId
      );
    });

    it('page accounts', async () => {
      assert.isOk(accountId2);
      const results = await accountModel.queryAccounts({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await accountModel.queryAccounts({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove an account', async () => {
      assert.isOk(accountId);
      await accountModel.deleteAccountById(accountId);
      let errored = false;
      try {
        await accountModel.getAccountById(accountId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      accountId = null as unknown as ObjectId;
    });
  });
});
