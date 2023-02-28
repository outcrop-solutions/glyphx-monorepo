import {assert} from 'chai';
import {ProcessTrackingModel} from '../../../mongoose/models/processTracking';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const MOCK_PROCESS_TRACKING_DOCUMENT = {
  processId: new mongoose.Types.ObjectId(),
  processName: 'test process1',
  processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
  processStartTime: new Date(),
  processMessages: [],
  processError: [],
} as databaseTypes.IProcessTracking;

describe.only('#mongoose/models/processTracking', () => {
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

      const result = await ProcessTrackingModel.processTrackingIdExists(
        processTrackingId
      );

      assert.isTrue(result);
    });

    it('should return false if the processTrackingId does not exist', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProcessTrackingModel, 'findById', findByIdStub);

      const result = await ProcessTrackingModel.processTrackingIdExists(
        processTrackingId
      );

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

  context('processIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the processId exists', async () => {
      const processId = new mongoose.Types.ObjectId();
      const findOneStub = sandbox.stub();
      findOneStub.resolves({_id: processId});
      sandbox.replace(ProcessTrackingModel, 'findOne', findOneStub);

      const result = await ProcessTrackingModel.processIdExists(processId);

      assert.isTrue(result);
    });

    it('should return false if the processId does not exist', async () => {
      const processId = new mongoose.Types.ObjectId();
      const findOneStub = sandbox.stub();
      findOneStub.resolves(null);
      sandbox.replace(ProcessTrackingModel, 'findOne', findOneStub);

      const result = await ProcessTrackingModel.processIdExists(processId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const processId = new mongoose.Types.ObjectId();
      const findOneStub = sandbox.stub();
      findOneStub.rejects('something unexpected has happend');
      sandbox.replace(ProcessTrackingModel, 'findOne', findOneStub);

      let errorred = false;
      try {
        await ProcessTrackingModel.processIdExists(processId);
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

    it('should return true when all the ProcessTracking ids exist', async () => {
      const processTrackingIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedProcessTrackingIds = processTrackingIds.map(
        verificationTokenId => {
          return {
            _id: verificationTokenId,
          };
        }
      );

      const findStub = sandbox.stub();
      findStub.resolves(returnedProcessTrackingIds);
      sandbox.replace(ProcessTrackingModel, 'find', findStub);

      assert.isTrue(
        await ProcessTrackingModel.allProcessTrackingIdsExist(
          processTrackingIds
        )
      );
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const processTrackingIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

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
        await ProcessTrackingModel.allProcessTrackingIdsExist(
          processTrackingIds
        );
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          processTrackingIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const processTrackingIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(ProcessTrackingModel, 'find', findStub);
      let errored = false;
      try {
        await ProcessTrackingModel.allProcessTrackingIdsExist(
          processTrackingIds
        );
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('queryProcessTrackingDocuments', () => {
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

    const mockProcessTrackingDocuments = [
      {
        _id: new mongoose.Types.ObjectId(),
        processId: new mongoose.Types.ObjectId(),
        processName: 'test process1',
        processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
        processStartTime: new Date(),
        processEndTime: new Date(),
        processMessages: [],
        processError: [],
      } as databaseTypes.IProcessTracking,
      {
        _id: new mongoose.Types.ObjectId(),
        processId: new mongoose.Types.ObjectId(),
        processName: 'test process2',
        processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
        processStartTime: new Date(),
        processEndTime: new Date(),
        processMessages: [],
        processError: [],
      } as databaseTypes.IProcessTracking,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered process tracking documents', async () => {
      sandbox.replace(
        ProcessTrackingModel,
        'count',
        sandbox.stub().resolves(mockProcessTrackingDocuments.length)
      );

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery(mockProcessTrackingDocuments))
      );

      const results = await ProcessTrackingModel.queryProcessTrackingDocuments(
        {}
      );

      assert.strictEqual(
        results.numberOfItems,
        mockProcessTrackingDocuments.length
      );
      assert.strictEqual(results.page, 0);
      assert.strictEqual(
        results.results.length,
        mockProcessTrackingDocuments.length
      );
      assert.isNumber(results.itemsPerPage);
      results.results.forEach(doc => {
        assert.isUndefined((doc as any).__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(
        ProcessTrackingModel,
        'count',
        sandbox.stub().resolves(0)
      );

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery(mockProcessTrackingDocuments))
      );

      let errored = false;
      try {
        await ProcessTrackingModel.queryProcessTrackingDocuments();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        ProcessTrackingModel,
        'count',
        sandbox.stub().resolves(mockProcessTrackingDocuments.length)
      );

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery(mockProcessTrackingDocuments))
      );

      let errored = false;
      try {
        await ProcessTrackingModel.queryProcessTrackingDocuments({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        ProcessTrackingModel,
        'count',
        sandbox.stub().resolves(mockProcessTrackingDocuments.length)
      );

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await ProcessTrackingModel.queryProcessTrackingDocuments({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('createProcessTrackingDocument', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create an processTracking document', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProcessTrackingModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        ProcessTrackingModel,
        'create',
        sandbox.stub().resolves([{_id: processTrackingId}])
      );

      const getProcessTrackingDocumentByIdStub = sandbox.stub();
      getProcessTrackingDocumentByIdStub.resolves({_id: processTrackingId});

      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getProcessTrackingDocumentByIdStub
      );

      const result = await ProcessTrackingModel.createProcessTrackingDocument(
        MOCK_PROCESS_TRACKING_DOCUMENT
      );
      assert.strictEqual(result._id, processTrackingId);
      assert.isTrue(getProcessTrackingDocumentByIdStub.calledOnce);
    });

    it('will throw an DataValidationError if the process tracking document cannot be validated.', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProcessTrackingModel,
        'validate',
        sandbox.stub().rejects('Invalid')
      );
      sandbox.replace(
        ProcessTrackingModel,
        'create',
        sandbox.stub().resolves([{_id: processTrackingId}])
      );

      const getProcessTrackingDocumentByIdStub = sandbox.stub();
      getProcessTrackingDocumentByIdStub.resolves({_id: processTrackingId});

      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getProcessTrackingDocumentByIdStub
      );
      let errorred = false;

      try {
        await ProcessTrackingModel.createProcessTrackingDocument(
          MOCK_PROCESS_TRACKING_DOCUMENT
        );
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DatabaseOperationError if the underlying database connection throws an error.', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProcessTrackingModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        ProcessTrackingModel,
        'create',
        sandbox.stub().rejects('oops')
      );

      const getProcessTrackingDocumentByIdStub = sandbox.stub();
      getProcessTrackingDocumentByIdStub.resolves({_id: processTrackingId});

      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getProcessTrackingDocumentByIdStub
      );
      let errorred = false;

      try {
        await ProcessTrackingModel.createProcessTrackingDocument(
          MOCK_PROCESS_TRACKING_DOCUMENT
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('getProcessTrackingDocumentByFilter', () => {
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

    const mockProcessTrackingDocument = {
      _id: new mongoose.Types.ObjectId(),
      processId: new mongoose.Types.ObjectId(),
      processName: 'test process1',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processEndTime: new Date(),
      processMessages: [],
      processError: [],
      __v: 1,
    } as databaseTypes.IProcessTracking;

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a process tracking document', async () => {
      const findOneStub = sandbox.stub();
      findOneStub.returns(new MockMongooseQuery(mockProcessTrackingDocument));
      sandbox.replace(ProcessTrackingModel, 'findOne', findOneStub);

      const doc = await ProcessTrackingModel.getProcessTrackingDocumentByFilter(
        {_id: mockProcessTrackingDocument._id as mongoose.Types.ObjectId}
      );

      assert.isTrue(findOneStub.calledOnce);
      assert.isUndefined((doc as any).__v);

      assert.strictEqual(doc._id, mockProcessTrackingDocument._id);
    });

    it('will throw a DataNotFoundError when the process tracking document does not exist', async () => {
      const findOneStub = sandbox.stub();
      findOneStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ProcessTrackingModel, 'findOne', findOneStub);

      let errored = false;
      try {
        await ProcessTrackingModel.getProcessTrackingDocumentByFilter({
          _id: mockProcessTrackingDocument._id as mongoose.Types.ObjectId,
        });
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByOneStub = sandbox.stub();
      findByOneStub.returns(
        new MockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(ProcessTrackingModel, 'findOne', findByOneStub);

      let errored = false;
      try {
        await ProcessTrackingModel.getProcessTrackingDocumentByFilter({
          _id: mockProcessTrackingDocument._id as mongoose.Types.ObjectId,
        });
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('getProcessTrackingDocumentById', () => {
    const mockProcessTrackingDocument = {
      _id: new mongoose.Types.ObjectId(),
      processId: new mongoose.Types.ObjectId(),
      processName: 'test process1',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processEndTime: new Date(),
      processMessages: [],
      processError: [],
    } as databaseTypes.IProcessTracking;

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a process tracking document', async () => {
      const findByFilterStub = sandbox.stub();
      findByFilterStub.resolves(mockProcessTrackingDocument);
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        findByFilterStub
      );

      const doc = await ProcessTrackingModel.getProcessTrackingDocumentById(
        mockProcessTrackingDocument._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByFilterStub.calledOnce);

      assert.strictEqual(doc._id, mockProcessTrackingDocument._id);
    });

    it('will re-throw a DataNotFoundError when the process tracking document does not exist', async () => {
      const findByFilterStub = sandbox.stub();
      findByFilterStub.rejects(
        new error.DataNotFoundError('Data not found', 'processTracking', {})
      );
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        findByFilterStub
      );

      let errored = false;
      try {
        await ProcessTrackingModel.getProcessTrackingDocumentById(
          mockProcessTrackingDocument._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will re-throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByFilterStub = sandbox.stub();
      findByFilterStub.rejects(
        new error.DatabaseOperationError(
          'something bad happened',
          'mongoDb',
          'getProcessTrackingDocumentByFilter'
        )
      );
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        findByFilterStub
      );

      let errored = false;
      try {
        await ProcessTrackingModel.getProcessTrackingDocumentById(
          mockProcessTrackingDocument._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('getProcessTrackingDocumentByProcessId', () => {
    const mockProcessTrackingDocument = {
      _id: new mongoose.Types.ObjectId(),
      processId: new mongoose.Types.ObjectId(),
      processName: 'test process1',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processEndTime: new Date(),
      processMessages: [],
      processError: [],
    } as databaseTypes.IProcessTracking;

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a process tracking document', async () => {
      const findByFilterStub = sandbox.stub();
      findByFilterStub.resolves(mockProcessTrackingDocument);
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        findByFilterStub
      );

      const doc =
        await ProcessTrackingModel.getProcessTrackingDocumentByProcessId(
          mockProcessTrackingDocument.processId
        );

      assert.isTrue(findByFilterStub.calledOnce);

      assert.strictEqual(doc.processId, mockProcessTrackingDocument.processId);
    });

    it('will re-throw a DataNotFoundError when the process tracking document does not exist', async () => {
      const findByFilterStub = sandbox.stub();
      findByFilterStub.rejects(
        new error.DataNotFoundError('Data not found', 'processTracking', {})
      );
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        findByFilterStub
      );

      let errored = false;
      try {
        await ProcessTrackingModel.getProcessTrackingDocumentByProcessId(
          mockProcessTrackingDocument.processId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will re-throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByFilterStub = sandbox.stub();
      findByFilterStub.rejects(
        new error.DatabaseOperationError(
          'something bad happened',
          'mongoDb',
          'getProcessTrackingDocumentByFilter'
        )
      );
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        findByFilterStub
      );

      let errored = false;
      try {
        await ProcessTrackingModel.getProcessTrackingDocumentByProcessId(
          mockProcessTrackingDocument.processId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});
