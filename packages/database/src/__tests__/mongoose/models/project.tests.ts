import {assert} from 'chai';
import {ProjectModel} from '../../..//mongoose/models/project';
import {OrganizationModel} from '../../../mongoose/models/organization';
import {UserModel} from '../../../mongoose/models/user';

import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const mockProject: databaseTypes.IProject = {
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'test project',
  description: 'this is a test description',
  sdtPath: 'sdtPath',
  organization: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IOrganization,
  slug: 'what is a slug anyway',
  isTemplate: false,
  type: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IProjectType,
  owner: {_id: new mongoose.Types.ObjectId()} as unknown as databaseTypes.IUser,
  state: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IState,
  files: [],
};

describe('#mongoose/models/project', () => {
  context('projectIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the projectId exists', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: projectId});
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      const result = await ProjectModel.projectIdExists(projectId);

      assert.isTrue(result);
    });

    it('should return false if the projectId does not exist', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      const result = await ProjectModel.projectIdExists(projectId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const userId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await ProjectModel.projectIdExists(userId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('createProject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a project document', async () => {
      sandbox.replace(
        ProjectModel,
        'validateType',
        sandbox.stub().resolves(mockProject.type._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOrganization',
        sandbox.stub().resolves(mockProject.organization._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOwner',
        sandbox.stub().resolves(mockProject.owner._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateState',
        sandbox
          .stub()
          .resolves(mockProject.state?._id as mongoose.Types.ObjectId)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectModel, 'getProjectById', stub);
      const projectDocument = await ProjectModel.createProject(mockProject);

      assert.strictEqual(projectDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when a validator throws one', async () => {
      sandbox.replace(
        ProjectModel,
        'validateType',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The project type does not exist',
              'project',
              {}
            )
          )
      );
      sandbox.replace(
        ProjectModel,
        'validateOrganization',
        sandbox.stub().resolves(mockProject.organization._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOwner',
        sandbox.stub().resolves(mockProject.owner._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateState',
        sandbox
          .stub()
          .resolves(mockProject.state?._id as mongoose.Types.ObjectId)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        ProjectModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectModel, 'getProjectById', stub);
      let hasError = false;
      try {
        await ProjectModel.createProject(mockProject);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        ProjectModel,
        'validateType',
        sandbox.stub().resolves(mockProject.type._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOrganization',
        sandbox.stub().resolves(mockProject.organization._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOwner',
        sandbox.stub().resolves(mockProject.owner._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateState',
        sandbox
          .stub()
          .resolves(mockProject.state?._id as mongoose.Types.ObjectId)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        ProjectModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectModel, 'getProjectById', stub);
      let hasError = false;
      try {
        await ProjectModel.createProject(mockProject);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        ProjectModel,
        'validateType',
        sandbox.stub().resolves(mockProject.type._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOrganization',
        sandbox.stub().resolves(mockProject.organization._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOwner',
        sandbox.stub().resolves(mockProject.owner._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateState',
        sandbox
          .stub()
          .resolves(mockProject.state?._id as mongoose.Types.ObjectId)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'create', sandbox.stub().resolves([{}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectModel, 'getProjectById', stub);
      let hasError = false;
      try {
        await ProjectModel.createProject(mockProject);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        ProjectModel,
        'validateType',
        sandbox.stub().resolves(mockProject.type._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOrganization',
        sandbox.stub().resolves(mockProject.organization._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOwner',
        sandbox.stub().resolves(mockProject.owner._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateState',
        sandbox
          .stub()
          .resolves(mockProject.state?._id as mongoose.Types.ObjectId)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        ProjectModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectModel, 'getProjectById', stub);
      let hasError = false;
      try {
        await ProjectModel.createProject(mockProject);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('updateProjectById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a project', async () => {
      const updateProject = {
        name: 'Test Project',
        description: 'This is a test project',
      };

      const projectId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProjectModel, 'updateOne', updateStub);

      const getProjectStub = sandbox.stub();
      getProjectStub.resolves({_id: projectId});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ProjectModel, 'validateUpdateObject', validateStub);

      const result = await ProjectModel.updateProjectById(
        projectId,
        updateProject
      );

      assert.strictEqual(result._id, projectId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getProjectStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the project does not exist', async () => {
      const updateProject = {
        name: 'Test Project',
        description: 'This is a test project',
      };

      const projectId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(ProjectModel, 'updateOne', updateStub);

      const getProjectStub = sandbox.stub();
      getProjectStub.resolves({_id: projectId});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectStub);

      let errorred = false;
      try {
        await ProjectModel.updateProjectById(projectId, updateProject);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateProject = {
        name: 'Test Project',
        description: 'This is a test project',
      };

      const projectId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProjectModel, 'updateOne', updateStub);

      const getProjectStub = sandbox.stub();
      getProjectStub.resolves({_id: projectId});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(ProjectModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await ProjectModel.updateProjectById(projectId, updateProject);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateProject = {
        name: 'Test Project',
        description: 'This is a test project',
      };

      const projectId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(ProjectModel, 'updateOne', updateStub);

      const getProjectStub = sandbox.stub();
      getProjectStub.resolves({_id: projectId});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ProjectModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await ProjectModel.updateProjectById(projectId, updateProject);
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

    it('will not throw an error when no unsafe fields are present', async () => {
      const inputProject = {
        name: 'Test Project',
        description: 'This is a test project',
      };

      let errored = false;

      try {
        await ProjectModel.validateUpdateObject(inputProject);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const inputProject = {
        name: 'Test Project',
        description: 'This is a test project',
        organization: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IOrganization,
        type: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectType,
        owner: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IState,
      };
      const orgStub = sandbox.stub();
      orgStub.resolves(true);
      sandbox.replace(OrganizationModel, 'organizationIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);
      let errored = false;

      //TODO: add the stubs for type and state once the models are built
      try {
        await ProjectModel.validateUpdateObject(inputProject);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(orgStub.calledOnce);
      assert.isTrue(ownerStub.calledOnce);
    });

    it('will fail when the organization does not exist.', async () => {
      const inputProject = {
        name: 'Test Project',
        description: 'This is a test project',
        organization: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IOrganization,
        type: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectType,
        owner: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IState,
      };
      const orgStub = sandbox.stub();
      orgStub.resolves(false);
      sandbox.replace(OrganizationModel, 'organizationIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);
      let errored = false;

      //TODO: add the stubs for type and state once the models are built
      try {
        await ProjectModel.validateUpdateObject(inputProject);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when the owner does not exist.', async () => {
      const inputProject = {
        name: 'Test Project',
        description: 'This is a test project',
        organization: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IOrganization,
        type: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectType,
        owner: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IState,
      };
      const orgStub = sandbox.stub();
      orgStub.resolves(true);
      sandbox.replace(OrganizationModel, 'organizationIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);
      let errored = false;

      //TODO: add the stubs for type and state once the models are built
      try {
        await ProjectModel.validateUpdateObject(inputProject);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const inputProject = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Project',
        description: 'This is a test project',
        organization: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IOrganization,
        type: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectType,
        owner: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IState,
      };
      const orgStub = sandbox.stub();
      orgStub.resolves(true);
      sandbox.replace(OrganizationModel, 'organizationIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);
      let errored = false;

      //TODO: add the stubs for type and state once the models are built
      try {
        await ProjectModel.validateUpdateObject(inputProject);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const inputProject = {
        name: 'Test Project',
        description: 'This is a test project',
        organization: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IOrganization,
        type: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectType,
        owner: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IState,
        createdAt: new Date(),
      };
      const orgStub = sandbox.stub();
      orgStub.resolves(true);
      sandbox.replace(OrganizationModel, 'organizationIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);
      let errored = false;

      //TODO: add the stubs for type and state once the models are built
      try {
        await ProjectModel.validateUpdateObject(inputProject);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const inputProject = {
        name: 'Test Project',
        description: 'This is a test project',
        organization: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IOrganization,
        type: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectType,
        owner: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IState,
        updatedAt: new Date(),
      };
      const orgStub = sandbox.stub();
      orgStub.resolves(true);
      sandbox.replace(OrganizationModel, 'organizationIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);
      let errored = false;

      //TODO: add the stubs for type and state once the models are built
      try {
        await ProjectModel.validateUpdateObject(inputProject);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('Delete a project document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a project', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ProjectModel, 'deleteOne', deleteStub);

      const projectId = new mongoose.Types.ObjectId();

      await ProjectModel.deleteProjectById(projectId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the project does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(ProjectModel, 'deleteOne', deleteStub);

      const projectId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ProjectModel.deleteProjectById(projectId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(ProjectModel, 'deleteOne', deleteStub);

      const projectId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ProjectModel.deleteProjectById(projectId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});
