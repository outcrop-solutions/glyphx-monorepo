import 'mocha';
import {assert} from 'chai';
import {mongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const uniqueKey = v4().replaceAll('-', '');

const inputUser = {
  name: 'testUser' + uniqueKey,
  username: 'testUserName' + uniqueKey,
  gh_username: 'testGhUserName' + uniqueKey,
  email: 'testEmail' + uniqueKey + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  apiKey: 'testApiKey' + uniqueKey,
  role: databaseTypes.constants.ROLE.USER,
};

const inputData = {
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

describe('#accountModel', () => {
  context('test the crud functions of the account model', () => {
    const mongoConnection = new mongoDbConnection();
    const accountModel = mongoConnection.models.AccountModel;
    let accountId: ObjectId;
    let userId: ObjectId;
    let userDocument: any;
    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      await userModel.createUser(inputUser as databaseTypes.IUser);

      const savedUserDocument = await userModel
        .findOne({name: inputUser.name})
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
    });

    it('add a new account', async () => {
      const accountInput = JSON.parse(JSON.stringify(inputData));
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

    it('remove an account', async () => {
      assert.isOk(accountId);
      await accountModel.deleteAccountById(accountId);
      let errored = false;
      try {
        const document = await accountModel.getAccountById(accountId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      accountId = null as unknown as ObjectId;
    });
  });
});
