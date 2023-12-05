// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {ProjectModel} from '../../../mongoose/models/project';
import * as mocks from '../../../mongoose/mocks';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
// eslint-disable-next-line import/no-duplicates
import {aspectRatioSchema} from '../../../mongoose/schemas';
import {ProjectTemplateModel} from '../../../mongoose/models/projectTemplate';
import {MemberModel} from '../../../mongoose/models/member';
import {TagModel} from '../../../mongoose/models/tag';
import {StateModel} from '../../../mongoose/models/state';
import {IQueryResult, databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

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
      const projectId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await ProjectModel.projectIdExists(projectId);
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

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will not throw an error when no unsafe fields are present', async () => {
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const templateStub = sandbox.stub();
      templateStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);

      let errored = false;

      try {
        await ProjectModel.validateUpdateObject(
          mocks.MOCK_PROJECT as unknown as Omit<Partial<databaseTypes.IProject>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const templateStub = sandbox.stub();
      templateStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);

      let errored = false;

      try {
        await ProjectModel.validateUpdateObject(
          mocks.MOCK_PROJECT as unknown as Omit<Partial<databaseTypes.IProject>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(workspaceStub.calledOnce);
      assert.isTrue(templateStub.calledOnce);
    });

    it('will fail when the workspace does not exist.', async () => {
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(false);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const templateStub = sandbox.stub();
      templateStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);

      let errored = false;

      try {
        await ProjectModel.validateUpdateObject(
          mocks.MOCK_PROJECT as unknown as Omit<Partial<databaseTypes.IProject>, '_id'>
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
    it('will fail when the template does not exist.', async () => {
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const templateStub = sandbox.stub();
      templateStub.resolves(false);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);

      let errored = false;

      try {
        await ProjectModel.validateUpdateObject(
          mocks.MOCK_PROJECT as unknown as Omit<Partial<databaseTypes.IProject>, '_id'>
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const templateStub = sandbox.stub();
      templateStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);

      let errored = false;

      try {
        await ProjectModel.validateUpdateObject({
          ...mocks.MOCK_PROJECT,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IProject>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const templateStub = sandbox.stub();
      templateStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);

      let errored = false;

      try {
        await ProjectModel.validateUpdateObject({...mocks.MOCK_PROJECT, createdAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IProject>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const templateStub = sandbox.stub();
      templateStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'projectTemplateIdExists', templateStub);

      let errored = false;

      try {
        await ProjectModel.validateUpdateObject({...mocks.MOCK_PROJECT, updatedAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IProject>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createProject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a project document', async () => {
      sandbox.replace(ProjectModel, 'validateWorkspace', sandbox.stub().resolves(mocks.MOCK_PROJECT.workspace));
      sandbox.replace(ProjectModel, 'validateTemplate', sandbox.stub().resolves(mocks.MOCK_PROJECT.template));
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(mocks.MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(mocks.MOCK_PROJECT.tags));
      sandbox.replace(ProjectModel, 'validateStates', sandbox.stub().resolves(mocks.MOCK_PROJECT.states));
      sandbox.replace(ProjectModel, 'validateFilesystems', sandbox.stub().resolves(mocks.MOCK_PROJECT.filesystem));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ProjectModel, 'getProjectById', stub);

      const projectDocument = await ProjectModel.createProject(mocks.MOCK_PROJECT);

      assert.strictEqual(projectDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when the workspace validator throws one', async () => {
      sandbox.replace(
        ProjectModel,
        'validateWorkspace',
        sandbox.stub().rejects(new error.DataValidationError('The workspace does not exist', 'workspace ', {}))
      );
      sandbox.replace(ProjectModel, 'validateTemplate', sandbox.stub().resolves(mocks.MOCK_PROJECT.template));
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(mocks.MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(mocks.MOCK_PROJECT.tags));
      sandbox.replace(ProjectModel, 'validateStates', sandbox.stub().resolves(mocks.MOCK_PROJECT.states));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ProjectModel, 'getProjectById', stub);

      let errored = false;

      try {
        await ProjectModel.createProject(mocks.MOCK_PROJECT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will rethrow a DataValidationError when the template validator throws one', async () => {
      sandbox.replace(ProjectModel, 'validateWorkspace', sandbox.stub().resolves(mocks.MOCK_PROJECT.workspace));
      sandbox.replace(
        ProjectModel,
        'validateTemplate',
        sandbox.stub().rejects(new error.DataValidationError('The template does not exist', 'template ', {}))
      );
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(mocks.MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(mocks.MOCK_PROJECT.tags));
      sandbox.replace(ProjectModel, 'validateStates', sandbox.stub().resolves(mocks.MOCK_PROJECT.states));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ProjectModel, 'getProjectById', stub);

      let errored = false;

      try {
        await ProjectModel.createProject(mocks.MOCK_PROJECT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(ProjectModel, 'validateWorkspace', sandbox.stub().resolves(mocks.MOCK_PROJECT.workspace));
      sandbox.replace(ProjectModel, 'validateTemplate', sandbox.stub().resolves(mocks.MOCK_PROJECT.template));
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(mocks.MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(mocks.MOCK_PROJECT.tags));
      sandbox.replace(ProjectModel, 'validateStates', sandbox.stub().resolves(mocks.MOCK_PROJECT.states));
      sandbox.replace(ProjectModel, 'validateFilesystems', sandbox.stub().resolves(mocks.MOCK_PROJECT.filesystem));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'create', sandbox.stub().rejects('oops, something bad has happened'));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectModel, 'getProjectById', stub);
      let hasError = false;
      try {
        await ProjectModel.createProject(mocks.MOCK_PROJECT);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(ProjectModel, 'validateWorkspace', sandbox.stub().resolves(mocks.MOCK_PROJECT.workspace));
      sandbox.replace(ProjectModel, 'validateTemplate', sandbox.stub().resolves(mocks.MOCK_PROJECT.template));
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(mocks.MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(mocks.MOCK_PROJECT.tags));
      sandbox.replace(ProjectModel, 'validateStates', sandbox.stub().resolves(mocks.MOCK_PROJECT.states));
      sandbox.replace(ProjectModel, 'validateFilesystems', sandbox.stub().resolves(mocks.MOCK_PROJECT.filesystem));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProjectModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectModel, 'getProjectById', stub);

      let hasError = false;
      try {
        await ProjectModel.createProject(mocks.MOCK_PROJECT);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(ProjectModel, 'validateWorkspace', sandbox.stub().resolves(mocks.MOCK_PROJECT.workspace));
      sandbox.replace(ProjectModel, 'validateTemplate', sandbox.stub().resolves(mocks.MOCK_PROJECT.template));
      sandbox.replace(ProjectModel, 'validateMembers', sandbox.stub().resolves(mocks.MOCK_PROJECT.members));
      sandbox.replace(ProjectModel, 'validateTags', sandbox.stub().resolves(mocks.MOCK_PROJECT.tags));
      sandbox.replace(ProjectModel, 'validateStates', sandbox.stub().resolves(mocks.MOCK_PROJECT.states));
      sandbox.replace(ProjectModel, 'validateFilesystems', sandbox.stub().resolves(mocks.MOCK_PROJECT.filesystem));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectModel, 'validate', sandbox.stub().rejects('oops an error has occurred'));
      sandbox.replace(ProjectModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectModel, 'getProjectById', stub);
      let hasError = false;
      try {
        await ProjectModel.createProject(mocks.MOCK_PROJECT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
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

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a project document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_PROJECT));
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      const doc = await ProjectModel.getProjectById(mocks.MOCK_PROJECT._id as mongoose.Types.ObjectId);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.workspace as any)?.__v);
      assert.isUndefined((doc.template as any)?.__v);
      assert.isUndefined((doc.members[0] as any)?.__v);
      assert.isUndefined((doc.tags[0] as any)?.__v);
      assert.isUndefined((doc.states[0] as any)?.__v);
      assert.isUndefined((doc.filesystem[0] as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_PROJECT._id);
    });

    it('will throw a DataNotFoundError when the project does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ProjectModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProjectModel.getProjectById(mocks.MOCK_PROJECT._id as mongoose.Types.ObjectId);
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
        await ProjectModel.getProjectById(mocks.MOCK_PROJECT._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
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
        ...mocks.MOCK_PROJECT,
        _id: new mongoose.Types.ObjectId(),
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        template: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProjectTemplate,
        members: [],
        tags: [],
        states: [],
        filesystem: [],
      } as databaseTypes.IProject,
      {
        ...mocks.MOCK_PROJECT,
        _id: new mongoose.Types.ObjectId(),
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        template: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProjectTemplate,
        members: [],
        tags: [],
        states: [],
        filesystem: [],
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
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.workspace as any)?.__v);
        assert.isUndefined((doc.template as any)?.__v);
        assert.isUndefined((doc.members[0] as any)?.__v);
        assert.isUndefined((doc.tags[0] as any)?.__v);
        assert.isUndefined((doc.states[0] as any)?.__v);
        assert.isUndefined((doc.filesystem[0] as any)?.__v);
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

  context('updateProjectById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a project', async () => {
      const updateProject = {
        ...mocks.MOCK_PROJECT,
        deletedAt: new Date(),
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        template: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProjectTemplate,
        members: [],
        tags: [],
        states: [],
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

    it('Should update a project with references as ObjectIds', async () => {
      const updateProject = {
        ...mocks.MOCK_PROJECT,
        deletedAt: new Date(),
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
        ...mocks.MOCK_PROJECT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProject;

      const projectId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(ProjectModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(ProjectModel, 'validateUpdateObject', validateStub);

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
        ...mocks.MOCK_PROJECT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProject;

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
        ...mocks.MOCK_PROJECT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProject;

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
