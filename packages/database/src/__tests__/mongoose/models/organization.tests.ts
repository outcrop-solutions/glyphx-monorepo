import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';
import {OrganizationModel} from '../../../mongoose/models/organization';
import {assert} from 'chai';
import {UserModel} from '../../../mongoose/models/user';
import {ProjectModel} from '../../../mongoose/models/project';

const MOCK_ORGANIZATION: databaseTypes.IOrganization = {
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
        MOCK_ORGANIZATION
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
        await OrganizationModel.createOrganization(MOCK_ORGANIZATION);
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
        await OrganizationModel.createOrganization(MOCK_ORGANIZATION);
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
        await OrganizationModel.createOrganization(MOCK_ORGANIZATION);
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
        await OrganizationModel.createOrganization(MOCK_ORGANIZATION);
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

  context('allOrganization1IdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the organization ids exist', async () => {
      const organizationIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedOrganizationIds = organizationIds.map(organizationId => {
        return {
          _id: organizationId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedOrganizationIds);
      sandbox.replace(OrganizationModel, 'find', findStub);

      assert.isTrue(
        await OrganizationModel.allOrganizationIdsExist(organizationIds)
      );
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const organizationIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedOrganizationIds = [
        {
          _id: organizationIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedOrganizationIds);
      sandbox.replace(OrganizationModel, 'find', findStub);
      let errored = false;
      try {
        await OrganizationModel.allOrganizationIdsExist(organizationIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          organizationIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const organizationIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(OrganizationModel, 'find', findStub);
      let errored = false;
      try {
        await OrganizationModel.allOrganizationIdsExist(organizationIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('validate members', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the members can be validated', async () => {
      const inputMembers = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      ];

      const allUserIdsExistStub = sandbox.stub();
      allUserIdsExistStub.resolves(true);
      sandbox.replace(UserModel, 'allUserIdsExist', allUserIdsExistStub);

      const results = await OrganizationModel.validateMembers(inputMembers);

      assert.strictEqual(results.length, inputMembers.length);
      results.forEach(r => {
        const foundId = inputMembers.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the memberIds can be validated ', async () => {
      const inputMembers = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allUserIdsExistStub = sandbox.stub();
      allUserIdsExistStub.resolves(true);
      sandbox.replace(UserModel, 'allUserIdsExist', allUserIdsExistStub);

      const results = await OrganizationModel.validateMembers(inputMembers);

      assert.strictEqual(results.length, inputMembers.length);
      results.forEach(r => {
        const foundId = inputMembers.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputMembers = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allUserIdsExistStub = sandbox.stub();
      allUserIdsExistStub.rejects(
        new error.DataNotFoundError(
          'the user ids cannot be found',
          'userIds',
          inputMembers
        )
      );
      sandbox.replace(UserModel, 'allUserIdsExist', allUserIdsExistStub);

      let errored = false;
      try {
        await OrganizationModel.validateMembers(inputMembers);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputMembers = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const errorText = 'something bad has happened';

      const allUserIdsExistStub = sandbox.stub();
      allUserIdsExistStub.rejects(errorText);
      sandbox.replace(UserModel, 'allUserIdsExist', allUserIdsExistStub);

      let errored = false;
      try {
        await OrganizationModel.validateMembers(inputMembers);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
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

      const results = await OrganizationModel.validateProjects(inputProjects);

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

      const results = await OrganizationModel.validateProjects(inputProjects);

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
        await OrganizationModel.validateProjects(inputProjects);
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
        await OrganizationModel.validateProjects(inputProjects);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('getOrganizationById', () => {
    const mockOrganization = {
      _id: new mongoose.Types.ObjectId(),
      name: 'testOrganization',
      description: 'This is a test organization',
      members: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test member1',
          __v: 1,
        } as unknown as databaseTypes.IUser,
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test member2',
          __v: 1,
        } as unknown as databaseTypes.IUser,
      ],
      projects: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test project1',
          __v: 1,
        } as unknown as databaseTypes.IProject,
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test project2',
          __v: 1,
        } as unknown as databaseTypes.IProject,
      ],
      __v: 1,
      owner: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test user',
        __v: 1,
      } as unknown as databaseTypes.IUser,
    };
    const sandbox = createSandbox();
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

    afterEach(() => {
      sandbox.restore();
    });

    it('will get an organization', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockOrganization));
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const doc = await OrganizationModel.getOrganizationById(
        mockOrganization._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.owner as any).__v);
      doc.members.forEach(m => {
        assert.isUndefined((m as any).__v);
      });

      doc.projects.forEach(p => {
        assert.isUndefined((p as any).__v);
      });

      assert.strictEqual(doc._id, mockOrganization._id);
    });

    it('will throw a DataNotFoundError when the organization does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await OrganizationModel.getOrganizationById(
          mockOrganization._id as mongoose.Types.ObjectId
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
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await OrganizationModel.getOrganizationById(
          mockOrganization._id as mongoose.Types.ObjectId
        );
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

    it('will add a project to an organization', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrg = JSON.parse(JSON.stringify(MOCK_ORGANIZATION));
      localMockOrg._id = orgId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrg);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        OrganizationModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrg);
      localMockOrg.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrg);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      const updatedOrganization = await OrganizationModel.addProjects(orgId, [
        projectId,
      ]);

      assert.strictEqual(updatedOrganization._id, orgId);
      assert.strictEqual(
        updatedOrganization.projects[0].toString(),
        projectId.toString()
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getOrganizationByIdStub.calledOnce);
    });

    it('will not save when a project is already attached to an organization', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrg = JSON.parse(JSON.stringify(MOCK_ORGANIZATION));
      localMockOrg._id = orgId;
      const projectId = new mongoose.Types.ObjectId();
      localMockOrg.projects.push(projectId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrg);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        OrganizationModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrg);
      localMockOrg.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrg);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      const updatedOrganization = await OrganizationModel.addProjects(orgId, [
        projectId,
      ]);

      assert.strictEqual(updatedOrganization._id, orgId);
      assert.strictEqual(
        updatedOrganization.projects[0].toString(),
        projectId.toString()
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getOrganizationByIdStub.calledOnce);
    });

    it('will throw a data not found error when the organization does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = orgId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        OrganizationModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrgByIdStub = sandbox.stub();
      getOrgByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'getOrganizationById', getOrgByIdStub);

      let errored = false;
      try {
        await OrganizationModel.addProjects(orgId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when project id does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = orgId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.rejects(
        new error.DataValidationError(
          'The projects id does not exist',
          'projectId',
          projectId
        )
      );
      sandbox.replace(
        OrganizationModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.addProjects(orgId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = organizationId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        OrganizationModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.addProjects(organizationId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = organizationId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        OrganizationModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.addProjects(organizationId, []);
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

    it('will remove a project from the organization', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = organizationId;
      const projectId = new mongoose.Types.ObjectId();
      localMockOrganization.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      const updatedOrganization = await OrganizationModel.removeProjects(
        organizationId,
        [projectId]
      );

      assert.strictEqual(updatedOrganization._id, organizationId);
      assert.strictEqual(updatedOrganization.projects.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getOrganizationByIdStub.calledOnce);
    });

    it('will remove a project from the organization passing in an IProject', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = organizationId;
      const projectId = new mongoose.Types.ObjectId();
      localMockOrganization.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      const updatedOrganization = await OrganizationModel.removeProjects(
        organizationId,
        [{_id: projectId} as unknown as databaseTypes.IProject]
      );

      assert.strictEqual(updatedOrganization._id, organizationId);
      assert.strictEqual(updatedOrganization.projects.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getOrganizationByIdStub.calledOnce);
    });
    it('will not modify the projects if the projectid are not on the organizations projects', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = orgId;
      const projectId = new mongoose.Types.ObjectId();
      localMockOrganization.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      const updatedOrganization = await OrganizationModel.removeProjects(
        orgId,
        [new mongoose.Types.ObjectId()]
      );

      assert.strictEqual(updatedOrganization._id, orgId);
      assert.strictEqual(updatedOrganization.projects.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getOrganizationByIdStub.calledOnce);
    });

    it('will throw a data not found error when the organization does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = orgId;
      const projectId = new mongoose.Types.ObjectId();
      localMockOrganization.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.removeProjects(orgId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = organizationId;
      const projectId = new mongoose.Types.ObjectId();
      localMockOrganization.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.removeProjects(organizationId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = orgId;
      const projectId = new mongoose.Types.ObjectId();
      localMockOrganization.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.removeProjects(orgId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addmembers', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add a member to an organization', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrg = JSON.parse(JSON.stringify(MOCK_ORGANIZATION));
      localMockOrg._id = orgId;
      const userId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrg);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([userId]);
      sandbox.replace(
        OrganizationModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrg);
      localMockOrg.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrg);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      const updatedOrganization = await OrganizationModel.addMembers(orgId, [
        userId,
      ]);

      assert.strictEqual(updatedOrganization._id, orgId);
      assert.strictEqual(
        updatedOrganization.members[0].toString(),
        userId.toString()
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateMembersStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getOrganizationByIdStub.calledOnce);
    });

    it('will not save when a member is already attached to an organization', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrg = JSON.parse(JSON.stringify(MOCK_ORGANIZATION));
      localMockOrg._id = orgId;
      const userId = new mongoose.Types.ObjectId();
      localMockOrg.members.push(userId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrg);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([userId]);
      sandbox.replace(
        OrganizationModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrg);
      localMockOrg.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrg);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      const updatedOrganization = await OrganizationModel.addMembers(orgId, [
        userId,
      ]);

      assert.strictEqual(updatedOrganization._id, orgId);
      assert.strictEqual(
        updatedOrganization.members[0].toString(),
        userId.toString()
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateMembersStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getOrganizationByIdStub.calledOnce);
    });

    it('will throw a data not found error when the organization does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = orgId;
      const userId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([userId]);
      sandbox.replace(
        OrganizationModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrgByIdStub = sandbox.stub();
      getOrgByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'getOrganizationById', getOrgByIdStub);

      let errored = false;
      try {
        await OrganizationModel.addMembers(orgId, [userId]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when user id does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = orgId;
      const userId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.rejects(
        new error.DataValidationError(
          'The user id does not exist',
          'userId',
          userId
        )
      );
      sandbox.replace(
        OrganizationModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.addMembers(orgId, [userId]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = organizationId;
      const userId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([userId]);
      sandbox.replace(
        OrganizationModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.addMembers(organizationId, [userId]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the members array is empty', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = organizationId;
      const userId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([userId]);
      sandbox.replace(
        OrganizationModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.addMembers(organizationId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removeMembers', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a member from the organization', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = organizationId;
      const userId = new mongoose.Types.ObjectId();
      localMockOrganization.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      const updatedOrganization = await OrganizationModel.removeMembers(
        organizationId,
        [userId]
      );

      assert.strictEqual(updatedOrganization._id, organizationId);
      assert.strictEqual(updatedOrganization.members.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getOrganizationByIdStub.calledOnce);
    });

    it('will remove a member from the organization passing in an IUser', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = organizationId;
      const userId = new mongoose.Types.ObjectId();
      localMockOrganization.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      const updatedOrganization = await OrganizationModel.removeMembers(
        organizationId,
        [{_id: userId} as unknown as databaseTypes.IUser]
      );

      assert.strictEqual(updatedOrganization._id, organizationId);
      assert.strictEqual(updatedOrganization.members.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getOrganizationByIdStub.calledOnce);
    });
    it('will not modify the membersif the userIds are not on the organizations members', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = orgId;
      const userId = new mongoose.Types.ObjectId();
      localMockOrganization.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      const updatedOrganization = await OrganizationModel.removeMembers(orgId, [
        new mongoose.Types.ObjectId(),
      ]);

      assert.strictEqual(updatedOrganization._id, orgId);
      assert.strictEqual(updatedOrganization.members.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getOrganizationByIdStub.calledOnce);
    });

    it('will throw a data not found error when the organization does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = orgId;
      const userId = new mongoose.Types.ObjectId();
      localMockOrganization.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.removeMembers(orgId, [userId]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const organizationId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = organizationId;
      const userId = new mongoose.Types.ObjectId();
      localMockOrganization.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrganization);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.removeMembers(organizationId, [userId]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the members array is empty', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrganization = JSON.parse(
        JSON.stringify(MOCK_ORGANIZATION)
      );
      localMockOrganization._id = orgId;
      const userId = new mongoose.Types.ObjectId();
      localMockOrganization.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(OrganizationModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrganization);
      localMockOrganization.save = saveStub;

      const getOrganizationByIdStub = sandbox.stub();
      getOrganizationByIdStub.resolves(localMockOrganization);
      sandbox.replace(
        OrganizationModel,
        'getOrganizationById',
        getOrganizationByIdStub
      );

      let errored = false;
      try {
        await OrganizationModel.removeMembers(orgId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});
