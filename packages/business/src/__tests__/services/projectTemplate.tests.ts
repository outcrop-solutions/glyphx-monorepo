import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import {projectTemplateService} from '../../services';
import {ProjectTemplateService} from 'services/projectTemplate';
import {webTypes, fileIngestionTypes} from 'types';

describe('#services/projectTemplate', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });

  context('getProjectTemplate', () => {
    it('should get a projectTemplate by id', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();

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
    it('should get a projectTemplate by id when id is a string', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();

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
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(errMessage, 'projectTemplateId', projectTemplateId);
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

      const projectTemplate = await projectTemplateService.getProjectTemplate(projectTemplateId.toString());
      assert.notOk(projectTemplate);

      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'getProjectTemplateById');
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
        await projectTemplateService.getProjectTemplate(projectTemplateId.toString());
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
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      const templates = await projectTemplateService.getProjectTemplates(projectFilter);
      assert.isOk(templates![0]);
      assert.strictEqual(templates![0].name?.toString(), projectTemplateName.toString());
      assert.isTrue(queryProjectTemplatesFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the templates cannot be found', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const projectFilter = {name: projectTemplateName};
      const errMessage = 'Cannot find the project';
      const err = new error.DataNotFoundError(errMessage, 'name', projectFilter);
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

      const projectTemplate = await projectTemplateService.getProjectTemplates(projectFilter);
      assert.notOk(projectTemplate);

      assert.isTrue(getProjectTemplateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const projectTemplateName = 'projectTemplateName1';
      const projectFilter = {name: projectTemplateName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'getProjectTemplateByEmail');
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
  context('createProjectTemplate', () => {
    it('will create a ProjectTemplate', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const projectTemplateDesc = 'projectTemplateName1';
      const properties = {
        X: {
          axis: webTypes.constants.AXIS.X,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column X', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        Y: {
          axis: webTypes.constants.AXIS.Y,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column Y', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        Z: {
          axis: webTypes.constants.AXIS.Z,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column Z', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        A: {
          axis: webTypes.constants.AXIS.A,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 1', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        B: {
          axis: webTypes.constants.AXIS.B,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 2', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        C: {
          axis: webTypes.constants.AXIS.C,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 3', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
      };

      const createProjectTemplateFromModelStub = sandbox.stub();
      createProjectTemplateFromModelStub.resolves({
        _id: projectTemplateId,
        name: projectTemplateName,
        description: projectTemplateDesc,
        properties,
      } as unknown as databaseTypes.IProjectTemplate);

      sandbox.replace(dbConnection.models.ProjectTemplateModel, 'create', createProjectTemplateFromModelStub);

      await projectTemplateService.createProjectTemplate(
        projectTemplateId.toString(),
        projectTemplateName,
        projectTemplateDesc,
        properties
      );

      assert.isTrue(createProjectTemplateFromModelStub.calledOnce);
    });

    // project model fails
    it('will log the failure and return null if the projectTemplate cannot be found', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const projectTemplateDesc = 'projectTemplateName1';
      const properties = {
        X: {
          axis: webTypes.constants.AXIS.X,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column X', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        Y: {
          axis: webTypes.constants.AXIS.Y,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column Y', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        Z: {
          axis: webTypes.constants.AXIS.Z,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column Z', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        A: {
          axis: webTypes.constants.AXIS.A,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 1', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        B: {
          axis: webTypes.constants.AXIS.B,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 2', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        C: {
          axis: webTypes.constants.AXIS.C,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 3', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
      };
      const errMessage = 'Cannot find the project';
      const err = new error.DataNotFoundError(errMessage, 'projectTemplateId', projectTemplateId);

      const createProjectTemplateFromModelStub = sandbox.stub();
      createProjectTemplateFromModelStub.rejects(err);

      sandbox.replace(dbConnection.models.ProjectTemplateModel, 'create', createProjectTemplateFromModelStub);

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

      const projectTemplate = await projectTemplateService.createProjectTemplate(
        projectTemplateId.toString(),
        projectTemplateName,
        projectTemplateDesc,
        properties
      );

      assert.notOk(projectTemplate);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const projectTemplateName = 'projectTemplateName1';
      const projectTemplateDesc = 'projectTemplateName1';
      const properties = {
        X: {
          axis: webTypes.constants.AXIS.X,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column X', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        Y: {
          axis: webTypes.constants.AXIS.Y,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column Y', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        Z: {
          axis: webTypes.constants.AXIS.Z,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column Z', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        A: {
          axis: webTypes.constants.AXIS.A,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 1', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        B: {
          axis: webTypes.constants.AXIS.B,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 2', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        C: {
          axis: webTypes.constants.AXIS.C,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 3', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
      };

      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'getProjectTemplateById');

      const createProjectTemplateFromModelStub = sandbox.stub();
      createProjectTemplateFromModelStub.rejects(err);

      sandbox.replace(dbConnection.models.ProjectTemplateModel, 'create', createProjectTemplateFromModelStub);

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
          projectTemplateId.toString(),
          projectTemplateName,
          projectTemplateDesc,
          properties
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('deactivate', () => {
    it('will deactivate a template', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();

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

      const projectTemplate = await projectTemplateService.deactivate(projectTemplateId.toString());
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.isOk(projectTemplate.deletedAt);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will deactivate template when the id is a string', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      const projectTemplate = await projectTemplateService.deactivate(projectTemplateId.toString());
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.isOk(projectTemplate.deletedAt);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it ', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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
        await projectTemplateService.deactivate(projectTemplateId.toString());
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when projectTemplate model throws it ', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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
        await projectTemplateService.deactivate(projectTemplateId.toString());
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError ', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateProjectTemplateById');
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
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
        await projectTemplateService.deactivate(projectTemplateId.toString());
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
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      const projectTemplate = await projectTemplateService.updateProjectTemplate(projectTemplateId.toString(), {
        name: projName,
      });
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.name, projName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will update a templates name when the id is a string', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      const projectTemplate = await projectTemplateService.updateProjectTemplate(projectTemplateId.toString(), {
        name: projName,
      });
      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      assert.strictEqual(projectTemplate.name, projName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it ', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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
        await projectTemplateService.updateProjectTemplate(projectTemplateId.toString(), {
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
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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
        await projectTemplateService.updateProjectTemplate(projectTemplateId.toString(), {
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
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const projName = 'test view name';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateProjectTemplateById');
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ProjectTemplateModel,
        'updateProjectTemplateById',
        updateProjectFromModelStub
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
        await projectTemplateService.updateProjectTemplate(projectTemplateId.toString(), {
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
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tagId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tags = [tagId.toString()];

      const addTagsFromModelStub = sandbox.stub();
      addTagsFromModelStub.resolves({
        _id: projectTemplateId,
        tags: tags,
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(dbConnection.models.ProjectTemplateModel, 'addTags', addTagsFromModelStub);

      const projectTemplate = await projectTemplateService.addTags(projectTemplateId.toString(), tags);

      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      // assert.strictEqual(projectTemplate.tags[0], tags[0]);

      assert.isTrue(addTagsFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it ', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tagId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tags = [tagId.toString()];
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'FileStats', []);

      const addTagsFromModelStub = sandbox.stub();
      addTagsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.ProjectTemplateModel, 'addTags', addTagsFromModelStub);

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
        await projectTemplateService.addTags(projectTemplateId.toString(), tags);
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(addTagsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when projectTemplate model throws it ', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tagId = new mongooseTypes.ObjectId().toString();
      const tags = [tagId];
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});

      const addTagsFromModelStub = sandbox.stub();
      addTagsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.ProjectTemplateModel, 'addTags', addTagsFromModelStub);

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
        await projectTemplateService.addTags(projectTemplateId.toString(), tags);
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(addTagsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError ', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tagId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tags = [tagId.toString()];
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'addTags');

      const addTagsFromModelStub = sandbox.stub();
      addTagsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.ProjectTemplateModel, 'addTags', addTagsFromModelStub);

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
        await projectTemplateService.addTags(projectTemplateId.toString(), tags);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(addTagsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('removeTags', () => {
    it('will add a tag to a project template', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tagId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tags = [tagId.toString()];

      const removeTagsFromModelStub = sandbox.stub();
      removeTagsFromModelStub.resolves({
        _id: projectTemplateId,
        tags: tags,
      } as unknown as databaseTypes.IProjectTemplate);
      sandbox.replace(dbConnection.models.ProjectTemplateModel, 'removeTags', removeTagsFromModelStub);

      const projectTemplate = await projectTemplateService.removeTags(projectTemplateId.toString(), tags);

      assert.isOk(projectTemplate);
      assert.strictEqual(projectTemplate._id, projectTemplateId);
      // assert.strictEqual(projectTemplate.tags[0], tags[0]);

      assert.isTrue(removeTagsFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when projectTemplate model throws it ', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tagId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tags = [tagId.toString()];
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'FileStats', []);

      const removeTagsFromModelStub = sandbox.stub();
      removeTagsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.ProjectTemplateModel, 'removeTags', removeTagsFromModelStub);

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
        await projectTemplateService.removeTags(projectTemplateId.toString(), tags);
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(removeTagsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when projectTemplate model throws it ', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tagId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tags = [tagId.toString()];
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});

      const removeTagsFromModelStub = sandbox.stub();
      removeTagsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.ProjectTemplateModel, 'removeTags', removeTagsFromModelStub);

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
        await projectTemplateService.removeTags(projectTemplateId.toString(), tags);
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(removeTagsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when projectTemplate model throws a DataOperationError ', async () => {
      const projectTemplateId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tagId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const tags = [tagId.toString()];
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'removeTags');

      const removeTagsFromModelStub = sandbox.stub();
      removeTagsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.ProjectTemplateModel, 'removeTags', removeTagsFromModelStub);

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
        await projectTemplateService.removeTags(projectTemplateId.toString(), tags);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(removeTagsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
