import {assert} from 'chai';
import {UserModel} from '../../../mongoose/models/user';
import {ProjectModel} from '../../../mongoose/models/project';
import {AccountModel} from '../../../mongoose/models/account';
import {SessionModel} from '../../../mongoose/models/session';
import {MemberModel} from '../../../mongoose/models/member';
import {WebhookModel} from '../../../mongoose/models/webhook';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {CustomerPaymentModel} from '../../../mongoose/models/customerPayment';
import {databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const MOCK_USER: databaseTypes.IUser = {
  userCode: 'dfkadfkljafdkalsjskldf',
  name: 'testUser',
  username: 'test@user.com',
  email: 'test@user.com',
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
const MOCK_NULLISH_USER = {
  userCode: 'dfkadfkljafdkalsjskldf',
  name: 'testUser',
  username: 'test@user.com',
  email: 'test@user.com',
  emailVerified: new Date(),
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: undefined,
  sessions: undefined,
  membership: undefined,
  invitedMembers: undefined,
  createdWorkspaces: undefined,
  projects: undefined,
  webhooks: undefined,
} as unknown as databaseTypes.IUser;

describe('#mongoose/models/user', () => {
  context('createUser', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a user document', async () => {
      sandbox.replace(UserModel, 'validateProjects', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateWorkspaces', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateMembership', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateWebhooks', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateSessions', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateAccounts', sandbox.stub().resolves([]));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      sandbox.replace(UserModel, 'validate', sandbox.stub().resolves(true));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserModel, 'getUserById', stub);
      const userDocument = await UserModel.createUser(MOCK_USER);

      assert.strictEqual(userDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });
    it('will create a user document with nullish coallesce', async () => {
      sandbox.replace(UserModel, 'validateProjects', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateWorkspaces', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateMembership', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateWebhooks', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateSessions', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateAccounts', sandbox.stub().resolves([]));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      sandbox.replace(UserModel, 'validate', sandbox.stub().resolves(true));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserModel, 'getUserById', stub);
      const userDocument = await UserModel.createUser(MOCK_NULLISH_USER);

      assert.strictEqual(userDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when a validator throws one', async () => {
      sandbox.replace(
        UserModel,
        'validateProjects',
        sandbox.stub().rejects(new error.DataValidationError('Could not validate the projects', 'projects', []))
      );
      sandbox.replace(UserModel, 'validateWorkspaces', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateWebhooks', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateMembership', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateSessions', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateAccounts', sandbox.stub().resolves([]));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(UserModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserModel, 'getUserById', stub);
      let hasError = false;
      try {
        await UserModel.createUser(MOCK_USER);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(UserModel, 'validateProjects', sandbox.stub().resolves());
      sandbox.replace(UserModel, 'validateWorkspaces', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateWebhooks', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateSessions', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateMembership', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateAccounts', sandbox.stub().resolves([]));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(UserModel, 'create', sandbox.stub().rejects('oops, something bad has happened'));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserModel, 'getUserById', stub);
      let hasError = false;
      try {
        await UserModel.createUser(MOCK_USER);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(UserModel, 'validateProjects', sandbox.stub().resolves());
      sandbox.replace(UserModel, 'validateWorkspaces', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateWebhooks', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateMembership', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateSessions', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateAccounts', sandbox.stub().resolves([]));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(UserModel, 'create', sandbox.stub().resolves([{}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserModel, 'getUserById', stub);
      let hasError = false;
      try {
        await UserModel.createUser(MOCK_USER);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(UserModel, 'validateProjects', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateWorkspaces', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateWebhooks', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateMembership', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateSessions', sandbox.stub().resolves([]));
      sandbox.replace(UserModel, 'validateAccounts', sandbox.stub().resolves([]));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'validate', sandbox.stub().rejects('oops an error has occurred'));
      sandbox.replace(UserModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserModel, 'getUserById', stub);
      let hasError = false;
      try {
        await UserModel.createUser(MOCK_USER);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('updateUserById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('Should update an existing user', async () => {
      const updateUser = {
        name: 'Jason Vorhees',
        email: 'jason.vorhees@campcrystallake.biz',
      };

      const userId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(UserModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'getUserById', getUserStub);

      const result = await UserModel.updateUserById(userId.toString(), updateUser);

      assert.strictEqual(result._id, userId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
    });

    it('Should update an existing user with a customerPayment object', async () => {
      const updateUser = {
        name: 'Jason Vorhees',
        email: 'jason.vorhees@campcrystallake.biz',
        customerPayment: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.ICustomerPayment,
      };

      const userId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(UserModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'getUserById', getUserStub);

      const validateCustomerPaymentStub = sandbox.stub();
      validateCustomerPaymentStub.resolves(true);
      sandbox.replace(CustomerPaymentModel, 'customerPaymentIdExists', validateCustomerPaymentStub);

      const result = await UserModel.updateUserById(userId.toString(), updateUser);

      assert.strictEqual(result._id, userId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
      assert.strictEqual(
        updateStub.firstCall.args[1].customerPayment.toString(),
        updateUser.customerPayment._id?.toString()
      );
    });

    it('Should update an existing user with a customerPayment objectId', async () => {
      const updateUser = {
        name: 'Jason Vorhees',
        email: 'jason.vorhees@campcrystallake.biz',
        customerPayment: new mongoose.Types.ObjectId() as unknown as databaseTypes.ICustomerPayment,
      };

      const userId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(UserModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'getUserById', getUserStub);

      const validateCustomerPaymentStub = sandbox.stub();
      validateCustomerPaymentStub.resolves(true);
      sandbox.replace(CustomerPaymentModel, 'customerPaymentIdExists', validateCustomerPaymentStub);

      const result = await UserModel.updateUserById(userId.toString(), updateUser);

      assert.strictEqual(result._id, userId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
      assert.strictEqual(
        updateStub.firstCall.args[1].customerPayment.toString(),
        updateUser.customerPayment.toString()
      );
    });
    it('Will fail when the user does not exist', async () => {
      const updateUser = {
        name: 'Jason Vorhees',
        email: 'jason.vorhees@campcrystallake.biz',
      };

      const userId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(UserModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'getUserById', getUserStub);

      let errorred = false;
      try {
        await UserModel.updateUserById(userId.toString(), updateUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateUser = {
        name: 'Jason Vorhees',
        email: 'jason.vorhees@campcrystallake.biz',
      };

      const userId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(UserModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'getUserById', getUserStub);

      sandbox.replace(
        UserModel,
        'validateUpdateObject',
        sandbox.stub().throws(new error.InvalidOperationError("You can't do this", {}))
      );
      let errorred = false;
      try {
        await UserModel.updateUserById(userId.toString(), updateUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateUser = {
        name: 'Jason Vorhees',
        email: 'jason.vorhees@campcrystallake.biz',
      };

      const userId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(UserModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves({_id: userId});
      sandbox.replace(UserModel, 'getUserById', getUserStub);

      let errorred = false;
      try {
        await UserModel.updateUserById(userId.toString(), updateUser);
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
    it('will return true when no restricted fields are present', async () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        createdWorkspaces: [],
        projects: [],
        membership: [],
        invitedMembers: [],
        webhooks: [],
      };

      assert.isTrue(await UserModel.validateUpdateObject(inputUser));
    });

    it('will fail when trying to update accounts', async () => {
      const inputUser = {
        accounts: [new mongoose.Types.ObjectId()],
        sessions: [],
        createdWorkspaces: [],
        projects: [],
        membership: [],
        invitedMembers: [],
        webhooks: [],
      } as unknown as databaseTypes.IUser;

      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update sessions', async () => {
      const inputUser = {
        accounts: [],
        sessions: [new mongoose.Types.ObjectId()],
        createdWorkspaces: [],
        projects: [],
        membership: [],
        invitedMembers: [],
        webhooks: [],
      } as unknown as databaseTypes.IUser;

      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update createdWorkspaces', async () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        membership: [],
        invitedMembers: [],
        createdWorkspaces: [new mongoose.Types.ObjectId()],
        projects: [],
        webhooks: [],
      } as unknown as databaseTypes.IUser;

      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update projects', async () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        membership: [],
        invitedMembers: [],
        createdWorkspaces: [],
        projects: [new mongoose.Types.ObjectId()],
        webhooks: [],
      } as unknown as databaseTypes.IUser;

      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update webhooks', async () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        membership: [],
        invitedMembers: [],
        createdWorkspaces: [],
        projects: [],
        webhooks: [new mongoose.Types.ObjectId()],
      } as unknown as databaseTypes.IUser;

      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update membership', async () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        membership: [new mongoose.Types.ObjectId()],
        invitedMembers: [],
        createdWorkspaces: [],
        projects: [],
        webhooks: [],
      } as unknown as databaseTypes.IUser;

      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update invitedMembers', async () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        membership: [],
        invitedMembers: [new mongoose.Types.ObjectId()],
        createdWorkspaces: [],
        projects: [],
        webhooks: [],
      } as unknown as databaseTypes.IUser;

      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update _id', async () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        membership: [],
        invitedMembers: [],
        createdWorkspaces: [],
        projects: [],
        webhooks: [],
        _id: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IUser;

      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update createDate', async () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        membership: [],
        invitedMembers: [],
        createdWorkspaces: [],
        projects: [],
        webhooks: [],
        createdAt: new Date(),
      } as unknown as databaseTypes.IUser;

      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update updateDate', async () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        membership: [],
        invitedMembers: [],
        createdWorkspaces: [],
        projects: [],
        webhooks: [],
        updatedAt: new Date(),
      } as unknown as databaseTypes.IUser;

      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will validate a valid customer payment', async () => {
      const paymentExistsStub = sandbox.stub();
      paymentExistsStub.resolves(true);
      sandbox.replace(CustomerPaymentModel, 'customerPaymentIdExists', paymentExistsStub);
      const inputUser = {
        customerPayment: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.ICustomerPayment,
      };

      assert.isTrue(await UserModel.validateUpdateObject(inputUser));
    });

    it('will throw a InvalidOperationError when the customer payment is not valid', async () => {
      const paymentExistsStub = sandbox.stub();
      paymentExistsStub.resolves(false);
      sandbox.replace(CustomerPaymentModel, 'customerPaymentIdExists', paymentExistsStub);
      const inputUser = {
        customerPayment: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.ICustomerPayment,
      };
      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
    it('will rethrow a Error when the underlying database connection throws an error', async () => {
      const paymentExistsStub = sandbox.stub();
      paymentExistsStub.rejects(
        new error.DatabaseOperationError('This is not good', 'mongoDb', 'validateCustomerPayment')
      );
      sandbox.replace(CustomerPaymentModel, 'customerPaymentIdExists', paymentExistsStub);
      const inputUser = {
        customerPayment: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.ICustomerPayment,
      };
      let errored = false;
      try {
        await UserModel.validateUpdateObject(inputUser);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
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

      await UserModel.deleteUserById(userId.toString());

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the user does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(UserModel, 'deleteOne', deleteStub);

      const userId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await UserModel.deleteUserById(userId.toString());
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
        await UserModel.deleteUserById(userId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

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

  context('validate projects', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the projects can be validated', async () => {
      const inputProjects = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProject,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProject,
      ];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.resolves(true);
      sandbox.replace(ProjectModel, 'allProjectIdsExist', allProjectIdsExistStub);

      const results = await UserModel.validateProjects(inputProjects);

      assert.strictEqual(results.length, inputProjects.length);
      results.forEach((r) => {
        const foundId = inputProjects.find((p) => p._id?.toString() === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the projectIds can be validated ', async () => {
      const inputProjects = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.resolves(true);
      sandbox.replace(ProjectModel, 'allProjectIdsExist', allProjectIdsExistStub);

      const results = await UserModel.validateProjects(inputProjects);

      assert.strictEqual(results.length, inputProjects.length);
      results.forEach((r) => {
        const foundId = inputProjects.find((p) => p === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputProjects = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.rejects(
        new error.DataNotFoundError('the project ids cannot be found', 'projectIds', inputProjects)
      );
      sandbox.replace(ProjectModel, 'allProjectIdsExist', allProjectIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateProjects(inputProjects);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputProjects = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const errorText = 'something bad has happened';

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.rejects(errorText);
      sandbox.replace(ProjectModel, 'allProjectIdsExist', allProjectIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateProjects(inputProjects);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validate customerPayment', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an ids when the customerPayment can be validated', async () => {
      const inputPayment = {
        _id: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.ICustomerPayment;

      const customerPaymentIdExistStub = sandbox.stub();
      customerPaymentIdExistStub.resolves(true);
      sandbox.replace(CustomerPaymentModel, 'customerPaymentIdExists', customerPaymentIdExistStub);

      const results = await UserModel.validateCustomerPayment(inputPayment.toString());

      assert.strictEqual(results.toString(), inputPayment._id?.toString());
    });

    it('should return an id when the customerPaymentId can be validated ', async () => {
      const inputPayment = new mongoose.Types.ObjectId();

      const customerPaymentIdsExistStub = sandbox.stub();
      customerPaymentIdsExistStub.resolves(true);
      sandbox.replace(CustomerPaymentModel, 'customerPaymentIdExists', customerPaymentIdsExistStub);

      const results = await UserModel.validateCustomerPayment(inputPayment.toString());

      assert.strictEqual(results.toString(), inputPayment._id?.toString());
    });

    it('should throw a Data Validation Error if the id cannot be found ', async () => {
      const inputPayment = new mongoose.Types.ObjectId();
      const customerPaymentIdExistStub = sandbox.stub();
      customerPaymentIdExistStub.resolves(false);
      sandbox.replace(CustomerPaymentModel, 'customerPaymentIdExists', customerPaymentIdExistStub);

      let errored = false;
      try {
        await UserModel.validateCustomerPayment(inputPayment.toString());
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputPayment = new mongoose.Types.ObjectId();
      const errorText = 'something bad has happened';

      const customerPaymentIdExistStub = sandbox.stub();
      customerPaymentIdExistStub.rejects(errorText);
      sandbox.replace(
        CustomerPaymentModel,
        'customerPaymentIdExists',

        customerPaymentIdExistStub
      );

      let errored = false;
      try {
        await UserModel.validateCustomerPayment(inputPayment.toString());
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validate accounts', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the accounts can be validated', async () => {
      const inputAccounts = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IAccount,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IAccount,
      ];

      const allAccountIdsExistStub = sandbox.stub();
      allAccountIdsExistStub.resolves(true);
      sandbox.replace(AccountModel, 'allAccountIdsExist', allAccountIdsExistStub);

      const results = await UserModel.validateAccounts(inputAccounts);

      assert.strictEqual(results.length, inputAccounts.length);
      results.forEach((r) => {
        const foundId = inputAccounts.find((p) => p._id?.toString() === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the acountIds can be validated ', async () => {
      const inputAccounts = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allAccountIdsExistStub = sandbox.stub();
      allAccountIdsExistStub.resolves(true);
      sandbox.replace(AccountModel, 'allAccountIdsExist', allAccountIdsExistStub);

      const results = await UserModel.validateAccounts(inputAccounts);

      assert.strictEqual(results.length, inputAccounts.length);
      results.forEach((r) => {
        const foundId = inputAccounts.find((p) => p === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputAccounts = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allAccountIdsExistStub = sandbox.stub();
      allAccountIdsExistStub.rejects(
        new error.DataNotFoundError('the account ids cannot be found', 'projectIds', inputAccounts)
      );
      sandbox.replace(AccountModel, 'allAccountIdsExist', allAccountIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateAccounts(inputAccounts);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputAccounts = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const errorText = 'something bad has happened';

      const allAccountsIdsExistStub = sandbox.stub();
      allAccountsIdsExistStub.rejects(errorText);
      sandbox.replace(AccountModel, 'allAccountIdsExist', allAccountsIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateAccounts(inputAccounts);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validate sessions', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the sessions can be validated', async () => {
      const inputSessions = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.ISession,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.ISession,
      ];

      const allSessionIdsExistStub = sandbox.stub();
      allSessionIdsExistStub.resolves(true);
      sandbox.replace(SessionModel, 'allSessionIdsExist', allSessionIdsExistStub);

      const results = await UserModel.validateSessions(inputSessions);

      assert.strictEqual(results.length, inputSessions.length);
      results.forEach((r) => {
        const foundId = inputSessions.find((p) => p._id?.toString() === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the sessionIds can be validated ', async () => {
      const inputSessions = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allSessionsIdsExistStub = sandbox.stub();
      allSessionsIdsExistStub.resolves(true);
      sandbox.replace(SessionModel, 'allSessionIdsExist', allSessionsIdsExistStub);

      const results = await UserModel.validateSessions(inputSessions);

      assert.strictEqual(results.length, inputSessions.length);
      results.forEach((r) => {
        const foundId = inputSessions.find((p) => p === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputSessions = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allSessionIdsExistStub = sandbox.stub();
      allSessionIdsExistStub.rejects(
        new error.DataNotFoundError('the session ids cannot be found', 'sessionIds', inputSessions)
      );
      sandbox.replace(SessionModel, 'allSessionIdsExist', allSessionIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateSessions(inputSessions);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputSessions = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const errorText = 'something bad has happened';

      const allSessionIdsExistStub = sandbox.stub();
      allSessionIdsExistStub.rejects(errorText);
      sandbox.replace(SessionModel, 'allSessionIdsExist', allSessionIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateSessions(inputSessions);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validate membership', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the memberships can be validated', async () => {
      const inputMembers = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IMember,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IMember,
      ];

      const allMemberIdsExistStub = sandbox.stub();
      allMemberIdsExistStub.resolves(true);
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMemberIdsExistStub);

      const results = await UserModel.validateMembership(inputMembers);

      assert.strictEqual(results.length, inputMembers.length);
      results.forEach((r) => {
        const foundId = inputMembers.find((p) => p._id?.toString() === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the MemberIds can be validated ', async () => {
      const inputMembers = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allMembersIdsExistStub = sandbox.stub();
      allMembersIdsExistStub.resolves(true);
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMembersIdsExistStub);

      const results = await UserModel.validateMembership(inputMembers);

      assert.strictEqual(results.length, inputMembers.length);
      results.forEach((r) => {
        const foundId = inputMembers.find((p) => p === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputMembers = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allMemberIdsExistStub = sandbox.stub();
      allMemberIdsExistStub.rejects(
        new error.DataNotFoundError('the Member ids cannot be found', 'MemberIds', inputMembers)
      );
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMemberIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateMembership(inputMembers);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputMembers = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const errorText = 'something bad has happened';

      const allMemberIdsExistStub = sandbox.stub();
      allMemberIdsExistStub.rejects(errorText);
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMemberIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateMembership(inputMembers);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validate webhooks', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the webhooks can be validated', async () => {
      const inputWebhooks = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWebhook,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWebhook,
      ];

      const allWebhookIdsExistStub = sandbox.stub();
      allWebhookIdsExistStub.resolves(true);
      sandbox.replace(WebhookModel, 'allWebhookIdsExist', allWebhookIdsExistStub);

      const results = await UserModel.validateWebhooks(inputWebhooks);

      assert.strictEqual(results.length, inputWebhooks.length);
      results.forEach((r) => {
        const foundId = inputWebhooks.find((p) => p._id?.toString() === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the webhookIds can be validated ', async () => {
      const inputWebhooks = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allWebhookIdsExistStub = sandbox.stub();
      allWebhookIdsExistStub.resolves(true);
      sandbox.replace(WebhookModel, 'allWebhookIdsExist', allWebhookIdsExistStub);

      const results = await UserModel.validateWebhooks(inputWebhooks);

      assert.strictEqual(results.length, inputWebhooks.length);
      results.forEach((r) => {
        const foundId = inputWebhooks.find((p) => p === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputWebhooks = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allWebhookIdsExistStub = sandbox.stub();
      allWebhookIdsExistStub.rejects(
        new error.DataNotFoundError('the webhook ids cannot be found', 'webhookIds', inputWebhooks)
      );
      sandbox.replace(WebhookModel, 'allWebhookIdsExist', allWebhookIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateWebhooks(inputWebhooks);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputWebhooks = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const errorText = 'something bad has happened';

      const allWebhookIdsExistStub = sandbox.stub();
      allWebhookIdsExistStub.rejects(errorText);
      sandbox.replace(WebhookModel, 'allWebhookIdsExist', allWebhookIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateWebhooks(inputWebhooks);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validate workspaces', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the workspaces can be validated', async () => {
      const inputWorkspaces = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
      ];

      const allWorkspaceIdsExistStub = sandbox.stub();
      allWorkspaceIdsExistStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'allWorkspaceIdsExist', allWorkspaceIdsExistStub);

      const results = await UserModel.validateWorkspaces(inputWorkspaces);

      assert.strictEqual(results.length, inputWorkspaces.length);
      results.forEach((r) => {
        const foundId = inputWorkspaces.find((p) => p._id?.toString() === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the workspaceIds can be validated ', async () => {
      const inputWorkspaces = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allWorkspaceIdsExistStub = sandbox.stub();
      allWorkspaceIdsExistStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'allWorkspaceIdsExist', allWorkspaceIdsExistStub);

      const results = await UserModel.validateWorkspaces(inputWorkspaces);

      assert.strictEqual(results.length, inputWorkspaces.length);
      results.forEach((r) => {
        const foundId = inputWorkspaces.find((p) => p === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputWorkspaces = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allWorkspaceIdsExistStub = sandbox.stub();
      allWorkspaceIdsExistStub.rejects(
        new error.DataNotFoundError('the workspace ids cannot be found', 'workspaceIds', inputWorkspaces)
      );
      sandbox.replace(WorkspaceModel, 'allWorkspaceIdsExist', allWorkspaceIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateWorkspaces(inputWorkspaces);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputWorkspaces = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const errorText = 'something bad has happened';

      const allWorkspaceIdsExistStub = sandbox.stub();
      allWorkspaceIdsExistStub.rejects(errorText);
      sandbox.replace(WorkspaceModel, 'allWorkspaceIdsExist', allWorkspaceIdsExistStub);

      let errored = false;
      try {
        await UserModel.validateWorkspaces(inputWorkspaces);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('allUserIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the user ids exist', async () => {
      const userIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedUserIds = userIds.map((userId) => {
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
      const userIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

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
      const userIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

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

    const mockUser: databaseTypes.IUser = {
      _id: new mongoose.Types.ObjectId(),
      userCode: 'testUserCode',
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'testUser',
      username: 'testUserName',
      gh_username: 'testGhUserName',
      email: 'testUser@email.com',
      emailVerified: new Date(),
      isVerified: true,
      image: 'imageString',
      accounts: [
        {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
          refresh_token: 'testRefreshToken',
        } as unknown as databaseTypes.IAccount,
      ],
      sessions: [
        {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
          sessionToken: 'testsessionToken',
        } as unknown as databaseTypes.ISession,
      ],
      membership: [
        {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
          sessionToken: 'testMembership',
        } as unknown as databaseTypes.IMember,
      ],
      invitedMembers: [
        {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
          sessionToken: 'invitedMembers',
        } as unknown as databaseTypes.IMember,
      ],
      webhooks: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'testWebhookName',
          __v: 1,
        } as unknown as databaseTypes.IWebhook,
      ],
      apiKey: 'testApiKey',
      createdWorkspaces: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'createdWorkspace',
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
      ],
      projects: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'createdProject',
          __v: 1,
        } as unknown as databaseTypes.IProject,
      ],
    } as databaseTypes.IUser;

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a user document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockUser));
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const doc = await UserModel.getUserById(mockUser._id!.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      doc.accounts.forEach((a: any) => assert.isUndefined((a as any)['__v']));
      doc.sessions.forEach((s: any) => assert.isUndefined((s as any)['__v']));
      doc.membership.forEach((m: any) => assert.isUndefined((m as any)['__v']));
      doc.invitedMembers.forEach((m: any) => assert.isUndefined((m as any)['__v']));
      doc.webhooks.forEach((w: any) => assert.isUndefined((w as any)['__v']));
      doc.createdWorkspaces.forEach((o: any) => assert.isUndefined((o as any)['__v']));
      doc.projects.forEach((p: any) => assert.isUndefined((p as any)['__v']));

      assert.strictEqual(doc.id, mockUser._id?.toString());
    });

    it('will throw a DataNotFoundError when the user does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(UserModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await UserModel.getUserById(mockUser._id!.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(UserModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await UserModel.getUserById(mockUser._id!.toString());
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addProjects', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add a project to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(UserModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addProjects(userId.toString(), [projectId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.projects[0].toString(), projectId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not save when a project is already attached to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const projectId = new mongoose.Types.ObjectId();
      localMockUser.projects.push(projectId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(UserModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addProjects(userId.toString(), [projectId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.projects[0].toString(), projectId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(UserModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addProjects(userId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when project id does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.rejects(
        new error.DataValidationError('The projects id does not exist', 'projectId', projectId)
      );
      sandbox.replace(UserModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addProjects(userId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(UserModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addProjects(userId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(UserModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addProjects(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removeProjects', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a project from the user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const projectId = new mongoose.Types.ObjectId();
      localMockUser.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeProjects(userId.toString(), [projectId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.projects.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not modify the projects if the projectid are not on the user projects', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const projectId = new mongoose.Types.ObjectId();
      localMockUser.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeProjects(userId.toString(), [new mongoose.Types.ObjectId().toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.projects.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const projectId = new mongoose.Types.ObjectId();
      localMockUser.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeProjects(userId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const projectId = new mongoose.Types.ObjectId();
      localMockUser.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeProjects(userId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const projectId = new mongoose.Types.ObjectId();
      localMockUser.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeProjects(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addAccounts', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add an account to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const accountId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateAccountsStub = sandbox.stub();
      validateAccountsStub.resolves([accountId]);
      sandbox.replace(UserModel, 'validateAccounts', validateAccountsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addAccounts(userId.toString(), [accountId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.accounts[0].toString(), accountId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateAccountsStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not save when an account is already attached to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const accountId = new mongoose.Types.ObjectId();
      localMockUser.accounts.push(accountId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateAccountsStub = sandbox.stub();
      validateAccountsStub.resolves([accountId]);
      sandbox.replace(UserModel, 'validateAccounts', validateAccountsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addAccounts(userId.toString(), [accountId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.accounts[0].toString(), accountId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateAccountsStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const accountId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateAccountsStub = sandbox.stub();
      validateAccountsStub.resolves([accountId]);
      sandbox.replace(UserModel, 'validateAccounts', validateAccountsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addAccounts(userId.toString(), [accountId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when account id does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const accountId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateAccountsStub = sandbox.stub();
      validateAccountsStub.rejects(
        new error.DataValidationError('The account id does not exist', 'accountId', accountId)
      );
      sandbox.replace(UserModel, 'validateAccounts', validateAccountsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addAccounts(userId.toString(), [accountId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const accountId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateAccountsStub = sandbox.stub();
      validateAccountsStub.resolves([accountId]);
      sandbox.replace(UserModel, 'validateAccounts', validateAccountsStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addAccounts(userId.toString(), [accountId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the Accounts array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const accountId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateAccountsStub = sandbox.stub();
      validateAccountsStub.resolves([accountId]);
      sandbox.replace(UserModel, 'validateAccounts', validateAccountsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addAccounts(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removeAccounts', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove an account from the user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const accountId = new mongoose.Types.ObjectId();
      localMockUser.accounts.push(accountId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeAccounts(userId.toString(), [accountId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.accounts.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not modify the accounts if the accountid is not on the user accounts', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const accountId = new mongoose.Types.ObjectId();
      localMockUser.accounts.push(accountId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeAccounts(userId.toString(), [new mongoose.Types.ObjectId().toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.accounts.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const accountId = new mongoose.Types.ObjectId();
      localMockUser.accounts.push(accountId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeAccounts(userId.toString(), [accountId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const accountId = new mongoose.Types.ObjectId();
      localMockUser.accounts.push(accountId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeAccounts(userId.toString(), [accountId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const accountId = new mongoose.Types.ObjectId();
      localMockUser.projects.push(accountId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeAccounts(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addSessions', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add an session to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const sessionId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateSessionsStub = sandbox.stub();
      validateSessionsStub.resolves([sessionId]);
      sandbox.replace(UserModel, 'validateSessions', validateSessionsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addSessions(userId.toString(), [sessionId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.sessions[0].toString(), sessionId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateSessionsStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not save when a session is already attached to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const sessionId = new mongoose.Types.ObjectId();
      localMockUser.sessions.push(sessionId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateSessionsStub = sandbox.stub();
      validateSessionsStub.resolves([sessionId]);
      sandbox.replace(UserModel, 'validateSessions', validateSessionsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addSessions(userId.toString(), [sessionId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.sessions[0].toString(), sessionId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateSessionsStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const sessionId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateSessionsStub = sandbox.stub();
      validateSessionsStub.resolves([sessionId]);
      sandbox.replace(UserModel, 'validateSessions', validateSessionsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addSessions(userId.toString(), [sessionId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when session id does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const sessionId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateSessionsStub = sandbox.stub();
      validateSessionsStub.rejects(
        new error.DataValidationError('The session id does not exist', 'sessionId', sessionId)
      );
      sandbox.replace(UserModel, 'validateSessions', validateSessionsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addSessions(userId.toString(), [sessionId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const sessionId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateSessionsStub = sandbox.stub();
      validateSessionsStub.resolves([sessionId]);
      sandbox.replace(UserModel, 'validateSessions', validateSessionsStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addSessions(userId.toString(), [sessionId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the Session array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const sessionId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateSessionsStub = sandbox.stub();
      validateSessionsStub.resolves([sessionId]);
      sandbox.replace(UserModel, 'validateSessions', validateSessionsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addSessions(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removeSessions', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a session from the user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const sessionId = new mongoose.Types.ObjectId();
      localMockUser.sessions.push(sessionId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeSessions(userId.toString(), [sessionId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.sessions.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not modify the sessions if the sessionId is not on the user sessions', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const sessionId = new mongoose.Types.ObjectId();
      localMockUser.sessions.push(sessionId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeSessions(userId.toString(), [new mongoose.Types.ObjectId().toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.sessions.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const sessionId = new mongoose.Types.ObjectId();
      localMockUser.sessions.push(sessionId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeSessions(userId.toString(), [sessionId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const sessionId = new mongoose.Types.ObjectId();
      localMockUser.sessions.push(sessionId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeSessions(userId.toString(), [sessionId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the sessions array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const sessionId = new mongoose.Types.ObjectId();
      localMockUser.sessions.push(sessionId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeSessions(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addWebhooks', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add a webhook to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const webhookId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateWebhooksStub = sandbox.stub();
      validateWebhooksStub.resolves([webhookId]);
      sandbox.replace(UserModel, 'validateWebhooks', validateWebhooksStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addWebhooks(userId.toString(), [webhookId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.webhooks[0].toString(), webhookId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateWebhooksStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not save when a webhook is already attached to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const webhookId = new mongoose.Types.ObjectId();
      localMockUser.webhooks.push(webhookId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateWebhooksStub = sandbox.stub();
      validateWebhooksStub.resolves([webhookId]);
      sandbox.replace(UserModel, 'validateWebhooks', validateWebhooksStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addWebhooks(userId.toString(), [webhookId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.webhooks[0].toString(), webhookId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateWebhooksStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const webhookId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateWebhooksStub = sandbox.stub();
      validateWebhooksStub.resolves([webhookId]);
      sandbox.replace(UserModel, 'validateWebhooks', validateWebhooksStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addWebhooks(userId.toString(), [webhookId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when webhook id does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const webhookId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateWebhookStub = sandbox.stub();
      validateWebhookStub.rejects(
        new error.DataValidationError('The webhook id does not exist', 'webhookId', webhookId)
      );
      sandbox.replace(UserModel, 'validateWebhooks', validateWebhookStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addWebhooks(userId.toString(), [webhookId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const webhookId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validatWebhooksStub = sandbox.stub();
      validatWebhooksStub.resolves([webhookId]);
      sandbox.replace(UserModel, 'validateWebhooks', validatWebhooksStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addWebhooks(userId.toString(), [webhookId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the Webhooks array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const webhookId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateWebhooksStub = sandbox.stub();
      validateWebhooksStub.resolves([webhookId]);
      sandbox.replace(UserModel, 'validateWebhooks', validateWebhooksStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addWebhooks(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removeWebhook', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a webhook from the user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const webhookId = new mongoose.Types.ObjectId();
      localMockUser.webhooks.push(webhookId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeWebhooks(userId.toString(), [webhookId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.webhooks.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not modify the webhooks if the webhookId is not on the user webhooks', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const webhookId = new mongoose.Types.ObjectId();
      localMockUser.webhooks.push(webhookId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeWebhooks(userId.toString(), [new mongoose.Types.ObjectId().toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.webhooks.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const webhookId = new mongoose.Types.ObjectId();
      localMockUser.webhooks.push(webhookId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeWebhooks(userId.toString(), [webhookId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const webhookId = new mongoose.Types.ObjectId();
      localMockUser.webhooks.push(webhookId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeWebhooks(userId.toString(), [webhookId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the webhooks array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const webhookId = new mongoose.Types.ObjectId();
      localMockUser.webhooks.push(webhookId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeWebhooks(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addMembership', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add a membership to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const memberId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([memberId]);
      sandbox.replace(UserModel, 'validateMembership', validateMembersStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addMembership(userId.toString(), [memberId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.membership[0].toString(), memberId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateMembersStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not save when a member is already attached to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const memberId = new mongoose.Types.ObjectId();
      localMockUser.membership.push(memberId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([memberId]);
      sandbox.replace(UserModel, 'validateMembership', validateMembersStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addMembership(userId.toString(), [memberId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.membership[0].toString(), memberId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateMembersStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const memberId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([memberId]);
      sandbox.replace(UserModel, 'validateMembership', validateMembersStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addMembership(userId.toString(), [memberId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when member id does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const memberId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.rejects(new error.DataValidationError('The webhook id does not exist', 'memberId', memberId));
      sandbox.replace(UserModel, 'validateMembership', validateMembersStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addMembership(userId.toString(), [memberId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const memberId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validatWebhooksStub = sandbox.stub();
      validatWebhooksStub.resolves([memberId]);
      sandbox.replace(UserModel, 'validateMembership', validatWebhooksStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addMembership(userId.toString(), [memberId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the Members array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const memberId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([memberId]);
      sandbox.replace(UserModel, 'validateMembership', validateMembersStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addMembership(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removeMembership', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a webhook from the user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const memberId = new mongoose.Types.ObjectId();
      localMockUser.membership.push(memberId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeMembership(userId.toString(), [memberId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.membership.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not modify the webhooks if the memberId is not on the user webhooks', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const memberId = new mongoose.Types.ObjectId();
      localMockUser.membership.push(memberId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeMembership(userId.toString(), [
        new mongoose.Types.ObjectId().toString(),
      ]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.membership.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const memberId = new mongoose.Types.ObjectId();
      localMockUser.membership.push(memberId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeMembership(userId.toString(), [memberId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const memberId = new mongoose.Types.ObjectId();
      localMockUser.membership.push(memberId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeMembership(userId.toString(), [memberId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the webhooks array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const memberId = new mongoose.Types.ObjectId();
      localMockUser.membership.push(memberId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeMembership(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addcreatedWorkspaces', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add an workspace to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const orgId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateWorkspaceStub = sandbox.stub();
      validateWorkspaceStub.resolves([orgId]);
      sandbox.replace(UserModel, 'validateWorkspaces', validateWorkspaceStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addWorkspaces(userId.toString(), [orgId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.createdWorkspaces[0].toString(), orgId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateWorkspaceStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not save when an workspace is already attached to a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const orgId = new mongoose.Types.ObjectId();
      localMockUser.createdWorkspaces.push(orgId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateWorkspacesStub = sandbox.stub();
      validateWorkspacesStub.resolves([orgId]);
      sandbox.replace(UserModel, 'validateWorkspaces', validateWorkspacesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.addWorkspaces(userId.toString(), [orgId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.createdWorkspaces[0].toString(), orgId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateWorkspacesStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const workspaceId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateWorkspaceStub = sandbox.stub();
      validateWorkspaceStub.resolves([workspaceId]);
      sandbox.replace(UserModel, 'validateWorkspaces', validateWorkspaceStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addWorkspaces(userId.toString(), [workspaceId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when workspace id does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const workspaceId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateWorkspacesStub = sandbox.stub();
      validateWorkspacesStub.rejects(
        new error.DataValidationError('The workspace id does not exist', 'workspaceId', workspaceId)
      );
      sandbox.replace(UserModel, 'validateWorkspaces', validateWorkspacesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addWorkspaces(userId.toString(), [workspaceId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const workspaceId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validatWorkspacesStub = sandbox.stub();
      validatWorkspacesStub.resolves([workspaceId]);
      sandbox.replace(UserModel, 'validateWorkspaces', validatWorkspacesStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addWorkspaces(userId.toString(), [workspaceId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the Workspaces array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const workspaceId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const validateWorkspacesStub = sandbox.stub();
      validateWorkspacesStub.resolves([workspaceId]);
      sandbox.replace(UserModel, 'validateWorkspaces', validateWorkspacesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.addWorkspaces(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removecreatedWorkspaces', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove an workspace from the user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const workspaceId = new mongoose.Types.ObjectId();
      localMockUser.createdWorkspaces.push(workspaceId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeWorkspaces(userId.toString(), [workspaceId.toString()]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.createdWorkspaces.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will not modify the createdWorkspaces if the workspaceId is not on the user createdWorkspaces', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const orgId = new mongoose.Types.ObjectId();
      localMockUser.createdWorkspaces.push(orgId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      const updatedUser = await UserModel.removeWorkspaces(userId.toString(), [
        new mongoose.Types.ObjectId().toString(),
      ]);

      assert.strictEqual(updatedUser._id, userId);
      assert.strictEqual(updatedUser.createdWorkspaces.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getUserByIdStub.calledOnce);
    });

    it('will throw a data not found error when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const orgId = new mongoose.Types.ObjectId();
      localMockUser.createdWorkspaces.push(orgId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeWorkspaces(userId.toString(), [orgId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const orgId = new mongoose.Types.ObjectId();
      localMockUser.createdWorkspaces.push(orgId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeWorkspaces(userId.toString(), [orgId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the workspaces array is empty', async () => {
      const userId = new mongoose.Types.ObjectId();
      const localMockUser = JSON.parse(JSON.stringify(MOCK_USER));
      localMockUser._id = userId;
      const orgId = new mongoose.Types.ObjectId();
      localMockUser.createdWorkspaces.push(orgId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockUser);
      localMockUser.save = saveStub;

      const getUserByIdStub = sandbox.stub();
      getUserByIdStub.resolves(localMockUser);
      sandbox.replace(UserModel, 'getUserById', getUserByIdStub);

      let errored = false;
      try {
        await UserModel.removeWorkspaces(userId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
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
        _id: new mongoose.Types.ObjectId(),
        userCode: 'testUserCode',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testUser',
        username: 'testUserName',
        gh_username: 'testGhUserName',
        email: 'testUser@email.com',
        emailVerified: new Date(),
        isVerified: true,
        image: 'imageString',
        accounts: [
          {
            _id: new mongoose.Types.ObjectId(),
            __v: 1,
            refresh_token: 'testRefreshToken',
          } as unknown as databaseTypes.IAccount,
        ],
        sessions: [
          {
            _id: new mongoose.Types.ObjectId(),
            __v: 1,
            sessionToken: 'testsessionToken',
          } as unknown as databaseTypes.ISession,
        ],
        membership: [
          {
            _id: new mongoose.Types.ObjectId(),
            __v: 1,
            sessionToken: 'testMembership',
          } as unknown as databaseTypes.IMember,
        ],
        invitedMembers: [
          {
            _id: new mongoose.Types.ObjectId(),
            __v: 1,
            sessionToken: 'invitedMembers',
          } as unknown as databaseTypes.IMember,
        ],
        webhooks: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'testWebhookName',
            __v: 1,
          } as unknown as databaseTypes.IWebhook,
        ],
        apiKey: 'testApiKey',
        createdWorkspaces: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'createdWorkspace',
            __v: 1,
          } as unknown as databaseTypes.IWorkspace,
        ],
        projects: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'createdProject',
            __v: 1,
          } as unknown as databaseTypes.IProject,
        ],
        customerPayment: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.ICustomerPayment,
      } as databaseTypes.IUser,

      {
        _id: new mongoose.Types.ObjectId(),
        userCode: 'testUserCode2',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testUser2',
        username: 'testUserName2',
        gh_username: 'testGhUserName2',
        email: 'testUser2@email.com',
        emailVerified: new Date(),
        isVerified: true,
        image: 'imageString2',
        accounts: [
          {
            _id: new mongoose.Types.ObjectId(),
            __v: 1,
            refresh_token: 'testRefreshToken2',
          } as unknown as databaseTypes.IAccount,
        ],
        sessions: [
          {
            _id: new mongoose.Types.ObjectId(),
            __v: 1,
            sessionToken: 'testsessionToken2',
          } as unknown as databaseTypes.ISession,
        ],
        membership: [
          {
            _id: new mongoose.Types.ObjectId(),
            __v: 1,
            sessionToken: 'testMembership2',
          } as unknown as databaseTypes.IMember,
        ],
        invitedMembers: [
          {
            _id: new mongoose.Types.ObjectId(),
            __v: 1,
            sessionToken: 'invitedMembers2',
          } as unknown as databaseTypes.IMember,
        ],
        webhooks: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'testWebhookName2',
            __v: 1,
          } as unknown as databaseTypes.IWebhook,
        ],
        apiKey: 'testApiKey2',
        createdWorkspaces: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'createdWorkspace2',
            __v: 1,
          } as unknown as databaseTypes.IWorkspace,
        ],
        projects: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'createdProject2',
            __v: 1,
          } as unknown as databaseTypes.IProject,
        ],
        customerPayment: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.ICustomerPayment,
      } as databaseTypes.IUser,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered users', async () => {
      sandbox.replace(UserModel, 'count', sandbox.stub().resolves(mockUsers.length));

      sandbox.replace(UserModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockUsers)));

      const results = await UserModel.queryUsers({});

      assert.strictEqual(results.numberOfItems, mockUsers.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockUsers.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any).__v);
        doc.accounts.forEach((a: any) => assert.isUndefined((a as any)['__v']));
        doc.sessions.forEach((s: any) => assert.isUndefined((s as any)['__v']));
        doc.membership.forEach((m: any) => assert.isUndefined((m as any)['__v']));
        doc.invitedMembers.forEach((m: any) => assert.isUndefined((m as any)['__v']));
        doc.webhooks.forEach((w: any) => assert.isUndefined((w as any)['__v']));
        doc.createdWorkspaces.forEach((o: any) => assert.isUndefined((o as any)['__v']));
        doc.projects.forEach((p: any) => assert.isUndefined((p as any)['__v']));
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(UserModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(UserModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockUsers)));

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
      sandbox.replace(UserModel, 'count', sandbox.stub().resolves(mockUsers.length));

      sandbox.replace(UserModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockUsers)));

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
      sandbox.replace(UserModel, 'count', sandbox.stub().resolves(mockUsers.length));

      sandbox.replace(
        UserModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
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
});
