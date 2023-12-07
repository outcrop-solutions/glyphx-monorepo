// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { projectTemplateService} from '../../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/projectTemplate', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createProjectTemplate', () => {
    it('will create a ProjectTemplate', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const idId = new mongooseTypes.ObjectId();
      const projectsId = new mongooseTypes.ObjectId();
      const tagsId = new mongooseTypes.ObjectId();
      const shapeId = new mongooseTypes.ObjectId();

      // createProjectTemplate
      const createProjectTemplateFromModelStub = sandbox.stub();
      createProjectTemplateFromModelStub.resolves({
         ...mocks.MOCK_PROJECTTEMPLATE,
        _id: new mongooseTypes.ObjectId(),
        projects: [],
                tags: [],
              } as unknown as databaseTypes.IProjectTemplate);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
      );

      const doc = await projectTemplateService.createProjectTemplate(
       {
         ...mocks.MOCK_PROJECTTEMPLATE,
        _id: new mongooseTypes.ObjectId(),
        projects: [],
                tags: [],
              } as unknown as databaseTypes.IProjectTemplate
      );

      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
    });
    // projectTemplate model fails
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createProjectTemplate
      const createProjectTemplateFromModelStub = sandbox.stub();
      createProjectTemplateFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
      );


      function fakePublish() {
        
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
        await projectTemplateService.createProjectTemplate(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when projectTemplate model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createProjectTemplate
      const createProjectTemplateFromModelStub = sandbox.stub();
      createProjectTemplateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
      );
      
      function fakePublish() {
        
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
        await projectTemplateService.createProjectTemplate(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when projectTemplate model throws it', async () => {
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
        await projectTemplateService.createProjectTemplate(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError', async () => {
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
        await projectTemplateService.createProjectTemplate(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a UnexpectedError', async () => {
      const createProjectTemplateFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createProjectTemplateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'createProjectTemplate',
        createProjectTemplateFromModelStub
      );

      function fakePublish() {
        
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
        await projectTemplateService.createProjectTemplate(
          {}
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
  context('getProjectTemplate', () => {
    it('should get a projectTemplate by id', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId().toString();

      const getProjectTemplateFromModelStub = sandbox.stub();
      getProjectTemplateFromModelStub.resolves({
        _id: projectTemplateId,
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateFromModelStub
      );

      const projectTemplate = await projectTemplateService.getProjectTemplate(projectTemplateId);
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate?._id?.toString(), projectTemplateId.toString());

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

      const projectTemplate = await projectTemplateService.getProjectTemplate(projectTemplateId.toString());
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate?._id?.toString(), projectTemplateId.toString());

      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the projectTemplate cannot be found', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId().toString();
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
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const projectTemplate = await projectTemplateService.getProjectTemplate(projectTemplateId);
      assert.notOk(projectTemplate);

      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId().toString();
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
    it('should get projectTemplates by filter', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId();
      const projectTemplateId2 = new mongooseTypes.ObjectId();
      const projectTemplateFilter = {_id: projectTemplateId};

      const queryProjectTemplatesFromModelStub = sandbox.stub();
      queryProjectTemplatesFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_PROJECTTEMPLATE,
        _id: projectTemplateId,
        projects: [],
                tags: [],
                } as unknown as databaseTypes.IProjectTemplate,
        {
         ...mocks.MOCK_PROJECTTEMPLATE,
        _id: projectTemplateId2,
        projects: [],
                tags: [],
                } as unknown as databaseTypes.IProjectTemplate
        ],
      } as unknown as databaseTypes.IProjectTemplate[]);

      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'queryProjectTemplates',
        queryProjectTemplatesFromModelStub
      );

      const projectTemplates = await projectTemplateService.getProjectTemplates(projectTemplateFilter);
      assert.isOk(projectTemplates![0]);
      assert.strictEqual(projectTemplates![0]._id?.toString(), projectTemplateId.toString());
      assert.isTrue(queryProjectTemplatesFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the projectTemplates cannot be found', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const projectTemplateFilter = {name: projectTemplateName};
      const errMessage = 'Cannot find the projectTemplate';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        projectTemplateFilter
      );
      const getProjectTemplateFromModelStub = sandbox.stub();
      getProjectTemplateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'queryProjectTemplates',
        getProjectTemplateFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const projectTemplate = await projectTemplateService.getProjectTemplates(projectTemplateFilter);
      assert.notOk(projectTemplate);

      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const projectTemplateFilter = {name: projectTemplateName};
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
        await projectTemplateService.getProjectTemplates(projectTemplateFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateProjectTemplate', () => {
    it('will update a projectTemplate', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId().toString();
      const updateProjectTemplateFromModelStub = sandbox.stub();
      updateProjectTemplateFromModelStub.resolves({
         ...mocks.MOCK_PROJECTTEMPLATE,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        projects: [],
                tags: [],
              } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectTemplateFromModelStub
      );

      const projectTemplate = await projectTemplateService.updateProjectTemplate(projectTemplateId, {
        deletedAt: new Date(),
      });
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate.id, 'id');
      assert.isOk(projectTemplate.deletedAt);
      assert.isTrue(updateProjectTemplateFromModelStub.calledOnce);
    });
    it('will update a projectTemplate when the id is a string', async () => {
     const projectTemplateId = new mongooseTypes.ObjectId();
      const updateProjectTemplateFromModelStub = sandbox.stub();
      updateProjectTemplateFromModelStub.resolves({
         ...mocks.MOCK_PROJECTTEMPLATE,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        projects: [],
                tags: [],
              } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectTemplateFromModelStub
      );

      const projectTemplate = await projectTemplateService.updateProjectTemplate(projectTemplateId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate.id, 'id');
      assert.isOk(projectTemplate.deletedAt);
      assert.isTrue(updateProjectTemplateFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateProjectTemplateFromModelStub = sandbox.stub();
      updateProjectTemplateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectTemplateFromModelStub
      );

      function fakePublish() {
        
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
        await projectTemplateService.updateProjectTemplate(projectTemplateId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when projectTemplate model throws it ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateProjectTemplateFromModelStub = sandbox.stub();
      updateProjectTemplateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectTemplateFromModelStub
      );

      function fakePublish() {
        
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
        await projectTemplateService.updateProjectTemplate(projectTemplateId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError ', async () => {
      const projectTemplateId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateProjectTemplateById'
      );
      const updateProjectTemplateFromModelStub = sandbox.stub();
      updateProjectTemplateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectTemplateFromModelStub
      );

      function fakePublish() {
        
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
        await projectTemplateService.updateProjectTemplate(projectTemplateId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
