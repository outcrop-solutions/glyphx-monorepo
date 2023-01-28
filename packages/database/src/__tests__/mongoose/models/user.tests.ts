import {assert} from 'chai';
import {UserModel} from '../../../mongoose/models/user';
import {ProjectModel} from '../../../mongoose/models/project';
import {AccountModel} from '../../../mongoose/models/account';
import {SessionModel} from '../../../mongoose/models/session';
import {WebhookModel} from '../../../mongoose/models/webhook';
import {OrganizationModel} from '../../../mongoose/models/organization';
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
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

      const results = await UserModel.validateProjects(inputProjects);

      assert.strictEqual(results.length, inputProjects.length);
      results.forEach(r => {
        const foundId = inputProjects.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the projectIds can be validated ', async () => {
      const inputProjects = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.resolves(true);
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

      const results = await UserModel.validateProjects(inputProjects);

      assert.strictEqual(results.length, inputProjects.length);
      results.forEach(r => {
        const foundId = inputProjects.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputProjects = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.rejects(
        new error.DataNotFoundError(
          'the project ids cannot be found',
          'projectIds',
          inputProjects
        )
      );
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

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
      const inputProjects = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const errorText = 'something bad has happened';

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.rejects(errorText);
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

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
      sandbox.replace(
        AccountModel,
        'allAccountIdsExist',
        allAccountIdsExistStub
      );

      const results = await UserModel.validateAccounts(inputAccounts);

      assert.strictEqual(results.length, inputAccounts.length);
      results.forEach(r => {
        const foundId = inputAccounts.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the acountIds can be validated ', async () => {
      const inputAccounts = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allAccountIdsExistStub = sandbox.stub();
      allAccountIdsExistStub.resolves(true);
      sandbox.replace(
        AccountModel,
        'allAccountIdsExist',
        allAccountIdsExistStub
      );

      const results = await UserModel.validateAccounts(inputAccounts);

      assert.strictEqual(results.length, inputAccounts.length);
      results.forEach(r => {
        const foundId = inputAccounts.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputAccounts = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allAccountIdsExistStub = sandbox.stub();
      allAccountIdsExistStub.rejects(
        new error.DataNotFoundError(
          'the account ids cannot be found',
          'projectIds',
          inputAccounts
        )
      );
      sandbox.replace(
        AccountModel,
        'allAccountIdsExist',
        allAccountIdsExistStub
      );

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
      const inputAccounts = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const errorText = 'something bad has happened';

      const allAccountsIdsExistStub = sandbox.stub();
      allAccountsIdsExistStub.rejects(errorText);
      sandbox.replace(
        AccountModel,
        'allAccountIdsExist',
        allAccountsIdsExistStub
      );

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
      sandbox.replace(
        SessionModel,
        'allSessionIdsExist',
        allSessionIdsExistStub
      );

      const results = await UserModel.validateSessions(inputSessions);

      assert.strictEqual(results.length, inputSessions.length);
      results.forEach(r => {
        const foundId = inputSessions.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the sessionIds can be validated ', async () => {
      const inputSessions = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allSessionsIdsExistStub = sandbox.stub();
      allSessionsIdsExistStub.resolves(true);
      sandbox.replace(
        SessionModel,
        'allSessionIdsExist',
        allSessionsIdsExistStub
      );

      const results = await UserModel.validateSessions(inputSessions);

      assert.strictEqual(results.length, inputSessions.length);
      results.forEach(r => {
        const foundId = inputSessions.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputSessions = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allSessionIdsExistStub = sandbox.stub();
      allSessionIdsExistStub.rejects(
        new error.DataNotFoundError(
          'the session ids cannot be found',
          'sessionIds',
          inputSessions
        )
      );
      sandbox.replace(
        SessionModel,
        'allSessionIdsExist',
        allSessionIdsExistStub
      );

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
      const inputSessions = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const errorText = 'something bad has happened';

      const allSessionIdsExistStub = sandbox.stub();
      allSessionIdsExistStub.rejects(errorText);
      sandbox.replace(
        SessionModel,
        'allSessionIdsExist',
        allSessionIdsExistStub
      );

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
      sandbox.replace(
        WebhookModel,
        'allWebhookIdsExist',
        allWebhookIdsExistStub
      );

      const results = await UserModel.validateWebhooks(inputWebhooks);

      assert.strictEqual(results.length, inputWebhooks.length);
      results.forEach(r => {
        const foundId = inputWebhooks.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the webhookIds can be validated ', async () => {
      const inputWebhooks = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allWebhookIdsExistStub = sandbox.stub();
      allWebhookIdsExistStub.resolves(true);
      sandbox.replace(
        WebhookModel,
        'allWebhookIdsExist',
        allWebhookIdsExistStub
      );

      const results = await UserModel.validateWebhooks(inputWebhooks);

      assert.strictEqual(results.length, inputWebhooks.length);
      results.forEach(r => {
        const foundId = inputWebhooks.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputWebhooks = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allWebhookIdsExistStub = sandbox.stub();
      allWebhookIdsExistStub.rejects(
        new error.DataNotFoundError(
          'the webhook ids cannot be found',
          'webhookIds',
          inputWebhooks
        )
      );
      sandbox.replace(
        WebhookModel,
        'allWebhookIdsExist',
        allWebhookIdsExistStub
      );

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
      const inputWebhooks = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const errorText = 'something bad has happened';

      const allWebhookIdsExistStub = sandbox.stub();
      allWebhookIdsExistStub.rejects(errorText);
      sandbox.replace(
        WebhookModel,
        'allWebhookIdsExist',
        allWebhookIdsExistStub
      );

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

  context('validate organizations', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the organizations can be validated', async () => {
      const inputOrganizations = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IOrganization,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IOrganization,
      ];

      const allOrganizationIdsExistStub = sandbox.stub();
      allOrganizationIdsExistStub.resolves(true);
      sandbox.replace(
        OrganizationModel,
        'allOrganizationIdsExist',
        allOrganizationIdsExistStub
      );

      const results = await UserModel.validateOrganizations(inputOrganizations);

      assert.strictEqual(results.length, inputOrganizations.length);
      results.forEach(r => {
        const foundId = inputOrganizations.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the organizationIds can be validated ', async () => {
      const inputOrganizations = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allOrganizationIdsExistStub = sandbox.stub();
      allOrganizationIdsExistStub.resolves(true);
      sandbox.replace(
        OrganizationModel,
        'allOrganizationIdsExist',
        allOrganizationIdsExistStub
      );

      const results = await UserModel.validateOrganizations(inputOrganizations);

      assert.strictEqual(results.length, inputOrganizations.length);
      results.forEach(r => {
        const foundId = inputOrganizations.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputOrganizations = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allOrganizationIdsExistStub = sandbox.stub();
      allOrganizationIdsExistStub.rejects(
        new error.DataNotFoundError(
          'the organization ids cannot be found',
          'organizationIds',
          inputOrganizations
        )
      );
      sandbox.replace(
        OrganizationModel,
        'allOrganizationIdsExist',
        allOrganizationIdsExistStub
      );

      let errored = false;
      try {
        await UserModel.validateOrganizations(inputOrganizations);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputOrganizations = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const errorText = 'something bad has happened';

      const allOrganizationIdsExistStub = sandbox.stub();
      allOrganizationIdsExistStub.rejects(errorText);
      sandbox.replace(
        OrganizationModel,
        'allOrganizationIdsExist',
        allOrganizationIdsExistStub
      );

      let errored = false;
      try {
        await UserModel.validateOrganizations(inputOrganizations);
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

  context.only('getUserById', () => {
    class mockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError: boolean = false) {
        this.mockData = input;
        this.throwError = throwError;
      }
      populate(input: string) {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const mockUser: databaseTypes.IUser = {
      _id: new mongoose.Types.ObjectId(),
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
      webhooks: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'testWebhookName',
          __v: 1,
        } as unknown as databaseTypes.IWebhook,
      ],
      organization: {
        _id: new mongoose.Types.ObjectId(),
        name: 'testOrganization',
        __v: 1,
      } as unknown as databaseTypes.IOrganization,
      apiKey: 'testApiKey',
      role: databaseTypes.constants.ROLE.USER,
      ownedOrgs: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'ownedOrganization',
          __v: 1,
        } as unknown as databaseTypes.IOrganization,
      ],
      projects: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'ownedOrganization',
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
      findByIdStub.returns(new mockMongooseQuery(mockUser));
      sandbox.replace(UserModel, 'findById', findByIdStub);

      const doc = await UserModel.getUserById(
        mockUser._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.organization as any).__v);
      doc.accounts.forEach(a => assert.isUndefined((a as any)['__v']));
      doc.sessions.forEach(s => assert.isUndefined((s as any)['__v']));
      doc.webhooks.forEach(w => assert.isUndefined((w as any)['__v']));
      doc.ownedOrgs.forEach(o => assert.isUndefined((o as any)['__v']));
      doc.projects.forEach(p => assert.isUndefined((p as any)['__v']));

      assert.strictEqual(doc._id, mockUser._id);
    });

    it('will throw a DataNotFoundError when the user does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new mockMongooseQuery(null));
      sandbox.replace(UserModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await UserModel.getUserById(mockUser._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(
        new mockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(UserModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await UserModel.getUserById(mockUser._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});
