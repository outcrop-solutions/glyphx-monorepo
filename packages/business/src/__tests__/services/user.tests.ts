import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import {userService} from '../../services';
import {EmailClient} from 'email';

describe('#services/user', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
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
      const errMessage = 'Cannot find the user';
      const err = new error.DataNotFoundError(errMessage, 'userId', userId);
      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);
      function fakePublish(this: any) {
        assert.instanceOf(this, error.DataNotFoundError);
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
  context('deactivate', () => {
    it('will deactivate a user', async () => {
      const userId = new mongooseTypes.ObjectId();
      const deletedAt = new Date();
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        deletedAt: deletedAt,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves();
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.resolves();
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      const user = await userService.deactivate(userId);
      assert.isOk(user);
      assert.strictEqual(user._id, userId);
      assert.strictEqual(user.deletedAt, deletedAt);
      assert.isTrue(updateUserFromModelStub.calledOnce);
    });
    it('will deactivate the user when the id is a string', async () => {
      const userId = new mongooseTypes.ObjectId();
      const deletedAt = new Date();
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        deletedAt: deletedAt,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves();
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.resolves();
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      const user = await userService.deactivate(userId.toString());
      assert.isOk(user);
      assert.strictEqual(user._id, userId);
      assert.strictEqual(user.deletedAt, deletedAt);

      assert.isTrue(updateUserFromModelStub.calledOnce);
    });

    // user model fails
    it('will publish and rethrow an InvalidArgumentError when user model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'emailVerified', true);
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      function fakePublish() {
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
        await userService.deactivate(userId);
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
        await userService.deactivate(userId);
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
        await userService.deactivate(userId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // workspace model fails
    it('will publish and rethrow an InvalidArgumentError when workspace model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const deletedAt = new Date();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'emailVerified', true);
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        deletedAt: deletedAt,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      function fakePublish() {
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
        await userService.deactivate(userId);
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when workspace model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const deletedAt = new Date();
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        deletedAt: deletedAt,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      function fakePublish() {
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
        await userService.deactivate(userId);
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when workspace model throws a DataOperationError ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const deletedAt = new Date();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateUserById');
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        deletedAt: deletedAt,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      function fakePublish() {
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
        await userService.deactivate(userId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // member model fails
    it('will publish and rethrow an InvalidArgumentError when Member model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'emailVerified', true);
      const deletedAt = new Date();
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        deletedAt: deletedAt,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      function fakePublish() {
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
        await userService.deactivate(userId);
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when Member model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const deletedAt = new Date();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        deletedAt: deletedAt,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      function fakePublish() {
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
        await userService.deactivate(userId);
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when Member model throws a DataOperationError ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateUserById');
      const deletedAt = new Date();
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        deletedAt: deletedAt,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      function fakePublish() {
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
        await userService.deactivate(userId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // customer payment model fails
    it('will publish and rethrow an InvalidArgumentError when Customer Payment model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'emailVerified', true);
      const deletedAt = new Date();
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        deletedAt: deletedAt,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves();
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
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
        await userService.deactivate(userId);
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when Customer Payment model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const deletedAt = new Date();
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        deletedAt: deletedAt,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves();
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
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
        await userService.deactivate(userId);
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when Customer Payment throws a DataOperationError ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateUserById');
      const deletedAt = new Date();
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        deletedAt: deletedAt,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves();
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
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
        await userService.deactivate(userId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateEmail', () => {
    it('will update a users email', async () => {
      const userId = new mongooseTypes.ObjectId();
      const email = 'testemail@gmail.com';
      const previousEmail = 'testprevious@gmail.com';

      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        email: email,
        emailVerified: undefined,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves();
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.resolves();
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      const user = await userService.updateEmail(userId, email, previousEmail);
      assert.isOk(user);
      assert.strictEqual(user._id, userId);
      assert.strictEqual(user.email, email);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledTwice);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
    });
    it('will update a users email when the id is a string', async () => {
      const userId = new mongooseTypes.ObjectId();
      const email = 'testemail@gmail.com';
      const previousEmail = 'testprevious@gmail.com';
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        email: email,
        emailVerified: undefined,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves();
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.resolves();
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      const user = await userService.updateEmail(userId.toString(), email, previousEmail);
      assert.isOk(user);
      assert.strictEqual(user._id, userId);
      assert.strictEqual(user.email, email);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledTwice);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when user model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const email = 'testemail@gmail.com';
      const previousEmail = 'testpreviousemail@gmail.com';
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'emailVerified', true);
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      function fakePublish() {
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
        await userService.updateEmail(userId, email, previousEmail);
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
      const email = 'testemail@gmail.com';
      const previousEmail = 'testprevious@gmail.com';
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      function fakePublish() {
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
        await userService.updateEmail(userId, email, previousEmail);
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
      const email = 'testemail@gmail.com';
      const previousEmail = 'testprevious@gmail.com';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateUserById');
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      function fakePublish() {
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
        await userService.updateEmail(userId, email, previousEmail);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    // TODO: fix these tests
    it('will publish and rethrow an InvalidArgumentError when member model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const email = 'testemail@gmail.com';
      const previousEmail = 'testpreviousemail@gmail.com';
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'emailVerified', true);
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        email: email,
        emailVerified: undefined,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      function fakePublish() {
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
        await userService.updateEmail(userId, email, previousEmail);
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when member model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const email = 'testemail@gmail.com';
      const previousEmail = 'testprevious@gmail.com';
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        email: email,
        emailVerified: undefined,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      function fakePublish() {
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
        await userService.updateEmail(userId, email, previousEmail);
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when member model throws a DataOperationError ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const email = 'testemail@gmail.com';
      const previousEmail = 'testprevious@gmail.com';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateUserById');
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        email: email,
        emailVerified: undefined,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      function fakePublish() {
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
        await userService.updateEmail(userId, email, previousEmail);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when customerPayment model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const email = 'testemail@gmail.com';
      const previousEmail = 'testpreviousemail@gmail.com';
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'emailVerified', true);
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        email: email,
        emailVerified: undefined,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves();
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
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
        await userService.updateEmail(userId, email, previousEmail);
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledTwice);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when customerPayment model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const email = 'testemail@gmail.com';
      const previousEmail = 'testprevious@gmail.com';
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        email: email,
        emailVerified: undefined,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves();
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
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
        await userService.updateEmail(userId, email, previousEmail);
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledTwice);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when customerPayment model throws a DataOperationError ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const email = 'testemail@gmail.com';
      const previousEmail = 'testprevious@gmail.com';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateUserById');
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        email: email,
        emailVerified: undefined,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves();
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
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
        await userService.updateEmail(userId, email, previousEmail);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserFromModelStub.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledTwice);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateName', () => {
    it('will update a users name', async () => {
      const userId = new mongooseTypes.ObjectId();
      const name = 'testName';
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        name: name,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const user = await userService.updateName(userId, name);
      assert.isOk(user);
      assert.strictEqual(user._id, userId);
      assert.strictEqual(user.name, name);

      assert.isTrue(updateUserFromModelStub.calledOnce);
    });
    it('will update a users name when the id is a string', async () => {
      const userId = new mongooseTypes.ObjectId();
      const name = 'testName';
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.resolves({
        _id: userId,
        name: name,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      const user = await userService.updateName(userId.toString(), name);
      assert.isOk(user);
      assert.strictEqual(user._id, userId);
      assert.strictEqual(user.name, name);

      assert.isTrue(updateUserFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when user model throws it ', async () => {
      const userId = new mongooseTypes.ObjectId();
      const name = 'testName';
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'emailVerified', true);
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      function fakePublish() {
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
        await userService.updateName(userId, name);
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
      const name = 'testName';
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      function fakePublish() {
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
        await userService.updateName(userId, name);
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
      const name = 'testName';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateUserById');
      const updateUserFromModelStub = sandbox.stub();
      updateUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'updateUserById', updateUserFromModelStub);

      function fakePublish() {
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
        await userService.updateName(userId, name);
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
