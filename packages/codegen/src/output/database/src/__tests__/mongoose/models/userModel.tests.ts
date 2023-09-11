// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {UserModel} from '../../../mongoose/models/user';
import * as mocks from '../../../mongoose/mocks';
import {AccountModel} from '../../../mongoose/models/account';
import {SessionModel} from '../../../mongoose/models/session';
import {MemberModel} from '../../../mongoose/models/member';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {ProjectModel} from '../../../mongoose/models/project';
import {CustomerPaymentModel} from '../../../mongoose/models/customerPayment';
import {WebhookModel} from '../../../mongoose/models/webhook';
import {IQueryResult, databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/user', () => {
  context('userIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the userId exists', async () => {
      const userId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const result = await UserModel.userIdExists(userId);

      assert.isTrue(result);
    });

    it('should return false if the userId does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const result = await UserModel.userIdExists(userId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const userId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(UserModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await UserModel.userIdExists(userId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allUserIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the user ids exist', async () => {
      const userIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedUserIds = userIds.map(userId => {
        return {
          _id: userId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedUserIds);
      sandbox.replace(UserModel, 'find', findStub);

      assert.isTrue(await UserModel.allUserIdsExist(userIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const userIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedUserIds = [
        {
          _id: userIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedUserIds);
      sandbox.replace(UserModel, 'find', findStub);
      let errored = false;
      try {
        await UserModel.allUserIdsExist(userIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(err.data.value[0].toString(), userIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const userIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(UserModel, 'find', findStub);
      let errored = false;
      try {
        await UserModel.allUserIdsExist(userIds);
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
      const customerPaymentStub = sandbox.stub();
      customerPaymentStub.resolves(true);
      sandbox.replace(
        CustomerPaymentModel,
        'customerPaymentIdExists',
        customerPaymentStub
      );

      let errored = false;

      try {
        await UserModel.validateUpdateObject(
          mocks.MOCK_USER as unknown as Omit<
            Partial<databaseTypes.IUser>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const customerPaymentStub = sandbox.stub();
      customerPaymentStub.resolves(true);
      sandbox.replace(
        CustomerPaymentModel,
        'customerPaymentIdExists',
        customerPaymentStub
      );

      let errored = false;

      try {
        await UserModel.validateUpdateObject(
          mocks.MOCK_USER as unknown as Omit<
            Partial<databaseTypes.IUser>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(customerPaymentStub.calledOnce);
    });

    it('will fail when the customerPayment does not exist.', async () => {
      const customerPaymentStub = sandbox.stub();
      customerPaymentStub.resolves(false);
      sandbox.replace(
        CustomerPaymentModel,
        'customerPaymentIdExists',
        customerPaymentStub
      );

      let errored = false;

      try {
        await UserModel.validateUpdateObject(
          mocks.MOCK_USER as unknown as Omit<
            Partial<databaseTypes.IUser>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const customerPaymentStub = sandbox.stub();
      customerPaymentStub.resolves(true);
      sandbox.replace(
        CustomerPaymentModel,
        'customerPaymentIdExists',
        customerPaymentStub
      );

      let errored = false;

      try {
        await UserModel.validateUpdateObject({
          ...mocks.MOCK_USER,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IUser>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const customerPaymentStub = sandbox.stub();
      customerPaymentStub.resolves(true);
      sandbox.replace(
        CustomerPaymentModel,
        'customerPaymentIdExists',
        customerPaymentStub
      );

      let errored = false;

      try {
        await UserModel.validateUpdateObject({
          ...mocks.MOCK_USER,
          createdAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IUser>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const customerPaymentStub = sandbox.stub();
      customerPaymentStub.resolves(true);
      sandbox.replace(
        CustomerPaymentModel,
        'customerPaymentIdExists',
        customerPaymentStub
      );

      let errored = false;

      try {
        await UserModel.validateUpdateObject({
          ...mocks.MOCK_USER,
          updatedAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IUser>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createUser', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a user document', async () => {
      sandbox.replace(
        UserModel,
        'validateAccounts',
        sandbox.stub().resolves(mocks.MOCK_USER.accounts)
      );
      sandbox.replace(
        UserModel,
        'validateSessions',
        sandbox.stub().resolves(mocks.MOCK_USER.sessions)
      );
      sandbox.replace(
        UserModel,
        'validateMemberships',
        sandbox.stub().resolves(mocks.MOCK_USER.membership)
      );
      sandbox.replace(
        UserModel,
        'validateInvitedMembers',
        sandbox.stub().resolves(mocks.MOCK_USER.invitedMembers)
      );
      sandbox.replace(
        UserModel,
        'validateCreatedWorkspaces',
        sandbox.stub().resolves(mocks.MOCK_USER.createdWorkspaces)
      );
      sandbox.replace(
        UserModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_USER.projects)
      );
      sandbox.replace(
        UserModel,
        'validateCustomerPayment',
        sandbox.stub().resolves(mocks.MOCK_USER.customerPayment)
      );
      sandbox.replace(
        UserModel,
        'validateWebhooks',
        sandbox.stub().resolves(mocks.MOCK_USER.webhooks)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        UserModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(UserModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(UserModel, 'getUserById', stub);

      const userDocument = await UserModel.createUser(mocks.MOCK_USER);

      assert.strictEqual(userDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when the customerPayment validator throws one', async () => {
      sandbox.replace(
        UserModel,
        'validateAccounts',
        sandbox.stub().resolves(mocks.MOCK_USER.accounts)
      );
      sandbox.replace(
        UserModel,
        'validateSessions',
        sandbox.stub().resolves(mocks.MOCK_USER.sessions)
      );
      sandbox.replace(
        UserModel,
        'validateMemberships',
        sandbox.stub().resolves(mocks.MOCK_USER.membership)
      );
      sandbox.replace(
        UserModel,
        'validateCreatedWorkspaces',
        sandbox.stub().resolves(mocks.MOCK_USER.createdWorkspaces)
      );
      sandbox.replace(
        UserModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_USER.projects)
      );
      sandbox.replace(
        UserModel,
        'validateCustomerPayment',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The customerPayment does not exist',
              'customerPayment ',
              {}
            )
          )
      );
      sandbox.replace(
        UserModel,
        'validateWebhooks',
        sandbox.stub().resolves(mocks.MOCK_USER.webhooks)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        UserModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(UserModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(UserModel, 'getUserById', stub);

      let errored = false;

      try {
        await UserModel.createUser(mocks.MOCK_USER);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        UserModel,
        'validateAccounts',
        sandbox.stub().resolves(mocks.MOCK_USER.accounts)
      );
      sandbox.replace(
        UserModel,
        'validateSessions',
        sandbox.stub().resolves(mocks.MOCK_USER.sessions)
      );
      sandbox.replace(
        UserModel,
        'validateMemberships',
        sandbox.stub().resolves(mocks.MOCK_USER.membership)
      );
      sandbox.replace(
        UserModel,
        'validateInvitedMembers',
        sandbox.stub().resolves(mocks.MOCK_USER.invitedMembers)
      );
      sandbox.replace(
        UserModel,
        'validateCreatedWorkspaces',
        sandbox.stub().resolves(mocks.MOCK_USER.createdWorkspaces)
      );
      sandbox.replace(
        UserModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_USER.projects)
      );
      sandbox.replace(
        UserModel,
        'validateCustomerPayment',
        sandbox.stub().resolves(mocks.MOCK_USER.customerPayment)
      );
      sandbox.replace(
        UserModel,
        'validateWebhooks',
        sandbox.stub().resolves(mocks.MOCK_USER.webhooks)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        UserModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserModel, 'getUserById', stub);
      let hasError = false;
      try {
        await UserModel.createUser(mocks.MOCK_USER);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        UserModel,
        'validateAccounts',
        sandbox.stub().resolves(mocks.MOCK_USER.accounts)
      );
      sandbox.replace(
        UserModel,
        'validateSessions',
        sandbox.stub().resolves(mocks.MOCK_USER.sessions)
      );
      sandbox.replace(
        UserModel,
        'validateMemberships',
        sandbox.stub().resolves(mocks.MOCK_USER.membership)
      );
      sandbox.replace(
        UserModel,
        'validateInvitedMembers',
        sandbox.stub().resolves(mocks.MOCK_USER.invitedMembers)
      );
      sandbox.replace(
        UserModel,
        'validateCreatedWorkspaces',
        sandbox.stub().resolves(mocks.MOCK_USER.createdWorkspaces)
      );
      sandbox.replace(
        UserModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_USER.projects)
      );
      sandbox.replace(
        UserModel,
        'validateCustomerPayment',
        sandbox.stub().resolves(mocks.MOCK_USER.customerPayment)
      );
      sandbox.replace(
        UserModel,
        'validateWebhooks',
        sandbox.stub().resolves(mocks.MOCK_USER.webhooks)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(UserModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserModel, 'getUserById', stub);

      let hasError = false;
      try {
        await UserModel.createUser(mocks.MOCK_USER);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        UserModel,
        'validateAccounts',
        sandbox.stub().resolves(mocks.MOCK_USER.accounts)
      );
      sandbox.replace(
        UserModel,
        'validateSessions',
        sandbox.stub().resolves(mocks.MOCK_USER.sessions)
      );
      sandbox.replace(
        UserModel,
        'validateMemberships',
        sandbox.stub().resolves(mocks.MOCK_USER.membership)
      );
      sandbox.replace(
        UserModel,
        'validateInvitedMembers',
        sandbox.stub().resolves(mocks.MOCK_USER.invitedMembers)
      );
      sandbox.replace(
        UserModel,
        'validateCreatedWorkspaces',
        sandbox.stub().resolves(mocks.MOCK_USER.createdWorkspaces)
      );
      sandbox.replace(
        UserModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_USER.projects)
      );
      sandbox.replace(
        UserModel,
        'validateCustomerPayment',
        sandbox.stub().resolves(mocks.MOCK_USER.customerPayment)
      );
      sandbox.replace(
        UserModel,
        'validateWebhooks',
        sandbox.stub().resolves(mocks.MOCK_USER.webhooks)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        UserModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        UserModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserModel, 'getUserById', stub);
      let hasError = false;
      try {
        await UserModel.createUser(mocks.MOCK_USER);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getUserById', () => {
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

    it('will retreive a user document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_USER));
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const doc = await UserModel.getUserById(
        mocks.MOCK_USER._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.accounts[0] as any)?.__v);
      assert.isUndefined((doc.sessions[0] as any)?.__v);
      assert.isUndefined((doc.membership[0] as any)?.__v);
      assert.isUndefined((doc.invitedMembers[0] as any)?.__v);
      assert.isUndefined((doc.createdWorkspaces[0] as any)?.__v);
      assert.isUndefined((doc.projects[0] as any)?.__v);
      assert.isUndefined((doc.customerPayment as any)?.__v);
      assert.isUndefined((doc.webhooks[0] as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_USER._id);
    });

    it('will throw a DataNotFoundError when the user does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(UserModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await UserModel.getUserById(
          mocks.MOCK_USER._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(
        new MockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(UserModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await UserModel.getUserById(
          mocks.MOCK_USER._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryUsers', () => {
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

    const mockUsers = [
      {
        ...mocks.MOCK_USER,
        _id: new mongoose.Types.ObjectId(),
        accounts: [],
        sessions: [],
        membership: [],
        invitedMembers: [],
        createdWorkspaces: [],
        projects: [],
        customerPayment: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.ICustomerPayment,
        webhooks: [],
      } as databaseTypes.IUser,
      {
        ...mocks.MOCK_USER,
        _id: new mongoose.Types.ObjectId(),
        accounts: [],
        sessions: [],
        membership: [],
        invitedMembers: [],
        createdWorkspaces: [],
        projects: [],
        customerPayment: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.ICustomerPayment,
        webhooks: [],
      } as databaseTypes.IUser,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered users', async () => {
      sandbox.replace(
        UserModel,
        'count',
        sandbox.stub().resolves(mockUsers.length)
      );

      sandbox.replace(
        UserModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockUsers))
      );

      const results = await UserModel.queryUsers({});

      assert.strictEqual(results.numberOfItems, mockUsers.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockUsers.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.accounts[0] as any)?.__v);
        assert.isUndefined((doc.sessions[0] as any)?.__v);
        assert.isUndefined((doc.membership[0] as any)?.__v);
        assert.isUndefined((doc.invitedMembers[0] as any)?.__v);
        assert.isUndefined((doc.createdWorkspaces[0] as any)?.__v);
        assert.isUndefined((doc.projects[0] as any)?.__v);
        assert.isUndefined((doc.customerPayment as any)?.__v);
        assert.isUndefined((doc.webhooks[0] as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(UserModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        UserModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockUsers))
      );

      let errored = false;
      try {
        await UserModel.queryUsers();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        UserModel,
        'count',
        sandbox.stub().resolves(mockUsers.length)
      );

      sandbox.replace(
        UserModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockUsers))
      );

      let errored = false;
      try {
        await UserModel.queryUsers({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        UserModel,
        'count',
        sandbox.stub().resolves(mockUsers.length)
      );

      sandbox.replace(
        UserModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await UserModel.queryUsers({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateUserById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a user', async () => {
      const updateUser = {
        ...mocks.MOCK_USER,
        deletedAt: new Date(),
        accounts: [],
        sessions: [],
        membership: [],
        createdWorkspaces: [],
        projects: [],
        customerPayment: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.ICustomerPayment,
        webhooks: [],
      } as unknown as databaseTypes.IUser;

      const userId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(UserModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'getUserById', getUserStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(UserModel, 'validateUpdateObject', validateStub);

      const result = await UserModel.updateUserById(userId, updateUser);

      assert.strictEqual(result._id, userId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a user with references as ObjectIds', async () => {
      const updateUser = {
        ...mocks.MOCK_USER,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IUser;

      const userId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(UserModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'getUserById', getUserStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(UserModel, 'validateUpdateObject', validateStub);

      const result = await UserModel.updateUserById(userId, updateUser);

      assert.strictEqual(result._id, userId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the user does not exist', async () => {
      const updateUser = {
        ...mocks.MOCK_USER,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IUser;

      const userId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(UserModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(UserModel, 'validateUpdateObject', validateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'getUserById', getUserStub);

      let errorred = false;
      try {
        await UserModel.updateUserById(userId, updateUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateUser = {
        ...mocks.MOCK_USER,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IUser;

      const userId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(UserModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'getUserById', getUserStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(UserModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await UserModel.updateUserById(userId, updateUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateUser = {
        ...mocks.MOCK_USER,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IUser;

      const userId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(UserModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'getUserById', getUserStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(UserModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await UserModel.updateUserById(userId, updateUser);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a user document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a user', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(UserModel, 'deleteOne', deleteStub);

      const userId = new mongoose.Types.ObjectId();

      await UserModel.deleteUserById(userId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the user does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(UserModel, 'deleteOne', deleteStub);

      const userId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await UserModel.deleteUserById(userId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(UserModel, 'deleteOne', deleteStub);

      const userId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await UserModel.deleteUserById(userId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});
