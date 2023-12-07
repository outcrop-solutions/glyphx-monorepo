// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import {fileStatsService} from '../../services';
import * as mocks from 'database/src/mongoose/mocks';

describe('#services/fileStats', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createFileStats', () => {
    it('will create a FileStats', async () => {
      const fileStatsId = new mongooseTypes.ObjectId();
      const idId = new mongooseTypes.ObjectId();
      const dataGridId = new mongooseTypes.ObjectId();

      // createFileStats
      const createFileStatsFromModelStub = sandbox.stub();
      createFileStatsFromModelStub.resolves({
        ...mocks.MOCK_FILESTATS,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IFileStats);

      sandbox.replace(dbConnection.models.FileStatsModel, 'createFileStats', createFileStatsFromModelStub);

      const doc = await fileStatsService.createFileStats({
        ...mocks.MOCK_FILESTATS,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IFileStats);

      assert.isTrue(createFileStatsFromModelStub.calledOnce);
    });
    // fileStats model fails
    it('will publish and rethrow an InvalidArgumentError when fileStats model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createFileStats
      const createFileStatsFromModelStub = sandbox.stub();
      createFileStatsFromModelStub.rejects(err);

      sandbox.replace(dbConnection.models.FileStatsModel, 'createFileStats', createFileStatsFromModelStub);

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
        await fileStatsService.createFileStats({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when fileStats model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createFileStats
      const createFileStatsFromModelStub = sandbox.stub();
      createFileStatsFromModelStub.rejects(err);

      sandbox.replace(dbConnection.models.FileStatsModel, 'createFileStats', createFileStatsFromModelStub);

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
        await fileStatsService.createFileStats({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when fileStats model throws it', async () => {
      const createFileStatsFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createFileStatsFromModelStub.rejects(err);

      sandbox.replace(dbConnection.models.FileStatsModel, 'createFileStats', createFileStatsFromModelStub);

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
        await fileStatsService.createFileStats({});
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when fileStats model throws a DataOperationError', async () => {
      const createFileStatsFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateCustomerPaymentById');

      createFileStatsFromModelStub.rejects(err);

      sandbox.replace(dbConnection.models.FileStatsModel, 'createFileStats', createFileStatsFromModelStub);

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
        await fileStatsService.createFileStats({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when fileStats model throws a UnexpectedError', async () => {
      const createFileStatsFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(errMessage, 'mongodDb');

      createFileStatsFromModelStub.rejects(err);

      sandbox.replace(dbConnection.models.FileStatsModel, 'createFileStats', createFileStatsFromModelStub);

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
        await fileStatsService.createFileStats({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getFileStats', () => {
    it('should get a fileStats by id', async () => {
      const fileStatsId = new mongooseTypes.ObjectId().toString();

      const getFileStatsFromModelStub = sandbox.stub();
      getFileStatsFromModelStub.resolves({
        _id: fileStatsId,
      } as unknown as databaseTypes.IFileStats);
      sandbox.replace(dbConnection.models.FileStatsModel, 'getFileStatsById', getFileStatsFromModelStub);

      const fileStats = await fileStatsService.getFileStat(fileStatsId);
      assert.isOk(fileStats);
      assert.strictEqual(fileStats?._id?.toString(), fileStatsId.toString());

      assert.isTrue(getFileStatsFromModelStub.calledOnce);
    });
    it('should get a fileStats by id when id is a string', async () => {
      const fileStatsId = new mongooseTypes.ObjectId();

      const getFileStatsFromModelStub = sandbox.stub();
      getFileStatsFromModelStub.resolves({
        _id: fileStatsId,
      } as unknown as databaseTypes.IFileStats);
      sandbox.replace(dbConnection.models.FileStatsModel, 'getFileStatsById', getFileStatsFromModelStub);

      const fileStats = await fileStatsService.getFileStat(fileStatsId.toString());
      assert.isOk(fileStats);
      assert.strictEqual(fileStats?._id?.toString(), fileStatsId.toString());

      assert.isTrue(getFileStatsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the fileStats cannot be found', async () => {
      const fileStatsId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(errMessage, 'fileStatsId', fileStatsId);
      const getFileStatsFromModelStub = sandbox.stub();
      getFileStatsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.FileStatsModel, 'getFileStatsById', getFileStatsFromModelStub);
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

      const fileStats = await fileStatsService.getFileStat(fileStatsId);
      assert.notOk(fileStats);

      assert.isTrue(getFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const fileStatsId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'getFileStatsById');
      const getFileStatsFromModelStub = sandbox.stub();
      getFileStatsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.FileStatsModel, 'getFileStatsById', getFileStatsFromModelStub);
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
        await fileStatsService.getFileStat(fileStatsId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getFileStats', () => {
    it('should get fileStats by filter', async () => {
      const fileStatsId = new mongooseTypes.ObjectId();
      const fileStatsId2 = new mongooseTypes.ObjectId();
      const fileStatsFilter = {_id: fileStatsId};

      const queryFileStatsFromModelStub = sandbox.stub();
      queryFileStatsFromModelStub.resolves({
        results: [
          {
            ...mocks.MOCK_FILESTATS,
            _id: fileStatsId,
          } as unknown as databaseTypes.IFileStats,
          {
            ...mocks.MOCK_FILESTATS,
            _id: fileStatsId2,
          } as unknown as databaseTypes.IFileStats,
        ],
      } as unknown as databaseTypes.IFileStats[]);

      sandbox.replace(dbConnection.models.FileStatsModel, 'queryFileStats', queryFileStatsFromModelStub);

      const fileStats = await fileStatsService.getFileStats(fileStatsFilter);
      assert.isOk(fileStats![0]);
      assert.strictEqual(fileStats![0]._id?.toString(), fileStatsId.toString());
      assert.isTrue(queryFileStatsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the fileStats cannot be found', async () => {
      const fileStatsName = 'fileStatsName1';
      const fileStatsFilter = {name: fileStatsName};
      const errMessage = 'Cannot find the fileStats';
      const err = new error.DataNotFoundError(errMessage, 'name', fileStatsFilter);
      const getFileStatsFromModelStub = sandbox.stub();
      getFileStatsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.FileStatsModel, 'queryFileStats', getFileStatsFromModelStub);
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

      const fileStats = await fileStatsService.getFileStats(fileStatsFilter);
      assert.notOk(fileStats);

      assert.isTrue(getFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const fileStatsName = 'fileStatsName1';
      const fileStatsFilter = {name: fileStatsName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'getFileStatsByEmail');
      const getFileStatsFromModelStub = sandbox.stub();
      getFileStatsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.FileStatsModel, 'queryFileStats', getFileStatsFromModelStub);
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
        await fileStatsService.getFileStats(fileStatsFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateFileStats', () => {
    it('will update a fileStats', async () => {
      const fileStatsId = new mongooseTypes.ObjectId().toString();
      const updateFileStatsFromModelStub = sandbox.stub();
      updateFileStatsFromModelStub.resolves({
        ...mocks.MOCK_FILESTATS,
        deletedAt: new Date(),
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IFileStats);
      sandbox.replace(dbConnection.models.FileStatsModel, 'updateFileStatsById', updateFileStatsFromModelStub);

      const fileStats = await fileStatsService.updateFileStats(fileStatsId, {
        deletedAt: new Date(),
      });
      assert.isOk(fileStats);
      assert.strictEqual(fileStats.id, 'id');
      assert.isOk(fileStats.deletedAt);
      assert.isTrue(updateFileStatsFromModelStub.calledOnce);
    });
    it('will update a fileStats when the id is a string', async () => {
      const fileStatsId = new mongooseTypes.ObjectId();
      const updateFileStatsFromModelStub = sandbox.stub();
      updateFileStatsFromModelStub.resolves({
        ...mocks.MOCK_FILESTATS,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
      } as unknown as databaseTypes.IFileStats);
      sandbox.replace(dbConnection.models.FileStatsModel, 'updateFileStatsById', updateFileStatsFromModelStub);

      const fileStats = await fileStatsService.updateFileStats(fileStatsId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(fileStats);
      assert.strictEqual(fileStats.id, 'id');
      assert.isOk(fileStats.deletedAt);
      assert.isTrue(updateFileStatsFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when fileStats model throws it ', async () => {
      const fileStatsId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateFileStatsFromModelStub = sandbox.stub();
      updateFileStatsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.FileStatsModel, 'updateFileStatsById', updateFileStatsFromModelStub);

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
        await fileStatsService.updateFileStats(fileStatsId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when fileStats model throws it ', async () => {
      const fileStatsId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateFileStatsFromModelStub = sandbox.stub();
      updateFileStatsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.FileStatsModel, 'updateFileStatsById', updateFileStatsFromModelStub);

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
        await fileStatsService.updateFileStats(fileStatsId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when fileStats model throws a DataOperationError ', async () => {
      const fileStatsId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateFileStatsById');
      const updateFileStatsFromModelStub = sandbox.stub();
      updateFileStatsFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.FileStatsModel, 'updateFileStatsById', updateFileStatsFromModelStub);

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
        await fileStatsService.updateFileStats(fileStatsId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateFileStatsFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
