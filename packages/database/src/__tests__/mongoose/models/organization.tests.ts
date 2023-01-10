import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';
import {OrganizationModel} from '../../../mongoose/models/organization';
import {assert} from 'chai';
import {UserModel} from '../../../mongoose/models/user';

const mockOrganization: databaseTypes.IOrganization = {
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'Test Organization',
  description: 'a test organization',
  owner: {_id: new mongoose.Types.ObjectId()} as unknown as databaseTypes.IUser,
  members: [],
  projects: [],
};

describe('#mongoose/models/organization', () => {
  context('organizationIdExists', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the organizationId exists', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: organizationId});
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const result = await OrganizationModel.organizationIdExists(
        organizationId
      );

      assert.isTrue(result);
    });

    it('should return false if the organizationId does not exist', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const result = await OrganizationModel.organizationIdExists(
        organizationId
      );

      assert.isFalse(result);
    });
    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const userId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await OrganizationModel.organizationIdExists(userId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('createOrganization', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create an organization document', async () => {
      sandbox.replace(
        OrganizationModel,
        'validateProjects',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        OrganizationModel,
        'validateMembers',
        sandbox.stub().resolves([])
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        OrganizationModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      sandbox.replace(
        OrganizationModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(OrganizationModel, 'getOrganizationById', stub);
      const organizationDocument = await OrganizationModel.createOrganization(
        mockOrganization
      );

      assert.strictEqual(organizationDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });
    it('will rethrow a DataValidationError when a validator throws one', async () => {
      sandbox.replace(
        OrganizationModel,
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
        OrganizationModel,
        'validateMembers',
        sandbox.stub().resolves([])
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        OrganizationModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        OrganizationModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(OrganizationModel, 'getOrganizationById', stub);
      let hasError = false;
      try {
        await OrganizationModel.createOrganization(mockOrganization);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        OrganizationModel,
        'validateProjects',
        sandbox.stub().resolves()
      );
      sandbox.replace(
        OrganizationModel,
        'validateMembers',
        sandbox.stub().resolves([])
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        OrganizationModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        OrganizationModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(OrganizationModel, 'getOrganizationById', stub);
      let hasError = false;
      try {
        await OrganizationModel.createOrganization(mockOrganization);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        OrganizationModel,
        'validateProjects',
        sandbox.stub().resolves()
      );
      sandbox.replace(
        OrganizationModel,
        'validateMembers',
        sandbox.stub().resolves([])
      );
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        OrganizationModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        OrganizationModel,
        'create',
        sandbox.stub().resolves([{}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(OrganizationModel, 'getOrganizationById', stub);
      let hasError = false;
      try {
        await OrganizationModel.createOrganization(mockOrganization);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        OrganizationModel,
        'validateProjects',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        OrganizationModel,
        'validateMembers',
        sandbox.stub().resolves([])
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        OrganizationModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        OrganizationModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(OrganizationModel, 'getOrganizationById', stub);
      let hasError = false;
      try {
        await OrganizationModel.createOrganization(mockOrganization);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('updateOrganizationById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update an existing organization', async () => {
      const updateOrganization = {
        name: 'Camp Crystal Lake',
        description: 'Re-Opening Summer 1980',
      };

      const organizationId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(OrganizationModel, 'updateOne', updateStub);

      const getOrganizationStub = sandbox.stub();
      getOrganizationStub.resolves({_id: organizationId});
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationStub
      );

      const validateUpdateObjectStub = sandbox.stub();
      validateUpdateObjectStub.resolves(true);
      sandbox.replace(
        OrganizationModel,
        'validateUpdateObject',
        validateUpdateObjectStub
      );

      const result = await OrganizationModel.updateOrganizationById(
        organizationId,
        updateOrganization
      );

      assert.strictEqual(result._id, organizationId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getOrganizationStub.calledOnce);
      assert.isTrue(validateUpdateObjectStub.calledOnce);
    });

    it('Should update an existing organization changing the owner', async () => {
      const ownerId = new mongoose.Types.ObjectId();
      const updateOrganization = {
        name: 'Camp Crystal Lake',
        description: 'Re-Opening Summer 1980',
        owner: {_id: ownerId} as unknown as databaseTypes.IUser,
      };

      const organizationId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(OrganizationModel, 'updateOne', updateStub);

      const getOrganizationStub = sandbox.stub();
      getOrganizationStub.resolves({_id: organizationId});
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationStub
      );

      const validateUpdateObjectStub = sandbox.stub();
      validateUpdateObjectStub.resolves(true);
      sandbox.replace(
        OrganizationModel,
        'validateUpdateObject',
        validateUpdateObjectStub
      );

      const result = await OrganizationModel.updateOrganizationById(
        organizationId,
        updateOrganization
      );

      assert.strictEqual(result._id, organizationId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getOrganizationStub.calledOnce);
      assert.isTrue(validateUpdateObjectStub.calledOnce);

      const updateArg = updateStub.args[0];
      assert.isAtLeast(updateArg.length, 2);
      const updateDocument = updateArg[1];
      assert.strictEqual(updateDocument.owner, ownerId);
    });

    it('Will fail when the organization does not exist', async () => {
      const updateOrganization = {
        name: 'Camp Crystal Lake',
        description: 'Re-Opening Summer 1980',
      };

      const organizationId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(OrganizationModel, 'updateOne', updateStub);

      const getOrganizationStub = sandbox.stub();
      getOrganizationStub.resolves({_id: organizationId});
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationStub
      );
      const validateUpdateObjectStub = sandbox.stub();
      validateUpdateObjectStub.resolves(true);
      sandbox.replace(
        OrganizationModel,
        'validateUpdateObject',
        validateUpdateObjectStub
      );

      let errorred = false;
      try {
        await OrganizationModel.updateOrganizationById(
          organizationId,
          updateOrganization
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateOrganization = {
        name: 'Camp Crystal Lake',
        description: 'Re-Opening Summer 1980',
      };

      const organizationId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(OrganizationModel, 'updateOne', updateStub);

      const getOrganizationStub = sandbox.stub();
      getOrganizationStub.resolves({_id: organizationId});
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationStub
      );

      const validateUpdateObjectStub = sandbox.stub();
      validateUpdateObjectStub.rejects(
        new error.InvalidOperationError('You cant do this', {})
      );
      sandbox.replace(
        OrganizationModel,
        'validateUpdateObject',
        validateUpdateObjectStub
      );

      let errorred = false;
      try {
        await OrganizationModel.updateOrganizationById(
          organizationId,
          updateOrganization
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateOrganization = {
        name: 'Camp Crystal Lake',
        description: 'Re-Opening Summer 1980',
      };

      const organizationId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(OrganizationModel, 'updateOne', updateStub);

      const getOrganizationStub = sandbox.stub();
      getOrganizationStub.resolves({_id: organizationId});
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationStub
      );
      const validateUpdateObjectStub = sandbox.stub();
      validateUpdateObjectStub.resolves(true);
      sandbox.replace(
        OrganizationModel,
        'validateUpdateObject',
        validateUpdateObjectStub
      );

      let errorred = false;
      try {
        await OrganizationModel.updateOrganizationById(
          organizationId,
          updateOrganization
        );
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
      const inputOrganization = {
        projects: [],
        members: [],
      };

      assert.isTrue(
        await OrganizationModel.validateUpdateObject(inputOrganization)
      );
    });

    it('will fail when trying to update projects', async () => {
      const inputOrganization = {
        projects: [new mongoose.Types.ObjectId()],
        members: [],
      } as unknown as databaseTypes.IOrganization;

      let errored = false;
      try {
        await OrganizationModel.validateUpdateObject(inputOrganization);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update members', async () => {
      const inputOrganization = {
        projects: [],
        members: [new mongoose.Types.ObjectId()],
      } as unknown as databaseTypes.IOrganization;

      let errored = false;
      try {
        await OrganizationModel.validateUpdateObject(inputOrganization);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update _id', async () => {
      const inputOrganization = {
        projects: [],
        members: [],
        _id: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IOrganization;

      let errored = false;
      try {
        await OrganizationModel.validateUpdateObject(inputOrganization);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update createdAt', async () => {
      const inputOrganization = {
        projects: [],
        members: [],
        createdAt: new Date(),
      } as unknown as databaseTypes.IOrganization;

      let errored = false;
      try {
        await OrganizationModel.validateUpdateObject(inputOrganization);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update updatedAt', async () => {
      const inputOrganization = {
        projects: [],
        members: [],
        updatedAt: new Date(),
      } as unknown as databaseTypes.IOrganization;

      let errored = false;
      try {
        await OrganizationModel.validateUpdateObject(inputOrganization);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update an owner that does not exist', async () => {
      const ownerId = new mongoose.Types.ObjectId();

      const inputOrganization = {
        projects: [],
        members: [],
        owner: {_id: ownerId} as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IOrganization;

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      let errored = false;
      try {
        await OrganizationModel.validateUpdateObject(inputOrganization);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(userIdExistsStub.calledOnce);
    });

    it('will not fail when trying to update an owner that does exist', async () => {
      const ownerId = new mongoose.Types.ObjectId();

      const inputOrganization = {
        projects: [],
        members: [],
        owner: {_id: ownerId} as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IOrganization;

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      await OrganizationModel.validateUpdateObject(inputOrganization);
      assert.isTrue(userIdExistsStub.calledOnce);
    });
  });

  context('Delete an organization document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove an organization', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(OrganizationModel, 'deleteOne', deleteStub);

      const organizationId = new mongoose.Types.ObjectId();

      await OrganizationModel.deleteOrganizationById(organizationId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the organization does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(OrganizationModel, 'deleteOne', deleteStub);

      const organizationId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await OrganizationModel.deleteOrganizationById(organizationId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(OrganizationModel, 'deleteOne', deleteStub);

      const organizationId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await OrganizationModel.deleteOrganizationById(organizationId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});
