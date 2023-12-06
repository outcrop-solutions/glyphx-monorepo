// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import { ThresholdModel} from '../../../mongoose/models/threshold'
import * as mocks from '../../../mongoose/mocks';
import {IQueryResult, databaseTypes} from 'types'
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/threshold', () => {
  context('thresholdIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the thresholdId exists', async () => {
      const thresholdId = mocks.MOCK_THRESHOLD._id;
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: thresholdId});
      sandbox.replace(ThresholdModel, 'findById', findByIdStub);

      const result = await ThresholdModel.thresholdIdExists(thresholdId);

      assert.isTrue(result);
    });

    it('should return false if the thresholdId does not exist', async () => {
      const thresholdId = mocks.MOCK_THRESHOLD._id;
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ThresholdModel, 'findById', findByIdStub);

      const result = await ThresholdModel.thresholdIdExists(thresholdId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const thresholdId = mocks.MOCK_THRESHOLD._id;
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(ThresholdModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await ThresholdModel.thresholdIdExists(thresholdId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allThresholdIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the threshold ids exist', async () => {
      const thresholdIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedThresholdIds = thresholdIds.map(thresholdId => {
        return {
          _id: thresholdId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedThresholdIds);
      sandbox.replace(ThresholdModel, 'find', findStub);

      assert.isTrue(await ThresholdModel.allThresholdIdsExist(thresholdIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const thresholdIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedThresholdIds = [
        {
          _id: thresholdIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedThresholdIds);
      sandbox.replace(ThresholdModel, 'find', findStub);
      let errored = false;
      try {
        await ThresholdModel.allThresholdIdsExist(thresholdIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          thresholdIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const thresholdIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(ThresholdModel, 'find', findStub);
      let errored = false;
      try {
        await ThresholdModel.allThresholdIdsExist(thresholdIds);
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
        await ThresholdModel.validateUpdateObject(mocks.MOCK_THRESHOLD as unknown as Omit<Partial<databaseTypes.IThreshold>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {

      let errored = false;

      try {
        await ThresholdModel.validateUpdateObject(mocks.MOCK_THRESHOLD as unknown as Omit<Partial<databaseTypes.IThreshold>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });



    it('will fail when trying to update the _id', async () => {

      let errored = false;

      try {
        await ThresholdModel.validateUpdateObject({...mocks.MOCK_THRESHOLD, _id: new mongoose.Types.ObjectId() } as unknown as Omit<Partial<databaseTypes.IThreshold>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {

      let errored = false;

      try {
        await ThresholdModel.validateUpdateObject({...mocks.MOCK_THRESHOLD, createdAt: new Date() } as unknown as Omit<Partial<databaseTypes.IThreshold>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {

      let errored = false;

      try {
        await ThresholdModel.validateUpdateObject({...mocks.MOCK_THRESHOLD, updatedAt: new Date() }  as unknown as Omit<Partial<databaseTypes.IThreshold>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createThreshold', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a threshold document', async () => {

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ThresholdModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(ThresholdModel, 'validate', sandbox.stub().resolves(true));
      
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ThresholdModel, 'getThresholdById', stub);

      const thresholdDocument = await ThresholdModel.createThreshold(mocks.MOCK_THRESHOLD);

      assert.strictEqual(thresholdDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });



    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ThresholdModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        ThresholdModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ThresholdModel, 'getThresholdById', stub);
      let hasError = false;
      try {
        await ThresholdModel.createThreshold(mocks.MOCK_THRESHOLD);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ThresholdModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ThresholdModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ThresholdModel, 'getThresholdById', stub);

      let hasError = false;
      try {
        await ThresholdModel.createThreshold(mocks.MOCK_THRESHOLD);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ThresholdModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        ThresholdModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ThresholdModel, 'getThresholdById', stub);
      let hasError = false;
      try {
        await ThresholdModel.createThreshold(mocks.MOCK_THRESHOLD);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getThresholdById', () => {
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

    it('will retreive a threshold document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_THRESHOLD));
      sandbox.replace(ThresholdModel, 'findById', findByIdStub);

      const doc = await ThresholdModel.getThresholdById(
        mocks.MOCK_THRESHOLD._id
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_THRESHOLD._id);
    });

    it('will throw a DataNotFoundError when the threshold does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ThresholdModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ThresholdModel.getThresholdById(
          mocks.MOCK_THRESHOLD._id
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(
        new MockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(ThresholdModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ThresholdModel.getThresholdById(
          mocks.MOCK_THRESHOLD.id
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryThresholds', () => {
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

    const mockThresholds = [
      {
       ...mocks.MOCK_THRESHOLD,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IThreshold,
      {
        ...mocks.MOCK_THRESHOLD,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IThreshold,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered thresholds', async () => {
      sandbox.replace(
        ThresholdModel,
        'count',
        sandbox.stub().resolves(mockThresholds.length)
      );

      sandbox.replace(
        ThresholdModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockThresholds))
      );

      const results = await ThresholdModel.queryThresholds({});

      assert.strictEqual(results.numberOfItems, mockThresholds.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockThresholds.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(ThresholdModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        ThresholdModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockThresholds))
      );

      let errored = false;
      try {
        await ThresholdModel.queryThresholds();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        ThresholdModel,
        'count',
        sandbox.stub().resolves(mockThresholds.length)
      );

      sandbox.replace(
        ThresholdModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockThresholds))
      );

      let errored = false;
      try {
        await ThresholdModel.queryThresholds({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        ThresholdModel,
        'count',
        sandbox.stub().resolves(mockThresholds.length)
      );

      sandbox.replace(
        ThresholdModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await ThresholdModel.queryThresholds({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateThresholdById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a threshold', async () => {
      const updateThreshold = {
        ...mocks.MOCK_THRESHOLD,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IThreshold;

      const thresholdId = mocks.MOCK_THRESHOLD._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ThresholdModel, 'updateOne', updateStub);

      const getThresholdStub = sandbox.stub();
      getThresholdStub.resolves({_id: thresholdId});
      sandbox.replace(ThresholdModel, 'getThresholdById', getThresholdStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ThresholdModel, 'validateUpdateObject', validateStub);

      const result = await ThresholdModel.updateThresholdById(
        thresholdId,
        updateThreshold
      );

      assert.strictEqual(result._id, mocks.MOCK_THRESHOLD._id);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getThresholdStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a threshold with references as ObjectIds', async () => {
      const updateThreshold = {
        ...mocks.MOCK_THRESHOLD,
        deletedAt: new Date()
      } as unknown as databaseTypes.IThreshold;

      const thresholdId = mocks.MOCK_THRESHOLD._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ThresholdModel, 'updateOne', updateStub);

      const getThresholdStub = sandbox.stub();
      getThresholdStub.resolves({_id: thresholdId});
      sandbox.replace(ThresholdModel, 'getThresholdById', getThresholdStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ThresholdModel, 'validateUpdateObject', validateStub);

      const result = await ThresholdModel.updateThresholdById(
        thresholdId,
        updateThreshold
      );

      assert.strictEqual(result._id, thresholdId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getThresholdStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the threshold does not exist', async () => {
      const updateThreshold = {
        ...mocks.MOCK_THRESHOLD,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IThreshold;

      const thresholdId = mocks.MOCK_THRESHOLD._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(ThresholdModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(ThresholdModel, 'validateUpdateObject', validateStub);

      const getThresholdStub = sandbox.stub();
      getThresholdStub.resolves({_id: thresholdId});
      sandbox.replace(ThresholdModel, 'getThresholdById', getThresholdStub);

      let errorred = false;
      try {
        await ThresholdModel.updateThresholdById(thresholdId, updateThreshold);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateThreshold = {
       ...mocks.MOCK_THRESHOLD,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IThreshold;

      const thresholdId = mocks.MOCK_THRESHOLD._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ThresholdModel, 'updateOne', updateStub);

      const getThresholdStub = sandbox.stub();
      getThresholdStub.resolves({_id: thresholdId});
      sandbox.replace(ThresholdModel, 'getThresholdById', getThresholdStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(ThresholdModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await ThresholdModel.updateThresholdById(thresholdId, updateThreshold);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateThreshold = {
       ...mocks.MOCK_THRESHOLD,
        deletedAt: new Date()
      } as unknown as databaseTypes.IThreshold;

      const thresholdId = mocks.MOCK_THRESHOLD._id;

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(ThresholdModel, 'updateOne', updateStub);

      const getThresholdStub = sandbox.stub();
      getThresholdStub.resolves({_id: thresholdId});
      sandbox.replace(ThresholdModel, 'getThresholdById', getThresholdStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ThresholdModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await ThresholdModel.updateThresholdById(thresholdId, updateThreshold);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a threshold document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a threshold', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ThresholdModel, 'deleteOne', deleteStub);

      const thresholdId = mocks.MOCK_THRESHOLD._id;

      await ThresholdModel.deleteThresholdById(thresholdId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the threshold does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(ThresholdModel, 'deleteOne', deleteStub);

      const thresholdId = mocks.MOCK_THRESHOLD._id;

      let errorred = false;
      try {
        await ThresholdModel.deleteThresholdById(thresholdId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(ThresholdModel, 'deleteOne', deleteStub);

      const thresholdId = mocks.MOCK_THRESHOLD._id;

      let errorred = false;
      try {
        await ThresholdModel.deleteThresholdById(thresholdId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

});
