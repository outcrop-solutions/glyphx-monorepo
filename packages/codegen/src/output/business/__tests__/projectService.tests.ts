// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from '../../../../database';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from '@glyphx/database';
import {error} from '@glyphx/core';
import {projectService} from '../services';
import * as mocks from '../../database/mongoose/mocks';

describe('#services/project', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createProject', () => {
    it('will create a Project', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const createdAtId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const aspectRatioId = new mongooseTypes.ObjectId();
      const templateId = new mongooseTypes.ObjectId();
      const membersId = new mongooseTypes.ObjectId();
      const tagsId = new mongooseTypes.ObjectId();
      const stateId = new mongooseTypes.ObjectId();
      const statesId = new mongooseTypes.ObjectId();
      const filesId = new mongooseTypes.ObjectId();

      // createProject
      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        ...mocks.MOCK_PROJECT,
        _id: new mongooseTypes.ObjectId(),
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        template: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProjectTemplate,
        members: [],
        tags: [],
        states: [],
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectModel,
        'createProject',
        createProjectFromModelStub
      );

      const doc = await projectService.createProject({
        ...mocks.MOCK_PROJECT,
        _id: new mongooseTypes.ObjectId(),
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        template: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProjectTemplate,
        members: [],
        tags: [],
        states: [],
      } as unknown as databaseTypes.IProject);

      assert.isTrue(createProjectFromModelStub.calledOnce);
    });
    // project model fails
    it('will publish and rethrow an InvalidArgumentError when project model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createProject
      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectModel,
        'createProject',
        createProjectFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await projectService.createProject({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when project model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createProject
      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.rejects(err);

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await projectService.createProject({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when project model throws it', async () => {
      const createProjectFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createProjectFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectModel,
        'createProject',
        createProjectFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataValidationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await projectService.createProject({});
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when project model throws a DataOperationError', async () => {
      const createProjectFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createProjectFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectModel,
        'createProject',
        createProjectFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await projectService.createProject({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when project model throws a UnexpectedError', async () => {
      const createProjectFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(errMessage, 'mongodDb');

      createProjectFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectModel,
        'createProject',
        createProjectFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.UnexpectedError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await projectService.createProject({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getProject', () => {
    it('should get a project by id', async () => {
      const projectId = new mongooseTypes.ObjectId();

      const getProjectFromModelStub = sandbox.stub();
      getProjectFromModelStub.resolves({
        _id: projectId,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'getProjectById',
        getProjectFromModelStub
      );

      const project = await projectService.getProject(projectId);
      assert.isOk(project);
      assert.strictEqual(project?._id?.toString(), projectId.toString());

      assert.isTrue(getProjectFromModelStub.calledOnce);
    });
    it('should get a project by id when id is a string', async () => {
      const projectId = new mongooseTypes.ObjectId();

      const getProjectFromModelStub = sandbox.stub();
      getProjectFromModelStub.resolves({
        _id: projectId,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'getProjectById',
        getProjectFromModelStub
      );

      const project = await projectService.getProject(projectId.toString());
      assert.isOk(project);
      assert.strictEqual(project?._id?.toString(), projectId.toString());

      assert.isTrue(getProjectFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the project cannot be found', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'projectId',
        projectId
      );
      const getProjectFromModelStub = sandbox.stub();
      getProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'getProjectById',
        getProjectFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const project = await projectService.getProject(projectId);
      assert.notOk(project);

      assert.isTrue(getProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getProjectById'
      );
      const getProjectFromModelStub = sandbox.stub();
      getProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'getProjectById',
        getProjectFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await projectService.getProject(projectId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getProjects', () => {
    it('should get projects by filter', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const projectId2 = new mongooseTypes.ObjectId();
      const projectFilter = {_id: projectId};

      const queryProjectsFromModelStub = sandbox.stub();
      queryProjectsFromModelStub.resolves({
        results: [
          {
            ...mocks.MOCK_PROJECT,
            _id: projectId,
            workspace: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IWorkspace,
            template: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IProjectTemplate,
            members: [],
            tags: [],
            states: [],
          } as unknown as databaseTypes.IProject,
          {
            ...mocks.MOCK_PROJECT,
            _id: projectId2,
            workspace: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IWorkspace,
            template: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IProjectTemplate,
            members: [],
            tags: [],
            states: [],
          } as unknown as databaseTypes.IProject,
        ],
      } as unknown as databaseTypes.IProject[]);

      sandbox.replace(
        dbConnection.models.ProjectModel,
        'queryProjects',
        queryProjectsFromModelStub
      );

      const projects = await projectService.getProjects(projectFilter);
      assert.isOk(projects![0]);
      assert.strictEqual(projects![0]._id?.toString(), projectId.toString());
      assert.isTrue(queryProjectsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the projects cannot be found', async () => {
      const projectName = 'projectName1';
      const projectFilter = {name: projectName};
      const errMessage = 'Cannot find the project';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        projectFilter
      );
      const getProjectFromModelStub = sandbox.stub();
      getProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'queryProjects',
        getProjectFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const project = await projectService.getProjects(projectFilter);
      assert.notOk(project);

      assert.isTrue(getProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const projectName = 'projectName1';
      const projectFilter = {name: projectName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getProjectByEmail'
      );
      const getProjectFromModelStub = sandbox.stub();
      getProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'queryProjects',
        getProjectFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await projectService.getProjects(projectFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateProject', () => {
    it('will update a project', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        ...mocks.MOCK_PROJECT,
        _id: new mongooseTypes.ObjectId(),
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        template: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProjectTemplate,
        members: [],
        tags: [],
        states: [],
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'updateProjectById',
        updateProjectFromModelStub
      );

      const project = await projectService.updateProject(projectId, {
        deletedAt: new Date(),
      });
      assert.isOk(project);
      assert.strictEqual(project._id, projectId);
      assert.isOk(project.deletedAt);
      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will update a project when the id is a string', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        ...mocks.MOCK_PROJECT,
        _id: new mongooseTypes.ObjectId(),
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        template: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProjectTemplate,
        members: [],
        tags: [],
        states: [],
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'updateProjectById',
        updateProjectFromModelStub
      );

      const project = await projectService.updateProject(projectId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(project);
      assert.strictEqual(project._id, projectId);
      assert.isOk(project.deletedAt);
      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when project model throws it ', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'updateProjectById',
        updateProjectFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await projectService.updateProject(projectId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when project model throws it ', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'updateProjectById',
        updateProjectFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await projectService.updateProject(projectId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when project model throws a DataOperationError ', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateProjectById'
      );
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'updateProjectById',
        updateProjectFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await projectService.updateProject(projectId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
