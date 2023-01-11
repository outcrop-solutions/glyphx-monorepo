import {assert} from 'chai';
import {AccountModel} from '../../..//mongoose/models/account';
import {UserModel} from '../../..//mongoose/models/user';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const mockAccount: databaseTypes.IAccount = {
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

describe('#mongoose/models/account', () => {
  context('creatAccount', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it('will create an account document', async () => {
      const accountId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(AccountModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        AccountModel,
        'create',
        sandbox.stub().resolves([{_id: accountId}])
      );

      const getAccountByIdStub = sandbox.stub();
      getAccountByIdStub.resolves({_id: accountId});

      sandbox.replace(AccountModel, 'getAccountById', getAccountByIdStub);

      const result = await AccountModel.createAccount(mockAccount);
      assert.strictEqual(result._id, accountId);
      assert.isTrue(getAccountByIdStub.calledOnce);
    });

    it('will throw an InvalidArgumentError if the user attached to the account does not exist.', async () => {
      const accountId = new mongoose.Types.ObjectId();
      sandbox.replace(
        UserModel,
        'userIdExists',
        sandbox.stub().resolves(false)
      );
      sandbox.replace(AccountModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        AccountModel,
        'create',
        sandbox.stub().resolves([{_id: accountId}])
      );

      const getAccountByIdStub = sandbox.stub();
      getAccountByIdStub.resolves({_id: accountId});

      sandbox.replace(AccountModel, 'getAccountById', getAccountByIdStub);
      let errorred = false;

      try {
        await AccountModel.createAccount(mockAccount);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DataValidationError if the account cannont be validated.', async () => {
      const accountId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(
        AccountModel,
        'validate',
        sandbox.stub().rejects('Invalid')
      );
      sandbox.replace(
        AccountModel,
        'create',
        sandbox.stub().resolves([{_id: accountId}])
      );

      const getAccountByIdStub = sandbox.stub();
      getAccountByIdStub.resolves({_id: accountId});

      sandbox.replace(AccountModel, 'getAccountById', getAccountByIdStub);
      let errorred = false;

      try {
        await AccountModel.createAccount(mockAccount);
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
        await AccountModel.createAccount(mockAccount);
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
      getUserStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getUserStub);

      const result = await AccountModel.updateAccountById(
        accountId,
        updateAccount
      );

      assert.strictEqual(result._id, accountId);
      assert.isTrue(updateStub.calledOnce);
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

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getUserStub);
      let errorred = false;
      try {
        await AccountModel.updateAccountById(accountId, updateAccount);
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
        sandbox
          .stub()
          .rejects(new error.InvalidOperationError('you cant do that', {}))
      );

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(AccountModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getUserStub);
      let errorred = false;
      try {
        await AccountModel.updateAccountById(accountId, updateAccount);
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

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getUserStub);
      let errorred = false;
      try {
        await AccountModel.updateAccountById(accountId, updateAccount);
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

      await AccountModel.deleteAccountById(accountId);

      assert.isTrue(deleteStub.calledOnce);
    });
    it('should fail with an InvalidArgumentError when the account does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(AccountModel, 'deleteOne', deleteStub);

      const accountId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await AccountModel.deleteAccountById(accountId);
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
        await AccountModel.deleteAccountById(accountId);
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
});
