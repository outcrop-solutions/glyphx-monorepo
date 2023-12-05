// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {AccountModel} from '../../../mongoose/models/account';
import * as mocks from '../../../mongoose/mocks';
import {UserModel} from '../../../mongoose/models/user';
import {IQueryResult, databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/account', () => {
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
        assert.strictEqual(err.data.value[0].toString(), accountIds[1].toString());
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

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will not throw an error when no unsafe fields are present', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await AccountModel.validateUpdateObject(
          mocks.MOCK_ACCOUNT as unknown as Omit<Partial<databaseTypes.IAccount>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await AccountModel.validateUpdateObject(
          mocks.MOCK_ACCOUNT as unknown as Omit<Partial<databaseTypes.IAccount>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(userStub.calledOnce);
    });

    it('will fail when the user does not exist.', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await AccountModel.validateUpdateObject(
          mocks.MOCK_ACCOUNT as unknown as Omit<Partial<databaseTypes.IAccount>, '_id'>
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await AccountModel.validateUpdateObject({
          ...mocks.MOCK_ACCOUNT,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IAccount>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await AccountModel.validateUpdateObject({...mocks.MOCK_ACCOUNT, createdAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IAccount>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await AccountModel.validateUpdateObject({...mocks.MOCK_ACCOUNT, updatedAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IAccount>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createAccount', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a account document', async () => {
      sandbox.replace(AccountModel, 'validateUser', sandbox.stub().resolves(mocks.MOCK_ACCOUNT.user));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(AccountModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(AccountModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(AccountModel, 'getAccountById', stub);

      const accountDocument = await AccountModel.createAccount(mocks.MOCK_ACCOUNT);

      assert.strictEqual(accountDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when the user validator throws one', async () => {
      sandbox.replace(
        AccountModel,
        'validateUser',
        sandbox.stub().rejects(new error.DataValidationError('The user does not exist', 'user ', {}))
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(AccountModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(AccountModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(AccountModel, 'getAccountById', stub);

      let errored = false;

      try {
        await AccountModel.createAccount(mocks.MOCK_ACCOUNT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(AccountModel, 'validateUser', sandbox.stub().resolves(mocks.MOCK_ACCOUNT.user));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(AccountModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(AccountModel, 'create', sandbox.stub().rejects('oops, something bad has happened'));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(AccountModel, 'getAccountById', stub);
      let hasError = false;
      try {
        await AccountModel.createAccount(mocks.MOCK_ACCOUNT);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(AccountModel, 'validateUser', sandbox.stub().resolves(mocks.MOCK_ACCOUNT.user));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(AccountModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(AccountModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(AccountModel, 'getAccountById', stub);

      let hasError = false;
      try {
        await AccountModel.createAccount(mocks.MOCK_ACCOUNT);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(AccountModel, 'validateUser', sandbox.stub().resolves(mocks.MOCK_ACCOUNT.user));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(AccountModel, 'validate', sandbox.stub().rejects('oops an error has occurred'));
      sandbox.replace(AccountModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(AccountModel, 'getAccountById', stub);
      let hasError = false;
      try {
        await AccountModel.createAccount(mocks.MOCK_ACCOUNT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
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

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a account document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_ACCOUNT));
      sandbox.replace(AccountModel, 'findById', findByIdStub);

      const doc = await AccountModel.getAccountById(mocks.MOCK_ACCOUNT._id as mongoose.Types.ObjectId);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.user as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_ACCOUNT._id);
    });

    it('will throw a DataNotFoundError when the account does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(AccountModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await AccountModel.getAccountById(mocks.MOCK_ACCOUNT._id as mongoose.Types.ObjectId);
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
        await AccountModel.getAccountById(mocks.MOCK_ACCOUNT._id as mongoose.Types.ObjectId);
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
        ...mocks.MOCK_ACCOUNT,
        _id: new mongoose.Types.ObjectId(),
        user: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as databaseTypes.IAccount,
      {
        ...mocks.MOCK_ACCOUNT,
        _id: new mongoose.Types.ObjectId(),
        user: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as databaseTypes.IAccount,
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
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.user as any)?.__v);
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

  context('updateAccountById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a account', async () => {
      const updateAccount = {
        ...mocks.MOCK_ACCOUNT,
        deletedAt: new Date(),
        user: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IAccount;

      const accountId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(AccountModel, 'updateOne', updateStub);

      const getAccountStub = sandbox.stub();
      getAccountStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getAccountStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(AccountModel, 'validateUpdateObject', validateStub);

      const result = await AccountModel.updateAccountById(accountId, updateAccount);

      assert.strictEqual(result._id, accountId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getAccountStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a account with references as ObjectIds', async () => {
      const updateAccount = {
        ...mocks.MOCK_ACCOUNT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IAccount;

      const accountId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(AccountModel, 'updateOne', updateStub);

      const getAccountStub = sandbox.stub();
      getAccountStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getAccountStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(AccountModel, 'validateUpdateObject', validateStub);

      const result = await AccountModel.updateAccountById(accountId, updateAccount);

      assert.strictEqual(result._id, accountId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getAccountStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the account does not exist', async () => {
      const updateAccount = {
        ...mocks.MOCK_ACCOUNT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IAccount;

      const accountId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(AccountModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(AccountModel, 'validateUpdateObject', validateStub);

      const getAccountStub = sandbox.stub();
      getAccountStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getAccountStub);

      let errorred = false;
      try {
        await AccountModel.updateAccountById(accountId, updateAccount);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateAccount = {
        ...mocks.MOCK_ACCOUNT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IAccount;

      const accountId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(AccountModel, 'updateOne', updateStub);

      const getAccountStub = sandbox.stub();
      getAccountStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getAccountStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(new error.InvalidOperationError("You can't do this", {}));
      sandbox.replace(AccountModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await AccountModel.updateAccountById(accountId, updateAccount);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateAccount = {
        ...mocks.MOCK_ACCOUNT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IAccount;

      const accountId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(AccountModel, 'updateOne', updateStub);

      const getAccountStub = sandbox.stub();
      getAccountStub.resolves({_id: accountId});
      sandbox.replace(AccountModel, 'getAccountById', getAccountStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(AccountModel, 'validateUpdateObject', validateStub);

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

  context('Delete a account document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a account', async () => {
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
});
