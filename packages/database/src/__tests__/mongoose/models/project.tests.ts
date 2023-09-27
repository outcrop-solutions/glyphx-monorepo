import {assert} from 'chai';
import {ProjectModel} from '../../..//mongoose/models/project';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {UserModel} from '../../../mongoose/models/user';
import {ProjectTemplateModel} from '../../../mongoose/models/projectTemplate';
import {StateModel} from '../../../mongoose/models/state';
import {MemberModel} from '../../../mongoose/models/member';

import {databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';
import {TagModel} from '../../../mongoose/models';

const MOCK_PROJECT: databaseTypes.IProject = {
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'test project',
  description: 'this is a test description',
  sdtPath: 'sdtPath',
  currentVersion: 0,
  tags: [],
  workspace: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IWorkspace,
  slug: 'what is a slug anyway',
  template: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IProjectTemplate,
  state: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IState,
  files: [],
  members: [],
  stateHistory: [],
  viewName: 'testView',
};

const MOCK_NULLISH_PROJECT = {
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'test project',
  description: undefined,
  currentVersion: undefined,
  sdtPath: 'sdtPath',
  workspace: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IWorkspace,
  slug: 'what is a slug anyway',
  template: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IProjectTemplate,
  owner: {_id: new mongoose.Types.ObjectId()} as unknown as databaseTypes.IUser,
  state: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IState,
  files: undefined,
  viewName: undefined,
} as unknown as databaseTypes.IProject;

describe.only('#mongoose/models/project', () => {
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
      sandbox.replace(ProjectModel, 'validateWorkspace', sandbox.stub().resolves(MOCK_PROJECT.workspace._id));
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(MOCK_PROJECT.tags));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectModel, 'getProjectById', stub);
      const projectDocument = await ProjectModel.createProject(MOCK_PROJECT);

      assert.strictEqual(projectDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will create a project document with nullish coalesce', async () => {
      sandbox.replace(ProjectModel, 'validateWorkspace', sandbox.stub().resolves(MOCK_PROJECT.workspace._id));
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(MOCK_PROJECT.tags));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectModel,
        'create',
        sandbox.stub().resolves([{_id: objectId, description: ' ', viewName: ' ', files: []}])
      );
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));
      const stub = sandbox.stub();
      stub.resolves({
        _id: objectId,
        description: ' ',
        viewName: ' ',
        files: [],
      });
      sandbox.replace(ProjectModel, 'getProjectById', stub);
      const projectDocument = await ProjectModel.createProject(MOCK_NULLISH_PROJECT);
      assert.strictEqual(projectDocument.files.length, 0);
      assert.strictEqual(projectDocument.description, ' ');
      assert.strictEqual(projectDocument.viewName, ' ');
      assert.strictEqual(projectDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when a validator throws one', async () => {
      sandbox.replace(
        ProjectModel,
        'validateWorkspace',
        sandbox.stub().rejects(new error.DataValidationError('The worksapce does not exist', 'project', {}))
      );
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(MOCK_PROJECT.tags));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
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
      sandbox.replace(ProjectModel, 'validateWorkspace', sandbox.stub().resolves(MOCK_PROJECT.workspace._id));
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(MOCK_PROJECT.tags));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'create', sandbox.stub().rejects('oops, something bad has happened'));
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
      sandbox.replace(ProjectModel, 'validateWorkspace', sandbox.stub().resolves(MOCK_PROJECT.workspace._id));
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(MOCK_PROJECT.tags));

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
      sandbox.replace(ProjectModel, 'validateWorkspace', sandbox.stub().resolves(MOCK_PROJECT.workspace._id));
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(MOCK_PROJECT.tags));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().rejects('oops an error has occurred'));
      sandbox.replace(ProjectModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
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
        template: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
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

      const result = await ProjectModel.updateProjectById(projectId, updateProject);

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
        template: new mongoose.Types.ObjectId(),
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

      const result = await ProjectModel.updateProjectById(projectId, updateProject);

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
      validateStub.rejects(new error.InvalidOperationError("You can't do this", {}));
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
        template: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
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

      const templateStub = sandbox.stub();
      templateStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);

      let errored = false;

      try {
        await ProjectModel.validateUpdateObject(inputProject);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(orgStub.calledOnce);
      assert.isTrue(templateStub.calledOnce);
    });

    it('will fail when the workspace does not exist.', async () => {
      const inputProject = {
        name: 'Test Project',
        description: 'This is a test project',
        workspace: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
        template: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
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

      const templateStub = sandbox.stub();
      templateStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);

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
        template: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
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

      const templateStub = sandbox.stub();
      templateStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);
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
        template: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
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

      const templateStub = sandbox.stub();
      templateStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);
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
        template: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
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

      const templateStub = sandbox.stub();
      templateStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);
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
      const projectIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedProjectIds = projectIds.map((projectId) => {
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
      const projectIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

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
        assert.strictEqual(err.data.value[0].toString(), projectIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const projectIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

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
      stateHistory: [
        {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
          camera: {_id: new mongoose.Types.ObjectId(), __v: 1},
        },
      ] as unknown as databaseTypes.IState,
      members: [],
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
      template: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test workspace',
        __v: 1,
      } as unknown as databaseTypes.IProjectTemplate,

      state: {
        _id: new mongoose.Types.ObjectId(),
        version: 1,
        __v: 1,
      } as unknown as databaseTypes.IState,
      viewName: 'test View name',
    } as unknown as databaseTypes.IProject;

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a project document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockProject));
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      const doc = await ProjectModel.getProjectById(mockProject._id as mongoose.Types.ObjectId);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.template as any).__v);
      assert.isUndefined((doc.workspace as any).__v);
      assert.isUndefined((doc.stateHistory[0] as any).__v);
      assert.isUndefined((doc.stateHistory[0].camera as any).__v);

      assert.strictEqual(doc.id, mockProject._id?.toString());
    });

    it('will throw a DataNotFoundError when the project does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProjectModel.getProjectById(mockProject._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProjectModel.getProjectById(mockProject._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('validateTemplate', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will validate the template', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', idExistsStub);

      const result = await ProjectModel.validateTemplate(projectTemplateId);

      assert.strictEqual(result.toString(), projectTemplateId.toString());
      assert.isTrue(idExistsStub.calledOnce);
    });

    it('will validate the template passing template as an IProjectTemplate', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', idExistsStub);

      const result = await ProjectModel.validateTemplate({
        _id: projectTemplateId,
      } as unknown as databaseTypes.IProjectTemplate);

      assert.strictEqual(result.toString(), projectTemplateId.toString());
      assert.isTrue(idExistsStub.calledOnce);
    });
    it('will throw an invalidArgumentError when the projectTemplate does not exist', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();

      const idExistsStub = sandbox.stub();
      idExistsStub.resolves(false);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', idExistsStub);
      let errored = false;
      try {
        await ProjectModel.validateTemplate(projectTemplateId);
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
        stateHistory: [],
        members: [],
        tags: [],
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
        template: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test workspace',
          __v: 1,
        } as unknown as databaseTypes.IProjectTemplate,
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
        stateHistory: [],
        members: [],
        tags: [],
        slug: 'test slug2',

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
        template: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test workspace2',
          __v: 1,
        } as unknown as databaseTypes.IProjectTemplate,

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
      sandbox.replace(ProjectModel, 'count', sandbox.stub().resolves(mockProjects.length));

      sandbox.replace(ProjectModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockProjects)));

      const results = await ProjectModel.queryProjects({});

      assert.strictEqual(results.numberOfItems, mockProjects.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockProjects.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any).__v);
        assert.isUndefined((doc.template as any).__v);
        assert.isUndefined((doc.workspace as any).__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(ProjectModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(ProjectModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockProjects)));

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
      sandbox.replace(ProjectModel, 'count', sandbox.stub().resolves(mockProjects.length));

      sandbox.replace(ProjectModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockProjects)));

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
      sandbox.replace(ProjectModel, 'count', sandbox.stub().resolves(mockProjects.length));

      sandbox.replace(
        ProjectModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
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

  context('validateTags', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will validate the tags where the ids are objectIds', async () => {
      const tagIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const allTagIdsExistStub = sandbox.stub();
      allTagIdsExistStub.resolves();
      sandbox.replace(TagModel, 'allTagIdsExist', allTagIdsExistStub);

      const res = await ProjectModel.validateTags(tagIds);
      assert.deepEqual(res, tagIds);
      assert.isTrue(allTagIdsExistStub.calledOnce);
    });

    it('will validate the states where the ids are objects', async () => {
      const tagIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const allTagIdsExistStub = sandbox.stub();
      allTagIdsExistStub.resolves();
      sandbox.replace(TagModel, 'allTagIdsExist', allTagIdsExistStub);

      const res = await ProjectModel.validateTags(tagIds.map((id) => ({_id: id}) as databaseTypes.ITag));
      assert.deepEqual(res, tagIds);
      assert.isTrue(allTagIdsExistStub.calledOnce);
    });

    it('will wrap a DataNotFoundError in a DataValidationError', async () => {
      const tagIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const allTagIdsExistStub = sandbox.stub();
      allTagIdsExistStub.rejects(new error.DataNotFoundError('The data does not exist', 'stateIds', tagIds));
      sandbox.replace(TagModel, 'allTagIdsExist', allTagIdsExistStub);

      let errored = false;
      try {
        await ProjectModel.validateTags(tagIds);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will pass through a DatabaseOperationError', async () => {
      const tagIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const allTagIdsExistStub = sandbox.stub();
      allTagIdsExistStub.rejects(
        new error.DatabaseOperationError(
          'Something has gone horribly wrong',
          'mongoDb',
          ' TagModel.allTagIdsExist',
          tagIds
        )
      );
      sandbox.replace(TagModel, 'allTagIdsExist', allTagIdsExistStub);

      let errored = false;
      try {
        await ProjectModel.validateTags(tagIds);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validateStates', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will validate the states where the ids are objectIds', async () => {
      const stateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const allStateIdsExistStub = sandbox.stub();
      allStateIdsExistStub.resolves();
      sandbox.replace(StateModel, 'allStateIdsExist', allStateIdsExistStub);

      const res = await ProjectModel.validateStates(stateIds);
      assert.deepEqual(res, stateIds);
      assert.isTrue(allStateIdsExistStub.calledOnce);
    });

    it('will validate the states where the ids are objects', async () => {
      const stateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const allStateIdsExistStub = sandbox.stub();
      allStateIdsExistStub.resolves();
      sandbox.replace(StateModel, 'allStateIdsExist', allStateIdsExistStub);

      const res = await ProjectModel.validateStates(stateIds.map((id) => ({_id: id}) as databaseTypes.IState));
      assert.deepEqual(res, stateIds);
      assert.isTrue(allStateIdsExistStub.calledOnce);
    });

    it('will wrap a DataNotFoundError in a DataValidationError', async () => {
      const stateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const allStateIdsExistStub = sandbox.stub();
      allStateIdsExistStub.rejects(new error.DataNotFoundError('The data does not exist', 'stateIds', stateIds));
      sandbox.replace(StateModel, 'allStateIdsExist', allStateIdsExistStub);

      let errored = false;
      try {
        await ProjectModel.validateStates(stateIds);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will pass through a DatabaseOperationError', async () => {
      const stateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const allStateIdsExistStub = sandbox.stub();
      allStateIdsExistStub.rejects(
        new error.DatabaseOperationError(
          'Something has gone horribly wrong',
          'mongoDb',
          ' StateModel.allStateIdsExist',
          stateIds
        )
      );
      sandbox.replace(StateModel, 'allStateIdsExist', allStateIdsExistStub);

      let errored = false;
      try {
        await ProjectModel.validateStates(stateIds);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('addStates', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add the states as ObjectIds', async () => {
      const stateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const projectId = new mongoose.Types.ObjectId();
      const findProjectByIdStub = sandbox.stub();
      const saveStub = sandbox.stub();
      saveStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        stateHistory: [],
        save: saveStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateStatesStub = sandbox.stub();
      validateStatesStub.resolves(stateIds);
      sandbox.replace(ProjectModel, 'validateStates', validateStatesStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: []});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.addStates(projectId, stateIds);

      assert.isOk(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(validateStatesStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
    });

    it('will not add the states if they already exist on the project', async () => {
      const stateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const projectId = new mongoose.Types.ObjectId();
      const findProjectByIdStub = sandbox.stub();
      const saveStub = sandbox.stub();
      saveStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        stateHistory: stateIds,
        save: saveStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateStatesStub = sandbox.stub();
      validateStatesStub.resolves(stateIds);
      sandbox.replace(ProjectModel, 'validateStates', validateStatesStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: []});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.addStates(projectId, stateIds);

      assert.isOk(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(validateStatesStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isFalse(saveStub.called);
    });

    it('will add the states as objects', async () => {
      const stateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const projectId = new mongoose.Types.ObjectId();
      const findProjectByIdStub = sandbox.stub();
      const saveStub = sandbox.stub();
      saveStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        stateHistory: [],
        save: saveStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateStatesStub = sandbox.stub();
      validateStatesStub.resolves(stateIds);
      sandbox.replace(ProjectModel, 'validateStates', validateStatesStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: []});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.addStates(
        projectId,
        stateIds.map((id) => ({_id: id}) as unknown as databaseTypes.IState)
      );

      assert.isOk(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(validateStatesStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
    });

    it('will throw an InvalidArgumentError if the input states length === 0', async () => {
      const stateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const projectId = new mongoose.Types.ObjectId();
      const findProjectByIdStub = sandbox.stub();
      findProjectByIdStub.resolves({
        _id: projectId,
        stateHistory: [],
        save: () => {},
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateStatesStub = sandbox.stub();
      validateStatesStub.resolves(stateIds);
      sandbox.replace(ProjectModel, 'validateStates', validateStatesStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: []});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);
      let errored = false;
      try {
        await ProjectModel.addStates(projectId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an DataNotFoundError if the input project does not exist', async () => {
      const stateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const projectId = new mongoose.Types.ObjectId();
      const findProjectByIdStub = sandbox.stub();
      findProjectByIdStub.resolves();
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateStatesStub = sandbox.stub();
      validateStatesStub.resolves(stateIds);
      sandbox.replace(ProjectModel, 'validateStates', validateStatesStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: []});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);
      let errored = false;
      try {
        await ProjectModel.addStates(projectId, stateIds);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an DataValidationError if the states do not exist', async () => {
      const stateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const projectId = new mongoose.Types.ObjectId();
      const findProjectByIdStub = sandbox.stub();
      findProjectByIdStub.resolves({
        _id: projectId,
        stateHistory: [],
        save: () => {},
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateStatesStub = sandbox.stub();
      validateStatesStub.rejects(new error.DataValidationError('This data is not valid', 'states', stateIds));
      sandbox.replace(ProjectModel, 'validateStates', validateStatesStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: []});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);
      let errored = false;
      try {
        await ProjectModel.addStates(projectId, stateIds);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw an DatabaseOperationError if the underlying database call fails', async () => {
      const stateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const projectId = new mongoose.Types.ObjectId();
      const findProjectByIdStub = sandbox.stub();
      findProjectByIdStub.resolves({
        _id: projectId,
        stateHistory: [],
        save: () => {
          throw 'what do you think you are trying to do';
        },
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateStatesStub = sandbox.stub();
      validateStatesStub.resolves();
      sandbox.replace(ProjectModel, 'validateStates', validateStatesStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: []});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);
      let errored = false;
      try {
        await ProjectModel.addStates(projectId, stateIds);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('removeMemebers', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a project member', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const members = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        members: members,
        save: savedStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: members});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.removeMembers(projectId, members);

      assert.isOk(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isTrue(savedStub.calledOnce);
    });

    it('will remove a project members with ids as object', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const members = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        members: members,
        save: savedStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: members});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.removeMembers(
        projectId,
        members.map((member) => {
          return {_id: member} as unknown as databaseTypes.IMember;
        })
      );

      assert.isOk(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isTrue(savedStub.calledOnce);
    });

    it('will not remove non existing project member', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const members = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        members: members,
        save: savedStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: members});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.removeMembers(projectId, [new mongoose.Types.ObjectId()]);

      assert.isOk(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isFalse(savedStub.called);
    });

    it('will throw an InvalidArgumentError when the members argument is empty', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const members = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        members: members,
        save: savedStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: members});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      let errored = false;
      try {
        await ProjectModel.removeMembers(projectId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will passthrough a DataNotFoundError when the project does exist ', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const members = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves();
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: members});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      let errored = false;
      try {
        await ProjectModel.removeMembers(projectId, members);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a databaseOperationError when the underlying Database call fails', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const members = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.rejects('The database has failed');
      findProjectByIdStub.resolves({
        _id: projectId,
        members: members,
        save: savedStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: members});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      let errored = false;
      try {
        await ProjectModel.removeMembers(projectId, members);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validateMembers', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will validate members with ids as objectIds', async () => {
      const members = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const allMemberIdsExistStub = sandbox.stub();
      allMemberIdsExistStub.resolves();
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMemberIdsExistStub);

      const res = await ProjectModel.validateMembers(members);
      assert.deepEqual(res, members);
      assert.isTrue(allMemberIdsExistStub.calledOnce);
    });

    it('will validate members with ids as objects', async () => {
      const members = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const allMemberIdsExistStub = sandbox.stub();
      allMemberIdsExistStub.resolves();
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMemberIdsExistStub);

      const res = await ProjectModel.validateMembers(
        members.map((member) => ({_id: member}) as unknown as databaseTypes.IMember)
      );
      assert.deepEqual(res, members);
      assert.isTrue(allMemberIdsExistStub.calledOnce);
    });

    it('will wrap a DataNotFoundError into a DataValidationError when all the memberIds do not exist', async () => {
      const members = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const allMemberIdsExistStub = sandbox.stub();
      allMemberIdsExistStub.rejects(new error.DataNotFoundError('The data was not found', 'members', members));
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMemberIdsExistStub);

      let errored = false;
      try {
        await ProjectModel.validateMembers(members);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will passthrough any other error passed by allMemberIdsExist', async () => {
      const members = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const allMemberIdsExistStub = sandbox.stub();
      allMemberIdsExistStub.rejects(
        new error.DatabaseOperationError('The database failed', 'mongoDb', 'members.allMemberIdsExist', members)
      );
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMemberIdsExistStub);

      let errored = false;
      try {
        await ProjectModel.validateMembers(members);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('addMembers', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add new members with ids passed as objectIds', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        members: [],
        save: savedStub,
      });

      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves(memberIds);
      sandbox.replace(ProjectModel, 'validateMembers', validateMembersStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: memberIds});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.addMembers(projectId, memberIds);
      assert.isOk(res);
      assert.isObject(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isTrue(savedStub.calledOnce);
      assert.isTrue(validateMembersStub.calledOnce);
    });

    it('will add new members with ids passed as objects', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        members: [],
        save: savedStub,
      });

      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves(memberIds);
      sandbox.replace(ProjectModel, 'validateMembers', validateMembersStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: memberIds});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.addMembers(
        projectId,
        memberIds.map((member) => ({_id: member}) as unknown as databaseTypes.IMember)
      );
      assert.isOk(res);
      assert.isObject(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isTrue(savedStub.calledOnce);
      assert.isTrue(validateMembersStub.calledOnce);
    });

    it('will add new members if they already exist on the project', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        members: memberIds,
        save: savedStub,
      });

      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves(memberIds);
      sandbox.replace(ProjectModel, 'validateMembers', validateMembersStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: memberIds});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.addMembers(projectId, memberIds);
      assert.isOk(res);
      assert.isObject(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isFalse(savedStub.called);
      assert.isTrue(validateMembersStub.calledOnce);
    });

    it('will throw an InvalidArgumentError when members.length === 0', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        members: [],
        save: savedStub,
      });

      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves(memberIds);
      sandbox.replace(ProjectModel, 'validateMembers', validateMembersStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: memberIds});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      let errored = false;
      try {
        await ProjectModel.addMembers(projectId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DataNotFoundError when project does not exist', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves();

      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves(memberIds);
      sandbox.replace(ProjectModel, 'validateMembers', validateMembersStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: memberIds});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      let errored = false;
      try {
        await ProjectModel.addMembers(projectId, memberIds);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DataValidationError when members cannot be validated', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        members: [],
        save: savedStub,
      });

      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.rejects(new error.DataValidationError('The memberIDs are not valid', 'members', memberIds));
      sandbox.replace(ProjectModel, 'validateMembers', validateMembersStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: memberIds});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      let errored = false;
      try {
        await ProjectModel.addMembers(projectId, memberIds);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database call fails', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.rejects('something really bad has happened');
      findProjectByIdStub.resolves({
        _id: projectId,
        members: [],
        save: savedStub,
      });

      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves(memberIds);
      sandbox.replace(ProjectModel, 'validateMembers', validateMembersStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, members: memberIds});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      let errored = false;
      try {
        await ProjectModel.addMembers(projectId, memberIds);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('removeStates', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a project state', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const states = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        stateHistory: states,
        save: savedStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: states});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.removeStates(projectId, states);

      assert.isOk(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isTrue(savedStub.calledOnce);
    });

    it('will remove a project states with ids as object', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const states = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        stateHistory: states,
        save: savedStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: states});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.removeStates(
        projectId,
        states.map((member) => {
          return {_id: member} as unknown as databaseTypes.IState;
        })
      );

      assert.isOk(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isTrue(savedStub.calledOnce);
    });

    it('will not remove non existing project state', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const states = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        stateHistory: states,
        save: savedStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: states});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      const res = await ProjectModel.removeStates(projectId, [new mongoose.Types.ObjectId()]);

      assert.isOk(res);
      assert.isTrue(findProjectByIdStub.calledOnce);
      assert.isTrue(getProjectByIdStub.calledOnce);
      assert.isFalse(savedStub.called);
    });

    it('will throw an InvalidArgumentError when the state argument is empty', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const states = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves({
        _id: projectId,
        stateHistory: states,
        save: savedStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: states});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      let errored = false;
      try {
        await ProjectModel.removeStates(projectId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will passthrough a DataNotFoundError when the project does exist ', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const states = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.resolves();
      findProjectByIdStub.resolves();
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: states});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      let errored = false;
      try {
        await ProjectModel.removeStates(projectId, states);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a databaseOperationError when the underlying Database call fails', async () => {
      const projectId = new mongoose.Types.ObjectId();
      const states = [new mongoose.Types.ObjectId()];
      const findProjectByIdStub = sandbox.stub();
      const savedStub = sandbox.stub();
      savedStub.rejects('The database has failed');
      findProjectByIdStub.resolves({
        _id: projectId,
        stateHistory: states,
        save: savedStub,
      });
      sandbox.replace(ProjectModel, 'findById', findProjectByIdStub);

      const getProjectByIdStub = sandbox.stub();
      getProjectByIdStub.resolves({_id: projectId, stateHistory: states});
      sandbox.replace(ProjectModel, 'getProjectById', getProjectByIdStub);

      let errored = false;
      try {
        await ProjectModel.removeStates(projectId, states);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
});
