// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import {userService} from '../services';
import * as mocks from 'database/src/mongoose/mocks';

describe('#services/user', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createUser', () => {
    it('will create a User', async () => {
      const userId = new mongooseTypes.ObjectId();
      const createdAtId = new mongooseTypes.ObjectId();
      const customerPaymentId = new mongooseTypes.ObjectId();

      // createUser
      const createUserFromModelStub = sandbox.stub();
      createUserFromModelStub.resolves({
        ...mocks.MOCK_USER,
        _id: new mongooseTypes.ObjectId(),
        customerPayment: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.ICustomerPayment,
      } as unknown as databaseTypes.IUser);

      sandbox.replace(dbConnection.models.UserModel, 'createUser', createUserFromModelStub);

      const doc = await userService.createUser({
        ...mocks.MOCK_USER,
        _id: new mongooseTypes.ObjectId(),
        customerPayment: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.ICustomerPayment,
      } as unknown as databaseTypes.IUser);

      assert.isTrue(createUserFromModelStub.calledOnce);
    });
    // user model fails
    it('will publish and rethrow an InvalidArgumentError when user model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createUser
      const createUserFromModelStub = sandbox.stub();
      createUserFromModelStub.rejects(err);

      sandbox.replace(dbConnection.models.UserModel, 'createUser', createUserFromModelStub);

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
        await userService.createUser({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when user model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createUser
      const createUserFromModelStub = sandbox.stub();
      createUserFromModelStub.rejects(err);

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
        await userService.createUser({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when user model throws it', async () => {
      const createUserFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createUserFromModelStub.rejects(err);

      sandbox.replace(dbConnection.models.UserModel, 'createUser', createUserFromModelStub);

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
        await userService.createUser({});
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when user model throws a DataOperationError', async () => {
      const createUserFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateCustomerPaymentById');

      createUserFromModelStub.rejects(err);

      sandbox.replace(dbConnection.models.UserModel, 'createUser', createUserFromModelStub);

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
        await userService.createUser({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when user model throws a UnexpectedError', async () => {
      const createUserFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(errMessage, 'mongodDb');

      createUserFromModelStub.rejects(err);

      sandbox.replace(dbConnection.models.UserModel, 'createUser', createUserFromModelStub);

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
        await userService.createUser({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getUser', () => {
    it('should get a user by id', async () => {
      const userId = new mongooseTypes.ObjectId();

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.resolves({
        _id: userId,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

      const user = await userService.getUser(userId);
      assert.isOk(user);
      assert.strictEqual(user?._id?.toString(), userId.toString());

      assert.isTrue(getUserFromModelStub.calledOnce);
    });
    it('should get a user by id when id is a string', async () => {
      const userId = new mongooseTypes.ObjectId();

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.resolves({
        _id: userId,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

      const user = await userService.getUser(userId.toString());
      assert.isOk(user);
      assert.strictEqual(user?._id?.toString(), userId.toString());

      assert.isTrue(getUserFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the user cannot be found', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(errMessage, 'userId', userId);
      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);
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

      const user = await userService.getUser(userId);
      assert.notOk(user);

      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'getUserById');
      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);
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
        await userService.getUser(userId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getUsers', () => {
    it('should get users by filter', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userId2 = new mongooseTypes.ObjectId();
      const userFilter = {_id: userId};

      const queryUsersFromModelStub = sandbox.stub();
      queryUsersFromModelStub.resolves({
        results: [
          {
            ...mocks.MOCK_USER,
            _id: userId,
            customerPayment: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.ICustomerPayment,
          } as unknown as databaseTypes.IUser,
          {
            ...mocks.MOCK_USER,
            _id: userId2,
            customerPayment: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.ICustomerPayment,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IUser[]);

      sandbox.replace(dbConnection.models.UserModel, 'queryUsers', queryUsersFromModelStub);

      const users = await userService.getUsers(userFilter);
      assert.isOk(users![0]);
      assert.strictEqual(users![0]._id?.toString(), userId.toString());
      assert.isTrue(queryUsersFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the users cannot be found', async () => {
      const userName = 'userName1';
      const userFilter = {name: userName};
      const errMessage = 'Cannot find the user';
      const err = new error.DataNotFoundError(errMessage, 'name', userFilter);
      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'queryUsers', getUserFromModelStub);
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

      const user = await userService.getUsers(userFilter);
      assert.notOk(user);

      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const userName = 'userName1';
      const userFilter = {name: userName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'getUserByEmail');
      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'queryUsers', getUserFromModelStub);
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
        await userService.getUsers(userFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateUser', () => {
    it('will update a user', async () => {
      const userId = new mongooseTypes.ObjectId();
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        ...mocks.MOCK_USER,
        _id: new mongooseTypes.ObjectId(),
        customerPayment: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.ICustomerPayment,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const user = await userService.updateUser(userId, {
        deletedAt: new Date(),
      });
      assert.isOk(user);
      assert.strictEqual(user._id, userId);
      assert.isOk(user.deletedAt);
      assert.isTrue(updateUserFromModelStub.calledOnce);
    });
    it('will update a user when the id is a string', async () => {
      const userId = new mongooseTypes.ObjectId();
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        ...mocks.MOCK_USER,
        _id: new mongooseTypes.ObjectId(),
        customerPayment: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.ICustomerPayment,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const user = await userService.updateUser(userId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(user);
      assert.strictEqual(user._id, userId);
      assert.isOk(user.deletedAt);
      assert.isTrue(updateUserFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when user model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

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
        await userService.updateUser(userId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when user model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

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
        await userService.updateUser(userId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when user model throws a DataOperationError ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateUserById');
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

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
        await userService.updateUser(userId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
