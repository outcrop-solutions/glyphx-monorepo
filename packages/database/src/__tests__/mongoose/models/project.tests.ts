import {assert} from 'chai';
import {ProjectModel} from '../../..//mongoose/models/project';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {UserModel} from '../../../mongoose/models/user';
import {ProjectTypeModel} from '../../../mongoose/models/projectType';
import {StateModel} from '../../../mongoose/models/state';

import {database, database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const MOCK_PROJECT: databaseTypes.IProject = {
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'test project',
  description: 'this is a test description',
  sdtPath: 'sdtPath',
  workspace: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IWorkspace,
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
  viewName: 'testView',
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
        'validateWorkspace',
        sandbox.stub().resolves(MOCK_PROJECT.workspace._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOwner',
        sandbox.stub().resolves(MOCK_PROJECT.owner._id)
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
      const projectDocument = await ProjectModel.createProject(MOCK_PROJECT);

      assert.strictEqual(projectDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when a validator throws one', async () => {
      sandbox.replace(
        ProjectModel,
        'validateWorkspace',
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
        'validateOwner',
        sandbox.stub().resolves(MOCK_PROJECT.owner._id)
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
        await ProjectModel.createProject(MOCK_PROJECT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        ProjectModel,
        'validateWorkspace',
        sandbox.stub().resolves(MOCK_PROJECT.workspace._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOwner',
        sandbox.stub().resolves(MOCK_PROJECT.owner._id)
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
        await ProjectModel.createProject(MOCK_PROJECT);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        ProjectModel,
        'validateWorkspace',
        sandbox.stub().resolves(MOCK_PROJECT.workspace._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOwner',
        sandbox.stub().resolves(MOCK_PROJECT.owner._id)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'create', sandbox.stub().resolves([{}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectModel, 'getProjectById', stub);
      let hasError = false;
      try {
        await ProjectModel.createProject(MOCK_PROJECT);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        ProjectModel,
        'validateWorkspace',
        sandbox.stub().resolves(MOCK_PROJECT.workspace._id)
      );
      sandbox.replace(
        ProjectModel,
        'validateOwner',
        sandbox.stub().resolves(MOCK_PROJECT.owner._id)
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
        await ProjectModel.createProject(MOCK_PROJECT);
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
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
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

    it('Should update a project with refrences as ObjectIds', async () => {
      const updateProject = {
        name: 'Test Project',
        description: 'This is a test project',
        workspace: new mongoose.Types.ObjectId(),
        type: new mongoose.Types.ObjectId(),
        owner: new mongoose.Types.ObjectId(),
        state: new mongoose.Types.ObjectId(),
        viewName: 'this is my view name',
      } as unknown as databaseTypes.IProject;

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
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
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
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);

      const typeStub = sandbox.stub();
      typeStub.resolves(true);
      sandbox.replace(ProjectTypeModel, 'projectTypeIdExists', typeStub);

      let errored = false;

      try {
        await ProjectModel.validateUpdateObject(inputProject);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(orgStub.calledOnce);
      assert.isTrue(ownerStub.calledOnce);
      assert.isTrue(typeStub.calledOnce);
    });

    it('will fail when the workspace does not exist.', async () => {
      const inputProject = {
        name: 'Test Project',
        description: 'This is a test project',
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
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
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);

      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateStub);

      const typeStub = sandbox.stub();
      typeStub.resolves(true);
      sandbox.replace(ProjectTypeModel, 'projectTypeIdExists', typeStub);

      let errored = false;

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
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
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
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);

      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateStub);

      const typeStub = sandbox.stub();
      typeStub.resolves(true);
      sandbox.replace(ProjectTypeModel, 'projectTypeIdExists', typeStub);
      let errored = false;

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
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
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
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);

      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateStub);

      const typeStub = sandbox.stub();
      typeStub.resolves(true);
      sandbox.replace(ProjectTypeModel, 'projectTypeIdExists', typeStub);
      let errored = false;

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
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
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
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);

      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateStub);

      const typeStub = sandbox.stub();
      typeStub.resolves(true);
      sandbox.replace(ProjectTypeModel, 'projectTypeIdExists', typeStub);
      let errored = false;

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
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
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
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', orgStub);

      const ownerStub = sandbox.stub();
      ownerStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', ownerStub);

      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateStub);

      const typeStub = sandbox.stub();
      typeStub.resolves(true);
      sandbox.replace(ProjectTypeModel, 'projectTypeIdExists', typeStub);
      let errored = false;

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

  context('allProjectIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the project ids exist', async () => {
      const projectIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedProjectIds = projectIds.map(projectId => {
        return {
          _id: projectId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedProjectIds);
      sandbox.replace(ProjectModel, 'find', findStub);

      assert.isTrue(await ProjectModel.allProjectIdsExist(projectIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const projectIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedProjectIds = [
        {
          _id: projectIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedProjectIds);
      sandbox.replace(ProjectModel, 'find', findStub);
      let errored = false;
      try {
        await ProjectModel.allProjectIdsExist(projectIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          projectIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const projectIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(ProjectModel, 'find', findStub);
      let errored = false;
      try {
        await ProjectModel.allProjectIdsExist(projectIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('getProjectById', () => {
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

    const mockProject: databaseTypes.IProject = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'testProject',
      description: 'this is a test project',
      sdtPath: 'testsdtpath',
      slug: 'test slug',
      isTemplate: false,
      files: [],
      __v: 1,
      owner: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test user',
        __v: 1,
      } as unknown as databaseTypes.IUser,
      workspace: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test workspace',
        __v: 1,
      } as unknown as databaseTypes.IWorkspace,
      type: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test workspace',
        __v: 1,
      } as unknown as databaseTypes.IProjectType,

      state: {
        _id: new mongoose.Types.ObjectId(),
        version: 1,
        __v: 1,
      } as unknown as databaseTypes.IState,
      viewName: 'test View name',
    } as databaseTypes.IProject;

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a project document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockProject));
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      const doc = await ProjectModel.getProjectById(
        mockProject._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.owner as any).__v);
      assert.isUndefined((doc.type as any).__v);
      assert.isUndefined((doc.state as any).__v);
      assert.isUndefined((doc.workspace as any).__v);

      assert.strictEqual(doc._id, mockProject._id);
    });

    it('will throw a DataNotFoundError when the project does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProjectModel.getProjectById(
          mockProject._id as mongoose.Types.ObjectId
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
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProjectModel.getProjectById(
          mockProject._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('validateType', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will validate the type', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(true);
      sandbox.replace(ProjectTypeModel, 'projectTypeIdExists', idExistsStub);

      const result = await ProjectModel.validateType(projectTypeId);

      assert.strictEqual(result.toString(), projectTypeId.toString());
      assert.isTrue(idExistsStub.calledOnce);
    });

    it('will validate the type passing type as an IProjectType', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(true);
      sandbox.replace(ProjectTypeModel, 'projectTypeIdExists', idExistsStub);

      const result = await ProjectModel.validateType({
        _id: projectTypeId,
      } as unknown as database.IProjectType);

      assert.strictEqual(result.toString(), projectTypeId.toString());
      assert.isTrue(idExistsStub.calledOnce);
    });
    it('will throw an invalidArgumentError when the projectType does not exist', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(false);
      sandbox.replace(ProjectTypeModel, 'projectTypeIdExists', idExistsStub);
      let errored = false;
      try {
        await ProjectModel.validateType(projectTypeId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validateOwner', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will validate the user', async () => {
      const userId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', idExistsStub);

      const result = await ProjectModel.validateOwner(userId);

      assert.strictEqual(result.toString(), userId.toString());
      assert.isTrue(idExistsStub.calledOnce);
    });

    it('will validate the user passing the user as an IUser', async () => {
      const userId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', idExistsStub);

      const result = await ProjectModel.validateOwner({
        _id: userId,
      } as unknown as databaseTypes.IUser);

      assert.strictEqual(result.toString(), userId.toString());
      assert.isTrue(idExistsStub.calledOnce);
    });
    it('will throw an invalidArgumentError when the user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', idExistsStub);
      let errored = false;
      try {
        await ProjectModel.validateOwner(userId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validateWorkspace', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will validate the workspace', async () => {
      const workspaceId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', idExistsStub);

      const result = await ProjectModel.validateWorkspace(workspaceId);

      assert.strictEqual(result.toString(), workspaceId.toString());
      assert.isTrue(idExistsStub.calledOnce);
    });

    it('will validate the workspace passing the workspace as an IWorkspace', async () => {
      const workspaceId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', idExistsStub);

      const result = await ProjectModel.validateWorkspace({
        _id: workspaceId,
      } as unknown as databaseTypes.IWorkspace);

      assert.strictEqual(result.toString(), workspaceId.toString());
      assert.isTrue(idExistsStub.calledOnce);
    });

    it('will throw an invalidArgumentError when the workspace does not exist', async () => {
      const workspaceId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(false);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', idExistsStub);
      let errored = false;
      try {
        await ProjectModel.validateWorkspace(workspaceId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('queryProjects', () => {
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

    const mockProjects = [
      {
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testProject',
        description: 'this is a test project',
        sdtPath: 'testsdtpath',
        slug: 'test slug',
        isTemplate: false,
        files: [],
        __v: 1,
        owner: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test user',
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test workspace',
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        type: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test workspace',
          __v: 1,
        } as unknown as databaseTypes.IProjectType,

        state: {
          _id: new mongoose.Types.ObjectId(),
          version: 1,
          __v: 1,
        } as unknown as databaseTypes.IState,
        viewName: 'test View name',
      } as databaseTypes.IProject,
      {
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testProject2',
        description: 'this is a test project2',
        sdtPath: 'testsdtpath2',
        slug: 'test slug2',
        isTemplate: false,
        files: [],
        __v: 1,
        owner: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test user2',
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test workspace2',
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        type: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test workspace2',
          __v: 1,
        } as unknown as databaseTypes.IProjectType,

        state: {
          _id: new mongoose.Types.ObjectId(),
          version: 1,
          __v: 1,
        } as unknown as databaseTypes.IState,
        viewName: 'test View name2',
      } as databaseTypes.IProject,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered projects', async () => {
      sandbox.replace(
        ProjectModel,
        'count',
        sandbox.stub().resolves(mockProjects.length)
      );

      sandbox.replace(
        ProjectModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProjects))
      );

      const results = await ProjectModel.queryProjects({});

      assert.strictEqual(results.numberOfItems, mockProjects.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockProjects.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach(doc => {
        assert.isUndefined((doc as any).__v);
        assert.isUndefined((doc.type as any).__v);
        assert.isUndefined((doc.state as any).__v);
        assert.isUndefined((doc.workspace as any).__v);
        assert.isUndefined((doc.owner as any).__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(ProjectModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        ProjectModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProjects))
      );

      let errored = false;
      try {
        await ProjectModel.queryProjects();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        ProjectModel,
        'count',
        sandbox.stub().resolves(mockProjects.length)
      );

      sandbox.replace(
        ProjectModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProjects))
      );

      let errored = false;
      try {
        await ProjectModel.queryProjects({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        ProjectModel,
        'count',
        sandbox.stub().resolves(mockProjects.length)
      );

      sandbox.replace(
        ProjectModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await ProjectModel.queryProjects({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});
