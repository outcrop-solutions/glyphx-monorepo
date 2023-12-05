// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {ProcessTrackingModel} from '../../../mongoose/models/processTracking';
import * as mocks from '../../../mongoose/mocks';
import {IQueryResult, databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/processTracking', () => {
  context('processTrackingIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the processTrackingId exists', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: processTrackingId});
      sandbox.replace(ProcessTrackingModel, 'findById', findByIdStub);

      const result = await ProcessTrackingModel.processTrackingIdExists(processTrackingId);

      assert.isTrue(result);
    });

    it('should return false if the processTrackingId does not exist', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProcessTrackingModel, 'findById', findByIdStub);

      const result = await ProcessTrackingModel.processTrackingIdExists(processTrackingId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(ProcessTrackingModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await ProcessTrackingModel.processTrackingIdExists(processTrackingId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allProcessTrackingIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the processTracking ids exist', async () => {
      const processTrackingIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedProcessTrackingIds = processTrackingIds.map((processTrackingId) => {
        return {
          _id: processTrackingId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedProcessTrackingIds);
      sandbox.replace(ProcessTrackingModel, 'find', findStub);

      assert.isTrue(await ProcessTrackingModel.allProcessTrackingIdsExist(processTrackingIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const processTrackingIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedProcessTrackingIds = [
        {
          _id: processTrackingIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedProcessTrackingIds);
      sandbox.replace(ProcessTrackingModel, 'find', findStub);
      let errored = false;
      try {
        await ProcessTrackingModel.allProcessTrackingIdsExist(processTrackingIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(err.data.value[0].toString(), processTrackingIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const processTrackingIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(ProcessTrackingModel, 'find', findStub);
      let errored = false;
      try {
        await ProcessTrackingModel.allProcessTrackingIdsExist(processTrackingIds);
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
        await ProcessTrackingModel.validateUpdateObject(
          mocks.MOCK_PROCESSTRACKING as unknown as Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      let errored = false;

      try {
        await ProcessTrackingModel.validateUpdateObject(
          mocks.MOCK_PROCESSTRACKING as unknown as Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will fail when trying to update the _id', async () => {
      let errored = false;

      try {
        await ProcessTrackingModel.validateUpdateObject({
          ...mocks.MOCK_PROCESSTRACKING,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IProcessTracking>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      let errored = false;

      try {
        await ProcessTrackingModel.validateUpdateObject({
          ...mocks.MOCK_PROCESSTRACKING,
          createdAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IProcessTracking>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      let errored = false;

      try {
        await ProcessTrackingModel.validateUpdateObject({
          ...mocks.MOCK_PROCESSTRACKING,
          updatedAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IProcessTracking>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createProcessTracking', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a processTracking document', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProcessTrackingModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(ProcessTrackingModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingById', stub);

      const processTrackingDocument = await ProcessTrackingModel.createProcessTracking(mocks.MOCK_PROCESSTRACKING);

      assert.strictEqual(processTrackingDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProcessTrackingModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProcessTrackingModel, 'create', sandbox.stub().rejects('oops, something bad has happened'));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingById', stub);
      let hasError = false;
      try {
        await ProcessTrackingModel.createProcessTracking(mocks.MOCK_PROCESSTRACKING);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProcessTrackingModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProcessTrackingModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingById', stub);

      let hasError = false;
      try {
        await ProcessTrackingModel.createProcessTracking(mocks.MOCK_PROCESSTRACKING);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ProcessTrackingModel, 'validate', sandbox.stub().rejects('oops an error has occurred'));
      sandbox.replace(ProcessTrackingModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingById', stub);
      let hasError = false;
      try {
        await ProcessTrackingModel.createProcessTracking(mocks.MOCK_PROCESSTRACKING);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getProcessTrackingById', () => {
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

    it('will retreive a processTracking document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_PROCESSTRACKING));
      sandbox.replace(ProcessTrackingModel, 'findById', findByIdStub);

      const doc = await ProcessTrackingModel.getProcessTrackingById(
        mocks.MOCK_PROCESSTRACKING._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_PROCESSTRACKING._id);
    });

    it('will throw a DataNotFoundError when the processTracking does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ProcessTrackingModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProcessTrackingModel.getProcessTrackingById(mocks.MOCK_PROCESSTRACKING._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(ProcessTrackingModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProcessTrackingModel.getProcessTrackingById(mocks.MOCK_PROCESSTRACKING._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryProcessTrackings', () => {
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

    const mockProcessTrackings = [
      {
        ...mocks.MOCK_PROCESSTRACKING,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IProcessTracking,
      {
        ...mocks.MOCK_PROCESSTRACKING,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IProcessTracking,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered processTrackings', async () => {
      sandbox.replace(ProcessTrackingModel, 'count', sandbox.stub().resolves(mockProcessTrackings.length));

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProcessTrackings))
      );

      const results = await ProcessTrackingModel.queryProcessTrackings({});

      assert.strictEqual(results.numberOfItems, mockProcessTrackings.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockProcessTrackings.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(ProcessTrackingModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProcessTrackings))
      );

      let errored = false;
      try {
        await ProcessTrackingModel.queryProcessTrackings();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(ProcessTrackingModel, 'count', sandbox.stub().resolves(mockProcessTrackings.length));

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProcessTrackings))
      );

      let errored = false;
      try {
        await ProcessTrackingModel.queryProcessTrackings({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(ProcessTrackingModel, 'count', sandbox.stub().resolves(mockProcessTrackings.length));

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await ProcessTrackingModel.queryProcessTrackings({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateProcessTrackingById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a processTracking', async () => {
      const updateProcessTracking = {
        ...mocks.MOCK_PROCESSTRACKING,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProcessTracking;

      const processTrackingId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProcessTrackingModel, 'updateOne', updateStub);

      const getProcessTrackingStub = sandbox.stub();
      getProcessTrackingStub.resolves({_id: processTrackingId});
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingById', getProcessTrackingStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ProcessTrackingModel, 'validateUpdateObject', validateStub);

      const result = await ProcessTrackingModel.updateProcessTrackingById(processTrackingId, updateProcessTracking);

      assert.strictEqual(result._id, processTrackingId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getProcessTrackingStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a processTracking with references as ObjectIds', async () => {
      const updateProcessTracking = {
        ...mocks.MOCK_PROCESSTRACKING,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProcessTracking;

      const processTrackingId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProcessTrackingModel, 'updateOne', updateStub);

      const getProcessTrackingStub = sandbox.stub();
      getProcessTrackingStub.resolves({_id: processTrackingId});
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingById', getProcessTrackingStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ProcessTrackingModel, 'validateUpdateObject', validateStub);

      const result = await ProcessTrackingModel.updateProcessTrackingById(processTrackingId, updateProcessTracking);

      assert.strictEqual(result._id, processTrackingId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getProcessTrackingStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the processTracking does not exist', async () => {
      const updateProcessTracking = {
        ...mocks.MOCK_PROCESSTRACKING,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProcessTracking;

      const processTrackingId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(ProcessTrackingModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(ProcessTrackingModel, 'validateUpdateObject', validateStub);

      const getProcessTrackingStub = sandbox.stub();
      getProcessTrackingStub.resolves({_id: processTrackingId});
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingById', getProcessTrackingStub);

      let errorred = false;
      try {
        await ProcessTrackingModel.updateProcessTrackingById(processTrackingId, updateProcessTracking);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateProcessTracking = {
        ...mocks.MOCK_PROCESSTRACKING,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProcessTracking;

      const processTrackingId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProcessTrackingModel, 'updateOne', updateStub);

      const getProcessTrackingStub = sandbox.stub();
      getProcessTrackingStub.resolves({_id: processTrackingId});
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingById', getProcessTrackingStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(new error.InvalidOperationError("You can't do this", {}));
      sandbox.replace(ProcessTrackingModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await ProcessTrackingModel.updateProcessTrackingById(processTrackingId, updateProcessTracking);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateProcessTracking = {
        ...mocks.MOCK_PROCESSTRACKING,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProcessTracking;

      const processTrackingId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(ProcessTrackingModel, 'updateOne', updateStub);

      const getProcessTrackingStub = sandbox.stub();
      getProcessTrackingStub.resolves({_id: processTrackingId});
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingById', getProcessTrackingStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ProcessTrackingModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await ProcessTrackingModel.updateProcessTrackingById(processTrackingId, updateProcessTracking);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a processTracking document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a processTracking', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ProcessTrackingModel, 'deleteOne', deleteStub);

      const processTrackingId = new mongoose.Types.ObjectId();

      await ProcessTrackingModel.deleteProcessTrackingById(processTrackingId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the processTracking does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(ProcessTrackingModel, 'deleteOne', deleteStub);

      const processTrackingId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ProcessTrackingModel.deleteProcessTrackingById(processTrackingId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(ProcessTrackingModel, 'deleteOne', deleteStub);

      const processTrackingId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ProcessTrackingModel.deleteProcessTrackingById(processTrackingId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});
