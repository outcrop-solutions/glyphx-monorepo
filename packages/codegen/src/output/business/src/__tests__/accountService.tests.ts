// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import {accountService} from '../services';
import * as mocks from 'database/src/mongoose/mocks';

describe('#services/account', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createAccount', () => {
    it('will create a Account', async () => {
      const accountId = new mongooseTypes.ObjectId();
      const createdAtId = new mongooseTypes.ObjectId();
      const typeId = new mongooseTypes.ObjectId();
      const providerId = new mongooseTypes.ObjectId();
      const tokenTypeId = new mongooseTypes.ObjectId();
      const sessionStateId = new mongooseTypes.ObjectId();
      const userId = new mongooseTypes.ObjectId();

      // createAccount
      const createAccountFromModelStub = sandbox.stub();
      createAccountFromModelStub.resolves({
        ...mocks.MOCK_ACCOUNT,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IAccount);

      sandbox.replace(
        dbConnection.models.AccountModel,
        'createAccount',
        createAccountFromModelStub
      );

      const doc = await accountService.createAccount({
        ...mocks.MOCK_ACCOUNT,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IAccount);

      assert.isTrue(createAccountFromModelStub.calledOnce);
    });
    // account model fails
    it('will publish and rethrow an InvalidArgumentError when account model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createAccount
      const createAccountFromModelStub = sandbox.stub();
      createAccountFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.AccountModel,
        'createAccount',
        createAccountFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await accountService.createAccount({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when account model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createAccount
      const createAccountFromModelStub = sandbox.stub();
      createAccountFromModelStub.rejects(err);

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await accountService.createAccount({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when account model throws it', async () => {
      const createAccountFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createAccountFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.AccountModel,
        'createAccount',
        createAccountFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataValidationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await accountService.createAccount({});
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when account model throws a DataOperationError', async () => {
      const createAccountFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createAccountFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.AccountModel,
        'createAccount',
        createAccountFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await accountService.createAccount({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when account model throws a UnexpectedError', async () => {
      const createAccountFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(errMessage, 'mongodDb');

      createAccountFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.AccountModel,
        'createAccount',
        createAccountFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.UnexpectedError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await accountService.createAccount({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getAccount', () => {
    it('should get a account by id', async () => {
      const accountId = new mongooseTypes.ObjectId();

      const getAccountFromModelStub = sandbox.stub();
      getAccountFromModelStub.resolves({
        _id: accountId,
      } as unknown as databaseTypes.IAccount);
      sandbox.replace(
        dbConnection.models.AccountModel,
        'getAccountById',
        getAccountFromModelStub
      );

      const account = await accountService.getAccount(accountId);
      assert.isOk(account);
      assert.strictEqual(account?._id?.toString(), accountId.toString());

      assert.isTrue(getAccountFromModelStub.calledOnce);
    });
    it('should get a account by id when id is a string', async () => {
      const accountId = new mongooseTypes.ObjectId();

      const getAccountFromModelStub = sandbox.stub();
      getAccountFromModelStub.resolves({
        _id: accountId,
      } as unknown as databaseTypes.IAccount);
      sandbox.replace(
        dbConnection.models.AccountModel,
        'getAccountById',
        getAccountFromModelStub
      );

      const account = await accountService.getAccount(accountId.toString());
      assert.isOk(account);
      assert.strictEqual(account?._id?.toString(), accountId.toString());

      assert.isTrue(getAccountFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the account cannot be found', async () => {
      const accountId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'accountId',
        accountId
      );
      const getAccountFromModelStub = sandbox.stub();
      getAccountFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AccountModel,
        'getAccountById',
        getAccountFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const account = await accountService.getAccount(accountId);
      assert.notOk(account);

      assert.isTrue(getAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const accountId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getAccountById'
      );
      const getAccountFromModelStub = sandbox.stub();
      getAccountFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AccountModel,
        'getAccountById',
        getAccountFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await accountService.getAccount(accountId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getAccounts', () => {
    it('should get accounts by filter', async () => {
      const accountId = new mongooseTypes.ObjectId();
      const accountId2 = new mongooseTypes.ObjectId();
      const accountFilter = {_id: accountId};

      const queryAccountsFromModelStub = sandbox.stub();
      queryAccountsFromModelStub.resolves({
        results: [
          {
            ...mocks.MOCK_ACCOUNT,
            _id: accountId,
            user: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
          } as unknown as databaseTypes.IAccount,
          {
            ...mocks.MOCK_ACCOUNT,
            _id: accountId2,
            user: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
          } as unknown as databaseTypes.IAccount,
        ],
      } as unknown as databaseTypes.IAccount[]);

      sandbox.replace(
        dbConnection.models.AccountModel,
        'queryAccounts',
        queryAccountsFromModelStub
      );

      const accounts = await accountService.getAccounts(accountFilter);
      assert.isOk(accounts![0]);
      assert.strictEqual(accounts![0]._id?.toString(), accountId.toString());
      assert.isTrue(queryAccountsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the accounts cannot be found', async () => {
      const accountName = 'accountName1';
      const accountFilter = {name: accountName};
      const errMessage = 'Cannot find the account';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        accountFilter
      );
      const getAccountFromModelStub = sandbox.stub();
      getAccountFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AccountModel,
        'queryAccounts',
        getAccountFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const account = await accountService.getAccounts(accountFilter);
      assert.notOk(account);

      assert.isTrue(getAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const accountName = 'accountName1';
      const accountFilter = {name: accountName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getAccountByEmail'
      );
      const getAccountFromModelStub = sandbox.stub();
      getAccountFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AccountModel,
        'queryAccounts',
        getAccountFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await accountService.getAccounts(accountFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateAccount', () => {
    it('will update a account', async () => {
      const accountId = new mongooseTypes.ObjectId();
      const updateAccountFromModelStub = sandbox.stub();
      updateAccountFromModelStub.resolves({
        ...mocks.MOCK_ACCOUNT,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IAccount);
      sandbox.replace(
        dbConnection.models.AccountModel,
        'updateAccountById',
        updateAccountFromModelStub
      );

      const account = await accountService.updateAccount(accountId, {
        deletedAt: new Date(),
      });
      assert.isOk(account);
      assert.strictEqual(account._id, accountId);
      assert.isOk(account.deletedAt);
      assert.isTrue(updateAccountFromModelStub.calledOnce);
    });
    it('will update a account when the id is a string', async () => {
      const accountId = new mongooseTypes.ObjectId();
      const updateAccountFromModelStub = sandbox.stub();
      updateAccountFromModelStub.resolves({
        ...mocks.MOCK_ACCOUNT,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IAccount);
      sandbox.replace(
        dbConnection.models.AccountModel,
        'updateAccountById',
        updateAccountFromModelStub
      );

      const account = await accountService.updateAccount(accountId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(account);
      assert.strictEqual(account._id, accountId);
      assert.isOk(account.deletedAt);
      assert.isTrue(updateAccountFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when account model throws it ', async () => {
      const accountId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateAccountFromModelStub = sandbox.stub();
      updateAccountFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AccountModel,
        'updateAccountById',
        updateAccountFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await accountService.updateAccount(accountId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when account model throws it ', async () => {
      const accountId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateAccountFromModelStub = sandbox.stub();
      updateAccountFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AccountModel,
        'updateAccountById',
        updateAccountFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await accountService.updateAccount(accountId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when account model throws a DataOperationError ', async () => {
      const accountId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateAccountById'
      );
      const updateAccountFromModelStub = sandbox.stub();
      updateAccountFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.AccountModel,
        'updateAccountById',
        updateAccountFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await accountService.updateAccount(accountId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateAccountFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
