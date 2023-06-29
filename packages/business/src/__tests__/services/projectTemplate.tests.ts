import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from '@glyphx/database';
import {error} from '@glyphx/core';
import {projectTemplateService} from '../../services';

describe.only('#services/projectTemplate', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });

  context.only('getProjectTemplate', () => {
    it('should get a projectTemplate by id', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();

      const getProjectTemplateFromModelStub = sandbox.stub();
      getProjectTemplateFromModelStub.resolves({
        _id: projectTemplateId,
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateFromModelStub
      );

      const projectTemplate = await projectTemplateService.getProjectTemplate(
        projectTemplateId
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(
        projectTemplate?._id?.toString(),
        projectTemplateId.toString()
      );

      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
    });
    it('should get a projectTemplate by id when id is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();

      const getProjectTemplateFromModelStub = sandbox.stub();
      getProjectTemplateFromModelStub.resolves({
        _id: projectTemplateId,
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateFromModelStub
      );

      const projectTemplate = await projectTemplateService.getProjectTemplate(
        projectTemplateId.toString()
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(
        projectTemplate?._id?.toString(),
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
        await projectTemplateService.getProjectTemplate(projectTemplateId);
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
      } as unknown as databaseTypes.IProjectTemplate[]);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'queryProjectTemplates',
        queryProjectTemplatesFromModelStub
      );

      const templates = await projectTemplateService.getProjectTemplates(
        projectFilter
      );
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

      const projectTemplate = await projectTemplateService.getProjectTemplates(
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
        await projectTemplateService.getProjectTemplates(projectFilter);
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
    it('will create a ProjectTemplate from a Project', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const projectId = new mongooseTypes.ObjectId();

      const createProjectTemplateFromModelStub = sandbox.stub();
      createProjectTemplateFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
      } as unknown as databaseTypes.IProjectTemplate);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
      );

      await projectTemplateService.createTemplateFromProject(projectId);

      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
    });
    it('will create a ProjectTemplate projectId is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const projectId = new mongooseTypes.ObjectId();

      const createProjectTemplateFromModelStub = sandbox.stub();
      createProjectTemplateFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
      } as unknown as databaseTypes.IProjectTemplate);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
      );

      await projectTemplateService.createTemplateFromProject(projectId);

      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
    });

    // projectTemplate model fails
    it('will publish and rethrow an DataValidationError when projectTemplate model throws it', async () => {
      const projectId = new mongooseTypes.ObjectId();

      const createProjectTemplateFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createProjectTemplateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
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
        await projectTemplateService.createTemplateFromProject(projectId);
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const createProjectTemplateFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createProjectTemplateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
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
        await projectTemplateService.createTemplateFromProject(projectId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a UnexpectedError', async () => {
      const projectId = new mongooseTypes.ObjectId();

      const createProjectTemplateFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createProjectTemplateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
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
        await projectTemplateService.createTemplateFromProject(projectId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('cloneProjectFromTemplate', () => {
    it('will create a Project and attach to Template', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';

      const cloneProjectFromTemplateFromModelStub = sandbox.stub();
      cloneProjectFromTemplateFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
      } as unknown as databaseTypes.IProjectTemplate);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        cloneProjectFromTemplateFromModelStub
      );

      await projectTemplateService.createTemplateFromProject(projectId);

      assert.isTrue(cloneProjectFromTemplateFromModelStub.calledOnce);
    });
    it('will create a Project when projectTemplateId is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const projectId = new mongooseTypes.ObjectId();

      const createProjectTemplateFromModelStub = sandbox.stub();
      createProjectTemplateFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
      } as unknown as databaseTypes.IProjectTemplate);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
      );

      await projectTemplateService.createTemplateFromProject(projectId);

      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
    });
    it('will create a Project and attach to user and workspace models when workspaceId is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const projectId = new mongooseTypes.ObjectId();

      const createProjectTemplateFromModelStub = sandbox.stub();
      createProjectTemplateFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
      } as unknown as databaseTypes.IProjectTemplate);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
      );

      await projectTemplateService.createTemplateFromProject(projectId);

      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
    });

    // projectTemplate model fails
    it('will publish and rethrow an DataValidationError when projectTemplate model throws it', async () => {
      const projectId = new mongooseTypes.ObjectId();

      const createProjectTemplateFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createProjectTemplateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
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
        await projectTemplateService.createTemplateFromProject(projectId);
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError', async () => {
      const projectId = new mongooseTypes.ObjectId();

      const createProjectTemplateFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createProjectTemplateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
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
        await projectTemplateService.createTemplateFromProject(projectId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a UnexpectedError', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();

      const createProjectTemplateFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createProjectTemplateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
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
        await projectTemplateService.createTemplateFromProject(
          projectTemplateName,
          userId,
          workspaceId
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('deactivate', () => {
    it('will deactivate a template', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();

      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.deactivate(
        projectTemplateId
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.isOk(projectTemplate.deletedAt);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will deactivate template when the id is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.deactivate(
        projectTemplateId.toString()
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.isOk(projectTemplate.deletedAt);

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
        await projectTemplateService.deactivate(projectTemplateId, viewName);
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
        await projectTemplateService.deactivate(projectTemplateId);
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
        await projectTemplateService.deactivate(projectTemplateId);
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
    it('will update a templates name', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projName = 'test name';
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        viewName: projName,
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate =
        await projectTemplateService.updateProjectTemplate(projectTemplateId, {
          name: projName,
        });
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.name, projName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will update a templates name when the id is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projName = 'test name';
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        name: projName,
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate =
        await projectTemplateService.updateProjectTemplate(
          projectTemplateId.toString(),
          {name: projName}
        );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.name, projName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projName = 'testName';
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
        await projectTemplateService.updateProjectTemplate(projectTemplateId, {
          name: projName,
        });
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
      const projName = 'test name';
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
        await projectTemplateService.updateProjectTemplate(projectTemplateId, {
          name: projName,
        });
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
      const projName = 'test view name';
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
        await projectTemplateService.updateProjectTemplate(projectTemplateId, {
          name: projName,
        });
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
    it('will add a tag to a project template', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const tagId = new mongooseTypes.ObjectId();
      const tags = [tagId];
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        tags: tags,
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.addTags(
        projectTemplateId,
        tags
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      // assert.strictEqual(projectTemplate.tags[0], tags[0]);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will add a tag to a project template when the tags ar Ids', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const tagId = new mongooseTypes.ObjectId();
      const tags = [tagId];
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        tags: tags,
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.addTags(
        projectTemplateId.toString(),
        tags
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      // assert.strictEqual(projectTemplate.tags, tags);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const tagId = new mongooseTypes.ObjectId();
      const tags = [tagId];
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
        await projectTemplateService.addTags(projectTemplateId, tags);
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
      const tagId = new mongooseTypes.ObjectId();
      const tags = [tagId];
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
        await projectTemplateService.addTags(projectTemplateId, tags);
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
      const tagId = new mongooseTypes.ObjectId();
      const tags = [tagId];
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
        await projectTemplateService.addTags(projectTemplateId, tags);
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
      const tagId = new mongooseTypes.ObjectId();
      const tags = [tagId];
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        viewName: tags,
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.removeTags(
        projectTemplateId,
        tags
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      // assert.strictEqual(projectTemplate.tags, tags);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will remove a tag when the tag._id is a string', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const tagId = new mongooseTypes.ObjectId();
      const tags = [tagId];
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectTemplateId,
        tags: tags,
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
      );

      const projectTemplate = await projectTemplateService.removeTags(
        projectTemplateId.toString(),
        tags
      );
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      // assert.strictEqual(projectTemplate.tags, tags);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const tagId = new mongooseTypes.ObjectId();
      const tags = [tagId];
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
        await projectTemplateService.removeTags(projectTemplateId, tags);
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
      const tagId = new mongooseTypes.ObjectId();
      const tags = [tagId];
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
        await projectTemplateService.removeTags(projectTemplateId, tags);
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
      const tagId = new mongooseTypes.ObjectId();
      const tags = [tagId];
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
        await projectTemplateService.removeTags(projectTemplateId, tags);
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
