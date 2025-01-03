import {assert} from 'chai';
import {AccountModel} from '../../..//mongoose/models/account';
import {UserModel} from '../../..//mongoose/models/user';
import {databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const MOCK_ACCOUNT: databaseTypes.IAccount = {
  type: databaseTypes.constants.ACCOUNT_TYPE.CUSTOMER,
  provider: databaseTypes.constants.ACCOUNT_PROVIDER.COGNITO,
  providerAccountId: 'accountId',
  refresh_token: 'refreshToken',
  refresh_token_expires_in: new Date().getTime(),
  access_token: 'accessToken',
  expires_at: new Date().getTime(),
  token_type: databaseTypes.constants.TOKEN_TYPE.ACCESS,
  scope: 'scope',
  id_token: 'idtoken',
  session_state: databaseTypes.constants.SESSION_STATE.NEW,
  oauth_token_secret: 'tokensecret',
  oauth_token: 'oauthToken',
  user: {_id: new mongoose.Types.ObjectId()} as unknown as databaseTypes.IUser,
};

const MOCK_ACCOUNT_USER_ID = {
  type: databaseTypes.constants.ACCOUNT_TYPE.CUSTOMER,
  provider: databaseTypes.constants.ACCOUNT_PROVIDER.COGNITO,
  providerAccountId: 'accountId',
  refresh_token: 'refreshToken',
  refresh_token_expires_in: new Date().getTime(),
  access_token: 'accessToken',
  expires_at: new Date().getTime(),
  token_type: databaseTypes.constants.TOKEN_TYPE.ACCESS,
  scope: 'scope',
  id_token: 'idtoken',
  session_state: databaseTypes.constants.SESSION_STATE.NEW,
  oauth_token_secret: 'tokensecret',
  oauth_token: 'oauthToken',
  user: new mongoose.Types.ObjectId().toString(),
};

describe('#mongoose/models/account', () => {
  context('createAccount', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create an account document', async () => {
      const accountId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(AccountModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(AccountModel, 'create', sandbox.stub().resolves([{_id: accountId}]));

      const getAccountByIdStub = sandbox.stub();
      getAccountByIdStub.resolves({_id: accountId});

      sandbox.replace(AccountModel, 'getAccountById', getAccountByIdStub);

      const result = await AccountModel.createAccount(MOCK_ACCOUNT);
      assert.strictEqual(result._id, accountId);
      assert.isTrue(getAccountByIdStub.calledOnce);
    });

    it('will create an account document when user is an objectId', async () => {
      const accountId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(AccountModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(AccountModel, 'create', sandbox.stub().resolves([{_id: accountId}]));

      const getAccountByIdStub = sandbox.stub();
      getAccountByIdStub.resolves({_id: accountId});

      sandbox.replace(AccountModel, 'getAccountById', getAccountByIdStub);

      const result = await AccountModel.createAccount(MOCK_ACCOUNT_USER_ID);
      assert.strictEqual(result._id, accountId);
      assert.isTrue(getAccountByIdStub.calledOnce);
    });

    it('will throw an InvalidArgumentError if the user attached to the account does not exist.', async () => {
      const accountId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(false));
      sandbox.replace(AccountModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(AccountModel, 'create', sandbox.stub().resolves([{_id: accountId}]));

      const getAccountByIdStub = sandbox.stub();
      getAccountByIdStub.resolves({_id: accountId});

      sandbox.replace(AccountModel, 'getAccountById', getAccountByIdStub);
      let errorred = false;

      try {
        await AccountModel.createAccount(MOCK_ACCOUNT);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DataValidationError if the account cannot be validated.', async () => {
      const accountId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(AccountModel, 'validate', sandbox.stub().rejects('Invalid'));
      sandbox.replace(AccountModel, 'create', sandbox.stub().resolves([{_id: accountId}]));

      const getAccountByIdStub = sandbox.stub();
      getAccountByIdStub.resolves({_id: accountId});

      sandbox.replace(AccountModel, 'getAccountById', getAccountByIdStub);
      let errorred = false;

      try {
        await AccountModel.createAccount(MOCK_ACCOUNT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
    it('will throw an DatabaseOperationError if the underlying database connection throws an error.', async () => {
      const accountId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(AccountModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(AccountModel, 'create', sandbox.stub().rejects('oops'));

      const getAccountByIdStub = sandbox.stub();
      getAccountByIdStub.resolves({_id: accountId});

      sandbox.replace(AccountModel, 'getAccountById', getAccountByIdStub);
      let errorred = false;

      try {
        await AccountModel.createAccount(MOCK_ACCOUNT);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('updateAccountById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should update an existing account', async () => {
      const updateAccount = {
        refreshToken: 'refreshToken',
        refresh_token_expires_in: 6000,
      };

      const accountId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(AccountModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getAccountStub = sandbox.stub();
      getAccountStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getAccountStub);

      const result = await AccountModel.updateAccountById(accountId.toString(), updateAccount);

      assert.strictEqual(result.id, accountId.toString());
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getAccountStub.calledOnce);
      assert.isFalse(getUserStub.called);
    });

    it('should update an existing account changing the user', async () => {
      const updateAccount = {
        refreshToken: 'refreshToken',
        refresh_token_expires_in: 6000,
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };

      const accountId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(AccountModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getAccountStub = sandbox.stub();
      getAccountStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getAccountStub);

      const result = await AccountModel.updateAccountById(accountId.toString(), updateAccount);

      assert.strictEqual(result.id, accountId.toString());
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getAccountStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
    });

    it('will fail when the account does not exist', async () => {
      const updateAccount = {
        refreshToken: 'refreshToken',
        refresh_token_expires_in: 6000,
      };

      const accountId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(AccountModel, 'updateOne', updateStub);

      const getAccouuntStub = sandbox.stub();
      getAccouuntStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getAccouuntStub);
      let errorred = false;
      try {
        await AccountModel.updateAccountById(accountId.toString(), updateAccount);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will fail with an InvalidOperationError when the validateUpdateObject method fails', async () => {
      const updateAccount = {
        refreshToken: 'refreshToken',
        refresh_token_expires_in: 6000,
      };

      const accountId = new mongoose.Types.ObjectId();

      sandbox.replace(
        AccountModel,
        'validateUpdateObject',
        sandbox.stub().rejects(new error.InvalidOperationError('you cant do that', {}))
      );

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(AccountModel, 'updateOne', updateStub);

      const getAccountStub = sandbox.stub();
      getAccountStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getAccountStub);
      let errorred = false;
      try {
        await AccountModel.updateAccountById(accountId.toString(), updateAccount);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will fail with a DatabaseOperationError when the underlying database connection errors', async () => {
      const updateAccount = {
        refreshToken: 'refreshToken',
        refresh_token_expires_in: 6000,
      };

      const accountId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something really bad has happened');
      sandbox.replace(AccountModel, 'updateOne', updateStub);

      const getAccountStub = sandbox.stub();
      getAccountStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getAccountStub);
      let errorred = false;
      try {
        await AccountModel.updateAccountById(accountId.toString(), updateAccount);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return true when the object is valid', async () => {
      const inputAccount = {
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);

      await AccountModel.validateUpdateObject(inputAccount);
      assert.isTrue(userExistsStub.calledOnce);
    });
    it('will throw an InvalidOperationError when the user does not exist', async () => {
      const inputAccount = {
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await AccountModel.validateUpdateObject(inputAccount);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });
    it('will throw an InvalidOperationError when we attempt to supply an _id', async () => {
      const inputAccount = {
        _id: new mongoose.Types.ObjectId(),
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IAccount;
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await AccountModel.validateUpdateObject(inputAccount);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });
  });

  context('delete an account document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove an account', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(AccountModel, 'deleteOne', deleteStub);

      const accountId = new mongoose.Types.ObjectId();

      await AccountModel.deleteAccountById(accountId.toString());

      assert.isTrue(deleteStub.calledOnce);
    });
    it('should fail with an InvalidArgumentError when the account does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(AccountModel, 'deleteOne', deleteStub);

      const accountId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await AccountModel.deleteAccountById(accountId.toString());
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(AccountModel, 'deleteOne', deleteStub);

      const accountId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await AccountModel.deleteAccountById(accountId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

  context('accountIdExists', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it('should return true if the accountId exists', async () => {
      const accountId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'findById', findByIdStub);

      const result = await AccountModel.accountIdExists(accountId);

      assert.isTrue(result);
    });

    it('should return false if the accountId does not exist', async () => {
      const accountId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(AccountModel, 'findById', findByIdStub);

      const result = await AccountModel.accountIdExists(accountId);

      assert.isFalse(result);
    });
    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const accountId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(AccountModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await AccountModel.accountIdExists(accountId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allAccountIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the account ids exist', async () => {
      const accountIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedAccountIds = accountIds.map((accountId) => {
        return {
          _id: accountId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedAccountIds);
      sandbox.replace(AccountModel, 'find', findStub);

      assert.isTrue(await AccountModel.allAccountIdsExist(accountIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const accountIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedAccountIds = [
        {
          _id: accountIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedAccountIds);
      sandbox.replace(AccountModel, 'find', findStub);
      let errored = false;
      try {
        await AccountModel.allAccountIdsExist(accountIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual((err as any).data.value[0].toString(), accountIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const accountIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(AccountModel, 'find', findStub);
      let errored = false;
      try {
        await AccountModel.allAccountIdsExist(accountIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('getAccountById', () => {
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

    const mockAccount: databaseTypes.IAccount = {
      _id: new mongoose.Types.ObjectId(),
      type: databaseTypes.constants.ACCOUNT_TYPE.CUSTOMER,
      provider: databaseTypes.constants.ACCOUNT_PROVIDER.COGNITO,
      providerAccountId: 'accountId',
      refresh_token: 'refreshToken',
      refresh_token_expires_in: new Date().getTime(),
      access_token: 'accessToken',
      expires_at: new Date().getTime(),
      token_type: databaseTypes.constants.TOKEN_TYPE.ACCESS,
      scope: 'scope',
      id_token: 'idtoken',
      session_state: databaseTypes.constants.SESSION_STATE.NEW,
      oauth_token_secret: 'tokensecret',
      oauth_token: 'oauthToken',
      __v: 1,
      user: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test user',
        __v: 1,
      } as unknown as databaseTypes.IUser,
    } as databaseTypes.IAccount;
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive an account document with the user populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockAccount));
      sandbox.replace(AccountModel, 'findById', findByIdStub);

      const doc = await AccountModel.getAccountById(mockAccount._id!.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.user as any).__v);
      assert.strictEqual(doc._id?.toString(), mockAccount.id);
    });

    it('will throw a DataNotFoundError when the account does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(AccountModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await AccountModel.getAccountById(mockAccount._id!.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(AccountModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await AccountModel.getAccountById(mockAccount._id!.toString());
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryAccounts', () => {
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

    const mockAccounts = [
      {
        _id: new mongoose.Types.ObjectId(),
        type: databaseTypes.constants.ACCOUNT_TYPE.CUSTOMER,
        provider: databaseTypes.constants.ACCOUNT_PROVIDER.COGNITO,
        providerAccountId: 'accountId',
        refresh_token: 'refreshToken',
        refresh_token_expires_in: new Date().getTime(),
        access_token: 'accessToken',
        expires_at: new Date().getTime(),
        token_type: databaseTypes.constants.TOKEN_TYPE.ACCESS,
        scope: 'scope',
        id_token: 'idtoken',
        session_state: databaseTypes.constants.SESSION_STATE.NEW,
        oauth_token_secret: 'tokensecret',
        oauth_token: 'oauthToken',
        __v: 1,
        user: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test user',
          __v: 1,
        } as unknown as databaseTypes.IUser,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        type: databaseTypes.constants.ACCOUNT_TYPE.CUSTOMER,
        provider: databaseTypes.constants.ACCOUNT_PROVIDER.COGNITO,
        providerAccountId: 'accountId2',
        refresh_token: 'refreshToken2',
        refresh_token_expires_in: new Date().getTime(),
        access_token: 'accessToken2',
        expires_at: new Date().getTime(),
        token_type: databaseTypes.constants.TOKEN_TYPE.ACCESS,
        scope: 'scope2',
        id_token: 'idtoken2',
        session_state: databaseTypes.constants.SESSION_STATE.NEW,
        oauth_token_secret: 'tokensecret2',
        oauth_token: 'oauthToken2',
        __v: 1,
        user: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test user',
          __v: 1,
        } as unknown as databaseTypes.IUser,
      },
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered accounts', async () => {
      sandbox.replace(AccountModel, 'count', sandbox.stub().resolves(mockAccounts.length));

      sandbox.replace(AccountModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockAccounts)));

      const results = await AccountModel.queryAccounts({});

      assert.strictEqual(results.numberOfItems, mockAccounts.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockAccounts.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc) => {
        assert.isUndefined((doc as any).__v);
        assert.isUndefined((doc.user as any).__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(AccountModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(AccountModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockAccounts)));

      let errored = false;
      try {
        await AccountModel.queryAccounts();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(AccountModel, 'count', sandbox.stub().resolves(mockAccounts.length));

      sandbox.replace(AccountModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockAccounts)));

      let errored = false;
      try {
        await AccountModel.queryAccounts({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(AccountModel, 'count', sandbox.stub().resolves(mockAccounts.length));

      sandbox.replace(
        AccountModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await AccountModel.queryAccounts({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});
