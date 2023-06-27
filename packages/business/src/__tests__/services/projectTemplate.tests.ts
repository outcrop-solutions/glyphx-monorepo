import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {
  database as databaseTypes,
  fileIngestion as fileIngestionTypes,
} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from '@glyphx/database';
import {error} from '@glyphx/core';
import {projectTemplateService} from '../../services';

describe('#services/project', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('getProjectTemplate', () => {
    it('should get a projectTemplate by id', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();

      const getProjectTemplateFromModelStub = sandbox.stub();
      getProjectTemplateFromModelStub.resolves({
        _id: projectTemplateId,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateFromModelStub
      );

      const projectTemplate = await projectTemplateService.getProject(
        projectTemplateId
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(
        projectTemplate._id?.toString(),
        projectTemplateId.toString()
      );

      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
    });

    it('should get a projectTemplate by id when id is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();

      const getProjectTemplateFromModelStub = sandbox.stub();
      getProjectTemplateFromModelStub.resolves({
        _id: projectTemplateId,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateFromModelStub
      );

      const projectTemplate = await projectTemplateService.getProject(
        projectTemplateId.toString()
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(
        projectTemplate._id?.toString(),
        projectTemplateId.toString()
      );

      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the projectTemplate cannot be found', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'projectTemplateId',
        projectTemplateId
      );
      const getProjectTemplateFromModelStub = sandbox.stub();
      getProjectTemplateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateFromModelStub
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

      const projectTemplate = await projectTemplateService.getProjectTemplate(
        projectTemplateId
      );
      assert.notOk(projectTemplate);

      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getProjectTemplateById'
      );
      const getProjectTemplateFromModelStub = sandbox.stub();
      getProjectTemplateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateFromModelStub
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
        await projectTemplateService.getProject(projectTemplateId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getProjectTemplates', () => {
    it('should get templates by filter', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplate1';
      const projectFilter = {name: projectTemplateName};

      const queryProjectTemplatesFromModelStub = sandbox.stub();
      queryProjectTemplatesFromModelStub.resolves({
        results: [
          {
            _id: projectTemplateId,
            name: projectTemplateName,
          },
        ],
      } as unknown as databaseTypes.IProject[]);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'queryProjectTemplates',
        queryProjectTemplatesFromModelStub
      );

      const templates = await projectTemplateService.getProjects(projectFilter);
      assert.isOk(templates![0]);
      assert.strictEqual(
        templates![0].name?.toString(),
        projectTemplateName.toString()
      );
      assert.isTrue(queryProjectTemplatesFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the templates cannot be found', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const projectFilter = {name: projectTemplateName};
      const errMessage = 'Cannot find the project';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        projectFilter
      );
      const getProjectTemplateFromModelStub = sandbox.stub();
      getProjectTemplateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'queryProjectTemplates',
        getProjectTemplateFromModelStub
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

      const projectTemplate = await projectTemplateService.getProjects(
        projectFilter
      );
      assert.notOk(projectTemplate);

      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const projectFilter = {name: projectTemplateName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getProjectTemplateByEmail'
      );
      const getProjectTemplateFromModelStub = sandbox.stub();
      getProjectTemplateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'queryProjectTemplates',
        getProjectTemplateFromModelStub
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
        await projectTemplateService.getProjects(projectFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('createTemplateFromProject', () => {
    it('will create a Project and attach to user and workspace models', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.resolves({
        _id: workspaceId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
      );

      const doc = await projectTemplateService.createProject(
        projectTemplateName,
        userId,
        workspaceId
      );

      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(updateWorkspaceStub.calledOnce);
      assert.isOk(doc.owner.templates);
      assert.isOk(doc.workspace.templates);
    });
    it('will create a Project and attach to user and workspace models when ownerId is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.resolves({
        _id: workspaceId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
      );

      const doc = await projectTemplateService.createProject(
        projectTemplateName,
        workspaceId,
        userId.toString(),
        userEmail
      );

      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(updateWorkspaceStub.calledOnce);
      assert.isOk(doc.owner.templates);
      assert.isOk(doc.workspace.templates);
    });
    it('will create a Project and attach to user and workspace models when workspaceId is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.resolves({
        _id: workspaceId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
      );

      const doc = await projectTemplateService.createProject(
        projectTemplateName,
        userId,
        workspaceId.toString()
      );

      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(updateWorkspaceStub.calledOnce);
      assert.isOk(doc.owner.templates);
      assert.isOk(doc.workspace.templates);
    });

    // projectTemplate model fails
    it('will publish and rethrow an DataValidationError when projectTemplate model throws it', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createProjectFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createProjectFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a UnexpectedError', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createProjectFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // user update fails
    it('will publish and rethrow an InvalidArgumentError when user model throws it', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when user model throws it', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when user model throws a DataOperationError', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.DatabaseOperationError(errMessage, '', '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // workspace update fails
    it('will publish and rethrow an InvalidArgumentError when workspace model throws it', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when workspace model throws it', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when workspace model throws a DataOperationError', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.DatabaseOperationError(errMessage, '', '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('cloneProjectFromTemplate', () => {
    it('will create a Project and attach to user and workspace models', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.resolves({
        _id: workspaceId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
      );

      const doc = await projectTemplateService.createProject(
        projectTemplateName,
        userId,
        workspaceId
      );

      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(updateWorkspaceStub.calledOnce);
      assert.isOk(doc.owner.templates);
      assert.isOk(doc.workspace.templates);
    });
    it('will create a Project and attach to user and workspace models when ownerId is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userEmail = 'tetsinguseremail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.resolves({
        _id: workspaceId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
      );

      const doc = await projectTemplateService.createProject(
        projectTemplateName,
        workspaceId,
        userId.toString(),
        userEmail
      );

      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(updateWorkspaceStub.calledOnce);
      assert.isOk(doc.owner.templates);
      assert.isOk(doc.workspace.templates);
    });
    it('will create a Project and attach to user and workspace models when workspaceId is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.resolves({
        _id: workspaceId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
      );

      const doc = await projectTemplateService.createProject(
        projectTemplateName,
        userId,
        workspaceId.toString()
      );

      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(updateWorkspaceStub.calledOnce);
      assert.isOk(doc.owner.templates);
      assert.isOk(doc.workspace.templates);
    });

    // projectTemplate model fails
    it('will publish and rethrow an DataValidationError when projectTemplate model throws it', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createProjectFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createProjectFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a UnexpectedError', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createProjectFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // user update fails
    it('will publish and rethrow an InvalidArgumentError when user model throws it', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when user model throws it', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when user model throws a DataOperationError', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.DatabaseOperationError(errMessage, '', '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // workspace update fails
    it('will publish and rethrow an InvalidArgumentError when workspace model throws it', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when workspace model throws it', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when workspace model throws a DataOperationError', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument error';
      const err = new error.DatabaseOperationError(errMessage, '', '');

      const createProjectFromModelStub = sandbox.stub();
      createProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        owner: {
          _id: userId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
        workspace: {
          _id: workspaceId,
          templates: [
            {_id: projectTemplateId} as unknown as databaseTypes.IProject,
          ],
        },
      } as unknown as databaseTypes.IProject);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProject',
        createProjectFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        templates: [{_id: projectTemplateId}],
      } as unknown as databaseTypes.IUser);

      sandbox.replace(
        dbConnection.models.UserModel,
        'addProjects',
        updateUserStub
      );

      const updateWorkspaceStub = sandbox.stub();
      updateWorkspaceStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'addProjects',
        updateWorkspaceStub
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
        await projectTemplateService.createProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('deactivate', () => {
    it('will update a templates view name', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        viewName: viewName,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.updateProjectView(
        projectTemplateId,
        viewName
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.viewName, viewName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will update a templates view name when the id is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        viewName: viewName,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.updateProjectView(
        projectTemplateId.toString(),
        viewName
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.viewName, viewName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'testViewName';
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'FileStats', []);
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateProjectTemplateById'
      );
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateProjectTemplate', () => {
    it('will update a templates view name', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        viewName: viewName,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.updateProjectView(
        projectTemplateId,
        viewName
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.viewName, viewName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will update a templates view name when the id is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        viewName: viewName,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.updateProjectView(
        projectTemplateId.toString(),
        viewName
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.viewName, viewName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'testViewName';
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'FileStats', []);
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateProjectTemplateById'
      );
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('addTags', () => {
    it('will add a tag to a projet template', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        viewName: viewName,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.updateProjectView(
        projectTemplateId,
        viewName
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.viewName, viewName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will add a tag to a project template when the tag._id is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        viewName: viewName,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.updateProjectView(
        projectTemplateId.toString(),
        viewName
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.viewName, viewName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'testViewName';
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'FileStats', []);
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateProjectTemplateById'
      );
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('removeTags', () => {
    it('will remove a tag from a project', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        viewName: viewName,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.updateProjectView(
        projectTemplateId,
        viewName
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.viewName, viewName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will remove a tag when the tag._id is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        viewName: viewName,
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.updateProjectView(
        projectTemplateId.toString(),
        viewName
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.viewName, viewName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'testViewName';
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'FileStats', []);
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const viewName = 'test view name';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateProjectTemplateById'
      );
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
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
        await projectTemplateService.updateProjectView(
          projectTemplateId,
          viewName
        );
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
