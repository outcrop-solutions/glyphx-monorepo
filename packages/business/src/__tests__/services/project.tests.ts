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
import {projectService} from '../../services';

describe('#services/project', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
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
  context('getProjectFileStats', () => {
    it("should get a project's file stats by id", async () => {
      const projectId = new mongooseTypes.ObjectId();
      const fileStats: fileIngestionTypes.IFileStats = {
        fileName: 'testFile',
        tableName: 'testTable',
        numberOfRows: 10,
        numberOfColumns: 5,
        columns: [],
        fileSize: 1000,
      };
      const getProjectFromModelStub = sandbox.stub();
      getProjectFromModelStub.resolves({
        _id: projectId,
        files: [fileStats],
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'getProjectById',
        getProjectFromModelStub
      );

      const projectFileStats = await projectService.getProjectFileStats(
        projectId
      );
      assert.isOk(projectFileStats);
      assert.strictEqual(projectFileStats[0].fileName, fileStats.fileName);

      assert.isTrue(getProjectFromModelStub.calledOnce);
    });
    it("should get a project's file stats returning an empty array if the stats do not exist", async () => {
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

      const projectFileStats = await projectService.getProjectFileStats(
        projectId
      );
      assert.isOk(projectFileStats);
      assert.isArray(projectFileStats);
      assert.strictEqual(projectFileStats.length, 0);

      assert.isTrue(getProjectFromModelStub.calledOnce);
    });
  });
  context('updateProjectFileStats', () => {
    it('will update a projects file stats', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const fileStats: fileIngestionTypes.IFileStats = {
        fileName: 'testFile',
        tableName: 'testTable',
        numberOfRows: 10,
        numberOfColumns: 5,
        columns: [],
        fileSize: 1000,
      };
      const updateProjectFromModelStub = sandbox.stub();
      updateProjectFromModelStub.resolves({
        _id: projectId,
        files: [fileStats],
      } as unknown as databaseTypes.IProject);
      sandbox.replace(
        dbConnection.models.ProjectModel,
        'updateProjectById',
        updateProjectFromModelStub
      );

      const project = await projectService.updateProjectFileStats(projectId, [
        fileStats,
      ]);
      assert.isOk(project);
      assert.strictEqual(project._id, projectId);
      assert.strictEqual(project.files[0].fileName, fileStats.fileName);

      assert.isTrue(updateProjectFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when project model throws it ', async () => {
      const projectId = new mongooseTypes.ObjectId();
      const fileStats: fileIngestionTypes.IFileStats = {
        fileName: 'testFile',
        tableName: 'testTable',
        numberOfRows: 10,
        numberOfColumns: 5,
        columns: [],
        fileSize: 1000,
      };
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'FileStats', []);
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
        await projectService.updateProjectFileStats(projectId, [fileStats]);
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
      const fileStats: fileIngestionTypes.IFileStats = {
        fileName: 'testFile',
        tableName: 'testTable',
        numberOfRows: 10,
        numberOfColumns: 5,
        columns: [],
        fileSize: 1000,
      };
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
        await projectService.updateProjectFileStats(projectId, [fileStats]);
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
      const fileStats: fileIngestionTypes.IFileStats = {
        fileName: 'testFile',
        tableName: 'testTable',
        numberOfRows: 10,
        numberOfColumns: 5,
        columns: [],
        fileSize: 1000,
      };
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
        await projectService.updateProjectFileStats(projectId, [fileStats]);
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
