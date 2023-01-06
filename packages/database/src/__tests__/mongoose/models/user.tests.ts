import {assert} from 'chai';
import {UserModel} from '../../..//mongoose/models/user';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const mockUser: databaseTypes.IUser = {
  name: 'testUser',
  username: 'test@user.com',
  email: 'test@user.com',
  emailVerified: new Date(),
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [],
  sessions: [],
  webhooks: [],
  organization: new mongoose.Types.ObjectId(),
  role: databaseTypes.constants.ROLE.USER,
  ownedOrgs: [],
  projects: [],
};

describe('#mongoose/models/user', () => {
  context('createUser', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('will create a user document', async () => {
      sandbox.replace(
        UserModel,
        'validateProjects',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateOrganizations',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateWebhooks',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateSessions',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateAccounts',
        sandbox.stub().resolves([])
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
      const userDocument = await UserModel.createUser(mockUser);

      assert.strictEqual(userDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });
    it('will rethrow a DataValidationError when a validator throws one', async () => {
      sandbox.replace(
        UserModel,
        'validateProjects',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'Could not validate the projects',
              'projects',
              []
            )
          )
      );
      sandbox.replace(
        UserModel,
        'validateOrganizations',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateWebhooks',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateSessions',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateAccounts',
        sandbox.stub().resolves([])
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'validate', sandbox.stub().resolves(true));
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
        await UserModel.createUser(mockUser);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(UserModel, 'validateProjects', sandbox.stub().resolves());
      sandbox.replace(
        UserModel,
        'validateOrganizations',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateWebhooks',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateSessions',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateAccounts',
        sandbox.stub().resolves([])
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
        await UserModel.createUser(mockUser);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(UserModel, 'validateProjects', sandbox.stub().resolves());
      sandbox.replace(
        UserModel,
        'validateOrganizations',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateWebhooks',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateSessions',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateAccounts',
        sandbox.stub().resolves([])
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(UserModel, 'create', sandbox.stub().resolves([{}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserModel, 'getUserById', stub);
      let hasError = false;
      try {
        await UserModel.createUser(mockUser);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        UserModel,
        'validateProjects',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateOrganizations',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateWebhooks',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateSessions',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        UserModel,
        'validateAccounts',
        sandbox.stub().resolves([])
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
        await UserModel.createUser(mockUser);
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

      const result = await UserModel.updateUserById(userId, updateUser);

      assert.strictEqual(result._id, userId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
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
        await UserModel.updateUserById(userId, updateUser);
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
        sandbox
          .stub()
          .throws(new error.InvalidOperationError("You can't do this", {}))
      );
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
        await UserModel.updateUserById(userId, updateUser);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('validateUpdateObject', () => {
    it('will return true when no restricted fields are present', () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        ownedOrgs: [],
        projects: [],
        webhooks: [],
      };

      assert.isTrue(UserModel.validateUpdateObject(inputUser));
    });

    it('will fail when trying to update accounts', () => {
      const inputUser = {
        accounts: [new mongoose.Types.ObjectId()],
        sessions: [],
        ownedOrgs: [],
        projects: [],
        webhooks: [],
      } as unknown as databaseTypes.IUser;

      assert.throws(() => {
        UserModel.validateUpdateObject(inputUser);
      }, error.InvalidOperationError);
    });
    it('will fail when trying to update sessions', () => {
      const inputUser = {
        accounts: [],
        sessions: [new mongoose.Types.ObjectId()],
        ownedOrgs: [],
        projects: [],
        webhooks: [],
      } as unknown as databaseTypes.IUser;

      assert.throws(() => {
        UserModel.validateUpdateObject(inputUser);
      }, error.InvalidOperationError);
    });
    it('will fail when trying to update ownedOrgs', () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        ownedOrgs: [new mongoose.Types.ObjectId()],
        projects: [],
        webhooks: [],
      } as unknown as databaseTypes.IUser;

      assert.throws(() => {
        UserModel.validateUpdateObject(inputUser);
      }, error.InvalidOperationError);
    });
    it('will fail when trying to update projects', () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        ownedOrgs: [],
        projects: [new mongoose.Types.ObjectId()],
        webhooks: [],
      } as unknown as databaseTypes.IUser;

      assert.throws(() => {
        UserModel.validateUpdateObject(inputUser);
      }, error.InvalidOperationError);
    });
    it('will fail when trying to update webhooks', () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        ownedOrgs: [],
        projects: [],
        webhooks: [new mongoose.Types.ObjectId()],
      } as unknown as databaseTypes.IUser;

      assert.throws(() => {
        UserModel.validateUpdateObject(inputUser);
      }, error.InvalidOperationError);
    });
    it('will fail when trying to update _id', () => {
      const inputUser = {
        accounts: [],
        sessions: [],
        ownedOrgs: [],
        projects: [],
        webhooks: [],
        _id: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IUser;

      assert.throws(() => {
        UserModel.validateUpdateObject(inputUser);
      }, error.InvalidOperationError);
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
});
