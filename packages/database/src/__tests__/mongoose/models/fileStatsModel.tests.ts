// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {FileStatsModel} from '../../../mongoose/models/fileStats';
import * as mocks from '../../../mongoose/mocks';
// eslint-disable-next-line import/no-duplicates
import {IQueryResult, databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/fileStats', () => {
  context('fileStatsIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the fileStatsId exists', async () => {
      const fileStatsId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: fileStatsId});
      sandbox.replace(FileStatsModel, 'findById', findByIdStub);

      const result = await FileStatsModel.fileStatsIdExists(fileStatsId);

      assert.isTrue(result);
    });

    it('should return false if the fileStatsId does not exist', async () => {
      const fileStatsId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(FileStatsModel, 'findById', findByIdStub);

      const result = await FileStatsModel.fileStatsIdExists(fileStatsId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const fileStatsId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(FileStatsModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await FileStatsModel.fileStatsIdExists(fileStatsId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allFileStatsIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the fileStats ids exist', async () => {
      const fileStatsIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedFileStatsIds = fileStatsIds.map((fileStatsId) => {
        return {
          _id: fileStatsId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedFileStatsIds);
      sandbox.replace(FileStatsModel, 'find', findStub);

      assert.isTrue(await FileStatsModel.allFileStatsIdsExist(fileStatsIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const fileStatsIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedFileStatsIds = [
        {
          _id: fileStatsIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedFileStatsIds);
      sandbox.replace(FileStatsModel, 'find', findStub);
      let errored = false;
      try {
        await FileStatsModel.allFileStatsIdsExist(fileStatsIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(err.data.value[0].toString(), fileStatsIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const fileStatsIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(FileStatsModel, 'find', findStub);
      let errored = false;
      try {
        await FileStatsModel.allFileStatsIdsExist(fileStatsIds);
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
      let errored = false;

      try {
        await FileStatsModel.validateUpdateObject(
          mocks.MOCK_FILESTATS as unknown as Omit<Partial<databaseTypes.IFileStats>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      let errored = false;

      try {
        await FileStatsModel.validateUpdateObject(
          mocks.MOCK_FILESTATS as unknown as Omit<Partial<databaseTypes.IFileStats>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will fail when trying to update the _id', async () => {
      let errored = false;

      try {
        await FileStatsModel.validateUpdateObject({
          ...mocks.MOCK_FILESTATS,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IFileStats>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      let errored = false;

      try {
        await FileStatsModel.validateUpdateObject({...mocks.MOCK_FILESTATS, createdAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IFileStats>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      let errored = false;

      try {
        await FileStatsModel.validateUpdateObject({...mocks.MOCK_FILESTATS, updatedAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IFileStats>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createFileStats', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a fileStats document', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(FileStatsModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(FileStatsModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(FileStatsModel, 'getFileStatsById', stub);

      const fileStatsDocument = await FileStatsModel.createFileStats(mocks.MOCK_FILESTATS);

      assert.strictEqual(fileStatsDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(FileStatsModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(FileStatsModel, 'create', sandbox.stub().rejects('oops, something bad has happened'));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(FileStatsModel, 'getFileStatsById', stub);
      let hasError = false;
      try {
        await FileStatsModel.createFileStats(mocks.MOCK_FILESTATS);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(FileStatsModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(FileStatsModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(FileStatsModel, 'getFileStatsById', stub);

      let hasError = false;
      try {
        await FileStatsModel.createFileStats(mocks.MOCK_FILESTATS);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(FileStatsModel, 'validate', sandbox.stub().rejects('oops an error has occurred'));
      sandbox.replace(FileStatsModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(FileStatsModel, 'getFileStatsById', stub);
      let hasError = false;
      try {
        await FileStatsModel.createFileStats(mocks.MOCK_FILESTATS);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getFileStatsById', () => {
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

    it('will retreive a fileStats document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_FILESTATS));
      sandbox.replace(FileStatsModel, 'findById', findByIdStub);

      const doc = await FileStatsModel.getFileStatsById(mocks.MOCK_FILESTATS._id as mongoose.Types.ObjectId);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_FILESTATS._id);
    });

    it('will throw a DataNotFoundError when the fileStats does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(FileStatsModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await FileStatsModel.getFileStatsById(mocks.MOCK_FILESTATS._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(FileStatsModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await FileStatsModel.getFileStatsById(mocks.MOCK_FILESTATS._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryFileStats', () => {
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

    const mockFileStats = [
      {
        ...mocks.MOCK_FILESTATS,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IFileStats,
      {
        ...mocks.MOCK_FILESTATS,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IFileStats,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered fileStats', async () => {
      sandbox.replace(FileStatsModel, 'count', sandbox.stub().resolves(mockFileStats.length));

      sandbox.replace(FileStatsModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockFileStats)));

      const results = await FileStatsModel.queryFileStats({});

      assert.strictEqual(results.numberOfItems, mockFileStats.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockFileStats.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(FileStatsModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(FileStatsModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockFileStats)));

      let errored = false;
      try {
        await FileStatsModel.queryFileStats();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(FileStatsModel, 'count', sandbox.stub().resolves(mockFileStats.length));

      sandbox.replace(FileStatsModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockFileStats)));

      let errored = false;
      try {
        await FileStatsModel.queryFileStats({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(FileStatsModel, 'count', sandbox.stub().resolves(mockFileStats.length));

      sandbox.replace(
        FileStatsModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await FileStatsModel.queryFileStats({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateFileStatsById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a fileStats', async () => {
      const updateFileStats = {
        ...mocks.MOCK_FILESTATS,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IFileStats;

      const fileStatsId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(FileStatsModel, 'updateOne', updateStub);

      const getFileStatsStub = sandbox.stub();
      getFileStatsStub.resolves({_id: fileStatsId});
      sandbox.replace(FileStatsModel, 'getFileStatsById', getFileStatsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(FileStatsModel, 'validateUpdateObject', validateStub);

      const result = await FileStatsModel.updateFileStatsById(fileStatsId, updateFileStats);

      assert.strictEqual(result._id, fileStatsId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getFileStatsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a fileStats with references as ObjectIds', async () => {
      const updateFileStats = {
        ...mocks.MOCK_FILESTATS,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IFileStats;

      const fileStatsId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(FileStatsModel, 'updateOne', updateStub);

      const getFileStatsStub = sandbox.stub();
      getFileStatsStub.resolves({_id: fileStatsId});
      sandbox.replace(FileStatsModel, 'getFileStatsById', getFileStatsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(FileStatsModel, 'validateUpdateObject', validateStub);

      const result = await FileStatsModel.updateFileStatsById(fileStatsId, updateFileStats);

      assert.strictEqual(result._id, fileStatsId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getFileStatsStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the fileStats does not exist', async () => {
      const updateFileStats = {
        ...mocks.MOCK_FILESTATS,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IFileStats;

      const fileStatsId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(FileStatsModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(FileStatsModel, 'validateUpdateObject', validateStub);

      const getFileStatsStub = sandbox.stub();
      getFileStatsStub.resolves({_id: fileStatsId});
      sandbox.replace(FileStatsModel, 'getFileStatsById', getFileStatsStub);

      let errorred = false;
      try {
        await FileStatsModel.updateFileStatsById(fileStatsId, updateFileStats);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateFileStats = {
        ...mocks.MOCK_FILESTATS,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IFileStats;

      const fileStatsId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(FileStatsModel, 'updateOne', updateStub);

      const getFileStatsStub = sandbox.stub();
      getFileStatsStub.resolves({_id: fileStatsId});
      sandbox.replace(FileStatsModel, 'getFileStatsById', getFileStatsStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(new error.InvalidOperationError("You can't do this", {}));
      sandbox.replace(FileStatsModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await FileStatsModel.updateFileStatsById(fileStatsId, updateFileStats);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateFileStats = {
        ...mocks.MOCK_FILESTATS,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IFileStats;

      const fileStatsId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(FileStatsModel, 'updateOne', updateStub);

      const getFileStatsStub = sandbox.stub();
      getFileStatsStub.resolves({_id: fileStatsId});
      sandbox.replace(FileStatsModel, 'getFileStatsById', getFileStatsStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(FileStatsModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await FileStatsModel.updateFileStatsById(fileStatsId, updateFileStats);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a fileStats document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a fileStats', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(FileStatsModel, 'deleteOne', deleteStub);

      const fileStatsId = new mongoose.Types.ObjectId();

      await FileStatsModel.deleteFileStatsById(fileStatsId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the fileStats does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(FileStatsModel, 'deleteOne', deleteStub);

      const fileStatsId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await FileStatsModel.deleteFileStatsById(fileStatsId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(FileStatsModel, 'deleteOne', deleteStub);

      const fileStatsId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await FileStatsModel.deleteFileStatsById(fileStatsId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});
