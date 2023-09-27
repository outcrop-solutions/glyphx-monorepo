import {assert} from 'chai';
import {ProcessTrackingModel} from '../../../mongoose/models/processTracking';
import {databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const MOCK_PROCESS_TRACKING_DOCUMENT = {
  processId: new mongoose.Types.ObjectId().toString(),
  processName: 'test process1',
  processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
  processStartTime: new Date(),
  processMessages: [],
  processError: [],
} as databaseTypes.IProcessTracking;

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

  context('processIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the processId exists', async () => {
      const processId = new mongoose.Types.ObjectId().toString();
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

      const result = await ProcessTrackingModel.processIdExists(processId.toString());

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const processId = new mongoose.Types.ObjectId();
      const findOneStub = sandbox.stub();
      findOneStub.rejects('something unexpected has happend');
      sandbox.replace(ProcessTrackingModel, 'findOne', findOneStub);

      let errorred = false;
      try {
        await ProcessTrackingModel.processIdExists(processId.toString());
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
      const processTrackingIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedProcessTrackingIds = processTrackingIds.map((verificationTokenId) => {
        return {
          _id: verificationTokenId,
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
        processId: new mongoose.Types.ObjectId().toString(),
        processName: 'test process1',
        processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
        processStartTime: new Date(),
        processEndTime: new Date(),
        processMessages: [],
        processError: [],
      } as databaseTypes.IProcessTracking,
      {
        _id: new mongoose.Types.ObjectId(),
        processId: new mongoose.Types.ObjectId().toString(),
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
      sandbox.replace(ProcessTrackingModel, 'count', sandbox.stub().resolves(mockProcessTrackingDocuments.length));

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProcessTrackingDocuments))
      );

      const results = await ProcessTrackingModel.queryProcessTrackingDocuments({});

      assert.strictEqual(results.numberOfItems, mockProcessTrackingDocuments.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockProcessTrackingDocuments.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc) => {
        assert.isUndefined((doc as any).__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(ProcessTrackingModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProcessTrackingDocuments))
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
      sandbox.replace(ProcessTrackingModel, 'count', sandbox.stub().resolves(mockProcessTrackingDocuments.length));

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProcessTrackingDocuments))
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
      sandbox.replace(ProcessTrackingModel, 'count', sandbox.stub().resolves(mockProcessTrackingDocuments.length));

      sandbox.replace(
        ProcessTrackingModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
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
      sandbox.replace(ProcessTrackingModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProcessTrackingModel, 'create', sandbox.stub().resolves([{_id: processTrackingId}]));

      const getProcessTrackingDocumentByIdStub = sandbox.stub();
      getProcessTrackingDocumentByIdStub.resolves({_id: processTrackingId});

      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentById', getProcessTrackingDocumentByIdStub);

      const result = await ProcessTrackingModel.createProcessTrackingDocument(MOCK_PROCESS_TRACKING_DOCUMENT);
      assert.strictEqual(result._id, processTrackingId);
      assert.isTrue(getProcessTrackingDocumentByIdStub.calledOnce);
    });

    it('will create an processTracking document defaulting process status, processStartTime, processMessages and processError', async () => {
      const inputObject = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));

      delete inputObject.processStartTime;
      delete inputObject.processMessages;
      delete inputObject.processStatus;
      delete inputObject.processError;

      const processTrackingId = new mongoose.Types.ObjectId();
      sandbox.replace(ProcessTrackingModel, 'validate', sandbox.stub().resolves(true));

      const createStub = sandbox.stub();
      createStub.resolves([{_id: processTrackingId}]);
      sandbox.replace(ProcessTrackingModel, 'create', createStub);

      const getProcessTrackingDocumentByIdStub = sandbox.stub();
      getProcessTrackingDocumentByIdStub.resolves({_id: processTrackingId});

      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentById', getProcessTrackingDocumentByIdStub);

      const result = await ProcessTrackingModel.createProcessTrackingDocument(inputObject);
      assert.strictEqual(result._id, processTrackingId);
      assert.isTrue(getProcessTrackingDocumentByIdStub.calledOnce);
      const inputArg = createStub.getCall(0).args[0][0];
      assert.strictEqual(inputArg.processStatus, databaseTypes.constants.PROCESS_STATUS.PENDING);
      assert.isDefined(inputArg.processStartTime);
      assert.isDefined(inputArg.processMessages);
      assert.isDefined(inputArg.processError);
    });

    it('will throw an DataValidationError if the process tracking document cannot be validated.', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      sandbox.replace(ProcessTrackingModel, 'validate', sandbox.stub().rejects('Invalid'));
      sandbox.replace(ProcessTrackingModel, 'create', sandbox.stub().resolves([{_id: processTrackingId}]));

      const getProcessTrackingDocumentByIdStub = sandbox.stub();
      getProcessTrackingDocumentByIdStub.resolves({_id: processTrackingId});

      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentById', getProcessTrackingDocumentByIdStub);
      let errorred = false;

      try {
        await ProcessTrackingModel.createProcessTrackingDocument(MOCK_PROCESS_TRACKING_DOCUMENT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DatabaseOperationError if the underlying database connection throws an error.', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      sandbox.replace(ProcessTrackingModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProcessTrackingModel, 'create', sandbox.stub().rejects('oops'));

      const getProcessTrackingDocumentByIdStub = sandbox.stub();
      getProcessTrackingDocumentByIdStub.resolves({_id: processTrackingId});

      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentById', getProcessTrackingDocumentByIdStub);
      let errorred = false;

      try {
        await ProcessTrackingModel.createProcessTrackingDocument(MOCK_PROCESS_TRACKING_DOCUMENT);
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
      processId: new mongoose.Types.ObjectId().toString(),
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

      const doc = await ProcessTrackingModel.getProcessTrackingDocumentByFilter({
        _id: mockProcessTrackingDocument._id as mongoose.Types.ObjectId,
      });

      assert.isTrue(findOneStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.strictEqual(doc.id, mockProcessTrackingDocument._id?.toString());
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
      findByOneStub.returns(new MockMongooseQuery('something bad happened', true));
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
      id: '65140364b2c504f0aba1b99c', // to mock the formatter
      processId: new mongoose.Types.ObjectId().toString(),
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
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', findByFilterStub);

      const doc = await ProcessTrackingModel.getProcessTrackingDocumentById(
        mockProcessTrackingDocument._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByFilterStub.calledOnce);
      assert.strictEqual(doc.id, mockProcessTrackingDocument.id);
    });

    it('will re-throw a DataNotFoundError when the process tracking document does not exist', async () => {
      const findByFilterStub = sandbox.stub();
      findByFilterStub.rejects(new error.DataNotFoundError('Data not found', 'processTracking', {}));
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', findByFilterStub);

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
        new error.DatabaseOperationError('something bad happened', 'mongoDb', 'getProcessTrackingDocumentByFilter')
      );
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', findByFilterStub);

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
      processId: new mongoose.Types.ObjectId().toString(),
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
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', findByFilterStub);

      const doc = await ProcessTrackingModel.getProcessTrackingDocumentByProcessId(
        mockProcessTrackingDocument.processId
      );

      assert.isTrue(findByFilterStub.calledOnce);

      assert.strictEqual(doc.processId, mockProcessTrackingDocument.processId);
    });

    it('will re-throw a DataNotFoundError when the process tracking document does not exist', async () => {
      const findByFilterStub = sandbox.stub();
      findByFilterStub.rejects(new error.DataNotFoundError('Data not found', 'processTracking', {}));
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', findByFilterStub);

      let errored = false;
      try {
        await ProcessTrackingModel.getProcessTrackingDocumentByProcessId(mockProcessTrackingDocument.processId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will re-throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByFilterStub = sandbox.stub();
      findByFilterStub.rejects(
        new error.DatabaseOperationError('something bad happened', 'mongoDb', 'getProcessTrackingDocumentByFilter')
      );
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', findByFilterStub);

      let errored = false;
      try {
        await ProcessTrackingModel.getProcessTrackingDocumentByProcessId(mockProcessTrackingDocument.processId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateProcessTracking document with filter', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should update an existing process tracking document', async () => {
      const updateProcessTrackingDocument = {
        processName: 'updated processName',
      };

      const processTrackingId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProcessTrackingModel, 'updateOne', updateStub);

      const result = await ProcessTrackingModel.updateProcessTrackingDocumentWithFilter(
        {_id: processTrackingId},
        updateProcessTrackingDocument
      );

      assert.isTrue(result);
      assert.isTrue(updateStub.calledOnce);
    });

    it('will fail when the process tracking document does not exist', async () => {
      const updateProcessTrackingDocument = {
        processName: 'updated processName',
      };

      const processTrackingId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(ProcessTrackingModel, 'updateOne', updateStub);

      let errorred = false;
      try {
        await ProcessTrackingModel.updateProcessTrackingDocumentWithFilter(
          {_id: processTrackingId},
          updateProcessTrackingDocument
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will fail with an InvalidOperationError when the validateUpdateObject method fails', async () => {
      const updateProcessTrackingDocument = {
        processName: 'updated processName',
      };

      const processTrackingId = new mongoose.Types.ObjectId();

      sandbox.replace(
        ProcessTrackingModel,
        'validateUpdateObject',
        sandbox.stub().rejects(new error.InvalidOperationError('you cant do that', {}))
      );

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProcessTrackingModel, 'updateOne', updateStub);

      let errorred = false;
      try {
        await ProcessTrackingModel.updateProcessTrackingDocumentWithFilter(
          {_id: processTrackingId},
          updateProcessTrackingDocument
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will fail with a DatabaseOperationError when the underlying database connection errors', async () => {
      const updateProcessTrackingDocument = {
        processName: 'updated processName',
      };

      const processTrackingId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something really bad has happened');
      sandbox.replace(ProcessTrackingModel, 'updateOne', updateStub);

      let errorred = false;
      try {
        await ProcessTrackingModel.updateProcessTrackingDocumentWithFilter(
          {_id: processTrackingId},
          updateProcessTrackingDocument
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will throw an InvalidOperationError when we attempt to supply an _id', async () => {
      const inputProcessTracking = {
        _id: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IProcessTracking;

      let errorred = false;
      try {
        await ProcessTrackingModel.validateUpdateObject(inputProcessTracking);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an InvalidOperationError when we attempt to supply a processId', async () => {
      const inputProcessTracking = {
        processId: new mongoose.Types.ObjectId().toString(),
      } as unknown as databaseTypes.IProcessTracking;

      let errorred = false;
      try {
        await ProcessTrackingModel.validateUpdateObject(inputProcessTracking);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an InvalidOperationError when we attempt to supply errors', async () => {
      const inputProcessTracking = {
        processError: ['I am an error'],
      } as unknown as databaseTypes.IProcessTracking;

      let errorred = false;
      try {
        await ProcessTrackingModel.validateUpdateObject(inputProcessTracking);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an InvalidOperationError when we attempt to supply messages', async () => {
      const inputProcessTracking = {
        processMessages: ['I have a message for you'],
      } as unknown as databaseTypes.IProcessTracking;

      let errorred = false;
      try {
        await ProcessTrackingModel.validateUpdateObject(inputProcessTracking);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('updateProcessTrackingDocumentTokenById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should update an existing process tracking', async () => {
      const updateProcessTrackingDocument = {
        processName: 'updated processName',
      };

      const processTrackingId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProcessTrackingModel, 'updateOne', updateStub);

      const getProcessTrackingByIdStub = sandbox.stub();
      getProcessTrackingByIdStub.resolves({_id: processTrackingId});
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentById', getProcessTrackingByIdStub);

      const result = await ProcessTrackingModel.updateProcessTrackingDocumentById(
        processTrackingId,
        updateProcessTrackingDocument
      );

      assert.strictEqual(result._id, processTrackingId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getProcessTrackingByIdStub.calledOnce);
    });
  });

  context('updateProcessTrackingDocumentTokenProcessId', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should update an existing process tracking', async () => {
      const updateProcessTrackingDocument = {
        processName: 'updated processName',
      };

      const processId = new mongoose.Types.ObjectId().toString();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProcessTrackingModel, 'updateOne', updateStub);

      const getProcessTrackingByProcessIdStub = sandbox.stub();
      getProcessTrackingByProcessIdStub.resolves({processId: processId});
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByProcessId', getProcessTrackingByProcessIdStub);

      const result = await ProcessTrackingModel.updateProcessTrackingDocumentByProcessId(
        processId,
        updateProcessTrackingDocument
      );

      assert.strictEqual(result.processId, processId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getProcessTrackingByProcessIdStub.calledOnce);
    });
  });

  context('delete a processTracking document by filter', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a process tracking document', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ProcessTrackingModel, 'deleteOne', deleteStub);

      const processTrackingId = new mongoose.Types.ObjectId();

      await ProcessTrackingModel.deleteProcessTrackingDocumentByFilter({
        _id: processTrackingId,
      });

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the process tracking document does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(ProcessTrackingModel, 'deleteOne', deleteStub);

      const processTrackingId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ProcessTrackingModel.deleteProcessTrackingDocumentByFilter({
          _id: processTrackingId,
        });
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
        await ProcessTrackingModel.deleteProcessTrackingDocumentByFilter({
          _id: processTrackingId,
        });
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

  context('delete a processTracking document by document id', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a process tracking document', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ProcessTrackingModel, 'deleteOne', deleteStub);

      const processTrackingId = new mongoose.Types.ObjectId();

      await ProcessTrackingModel.deleteProcessTrackingDocumentById(processTrackingId);

      assert.isTrue(deleteStub.calledOnce);
    });
  });

  context('delete a processTracking document by process id', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a process tracking document', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ProcessTrackingModel, 'deleteOne', deleteStub);

      const processId = new mongoose.Types.ObjectId().toString();

      await ProcessTrackingModel.deleteProcessTrackingDocumentProcessId(processId);

      assert.isTrue(deleteStub.calledOnce);
    });
  });

  context('addErrorsByFilter', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add an error to a process tracking document', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const localMockProcessTracker = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracker._id = processTrackingId;
      const errorObject = {error: 'oops I did it again'};

      const findByFilterStub = sandbox.stub();
      findByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByFilterStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProcessTracker);
      localMockProcessTracker.save = saveStub;

      const getProcessTrackerDocumentByFilterStub = sandbox.stub();
      getProcessTrackerDocumentByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        getProcessTrackerDocumentByFilterStub
      );

      const updatedProcessTracker = await ProcessTrackingModel.addErrorsByFilter({_id: processTrackingId}, [
        errorObject,
      ]);

      assert.strictEqual(updatedProcessTracker._id, processTrackingId);
      assert.strictEqual(updatedProcessTracker.processError[0].error, errorObject.error);

      assert.isTrue(findByFilterStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProcessTrackerDocumentByFilterStub.calledOnce);
    });

    it('will throw a data not found error when the process tracking document does not exist', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const localMockProcessTracking = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracking._id = processTrackingId;
      const errorObject = {error: 'oops I did it again'};

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProcessTracking);
      localMockProcessTracking.save = saveStub;

      const getProcessTrackerByFilterStub = sandbox.stub();
      getProcessTrackerByFilterStub.resolves(localMockProcessTracking);
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', getProcessTrackerByFilterStub);

      let errored = false;
      try {
        await ProcessTrackingModel.addErrorsByFilter({_id: processTrackingId}, [errorObject]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const localMockProcessTracking = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracking._id = processTrackingId;
      const errorObject = {error: 'oops I did it again'};

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProcessTracking);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockProcessTracking.save = saveStub;

      const getProcessTrackingByIdStub = sandbox.stub();
      getProcessTrackingByIdStub.resolves(localMockProcessTracking);
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', getProcessTrackingByIdStub);

      let errored = false;
      try {
        await ProcessTrackingModel.addErrorsByFilter({_id: processTrackingId}, [errorObject]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the error array is empty', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const localMockProcessTracking = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracking._id = processTrackingId;

      const findByFilterStub = sandbox.stub();
      findByFilterStub.resolves(localMockProcessTracking);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByFilterStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProcessTracking);
      localMockProcessTracking.save = saveStub;

      const getProcessTrackingByFileterStub = sandbox.stub();
      getProcessTrackingByFileterStub.resolves(localMockProcessTracking);
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', getProcessTrackingByFileterStub);

      let errored = false;
      try {
        await ProcessTrackingModel.addErrorsByFilter({_id: processTrackingId}, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
  context('addErrorsById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add an error to a process tracking document', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const localMockProcessTracker = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracker._id = processTrackingId;
      const errorObject = {error: 'oops I did it again'};

      const findByFilterStub = sandbox.stub();
      findByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByFilterStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProcessTracker);
      localMockProcessTracker.save = saveStub;

      const getProcessTrackerDocumentByFilterStub = sandbox.stub();
      getProcessTrackerDocumentByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        getProcessTrackerDocumentByFilterStub
      );

      const updatedProcessTracker = await ProcessTrackingModel.addErrorsById(processTrackingId, [errorObject]);

      assert.strictEqual(updatedProcessTracker._id, processTrackingId);
      assert.strictEqual(updatedProcessTracker.processError[0].error, errorObject.error);

      assert.isTrue(findByFilterStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProcessTrackerDocumentByFilterStub.calledOnce);
    });
  });

  context('addErrorsByProcessId', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add an error to a process tracking document', async () => {
      const processId = new mongoose.Types.ObjectId().toString();
      const localMockProcessTracker = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracker.processId = processId;
      const errorObject = {error: 'oops I did it again'};

      const findByFilterStub = sandbox.stub();
      findByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByFilterStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProcessTracker);
      localMockProcessTracker.save = saveStub;

      const getProcessTrackerDocumentByFilterStub = sandbox.stub();
      getProcessTrackerDocumentByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        getProcessTrackerDocumentByFilterStub
      );

      const updatedProcessTracker = await ProcessTrackingModel.addErrorsByProcessId(processId, [errorObject]);

      assert.strictEqual(updatedProcessTracker.processId, processId);
      assert.strictEqual(updatedProcessTracker.processError[0].error, errorObject.error);

      assert.isTrue(findByFilterStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProcessTrackerDocumentByFilterStub.calledOnce);
    });
  });
  context('addMessagesByFilter', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add a message to a process tracking document', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const localMockProcessTracker = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracker._id = processTrackingId;
      const message = "you've got mail";

      const findByFilterStub = sandbox.stub();
      findByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByFilterStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProcessTracker);
      localMockProcessTracker.save = saveStub;

      const getProcessTrackerDocumentByFilterStub = sandbox.stub();
      getProcessTrackerDocumentByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        getProcessTrackerDocumentByFilterStub
      );

      const updatedProcessTracker = await ProcessTrackingModel.addMessagesByFilter({_id: processTrackingId}, [message]);

      assert.strictEqual(updatedProcessTracker._id, processTrackingId);
      assert.strictEqual(updatedProcessTracker.processMessages[0], message);

      assert.isTrue(findByFilterStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProcessTrackerDocumentByFilterStub.calledOnce);
    });

    it('will throw a data not found error when the process tracking document does not exist', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const localMockProcessTracking = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracking._id = processTrackingId;
      const message = "you've got mail";

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProcessTracking);
      localMockProcessTracking.save = saveStub;

      const getProcessTrackerByFilterStub = sandbox.stub();
      getProcessTrackerByFilterStub.resolves(localMockProcessTracking);
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', getProcessTrackerByFilterStub);

      let errored = false;
      try {
        await ProcessTrackingModel.addMessagesByFilter({_id: processTrackingId}, [message]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const localMockProcessTracking = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracking._id = processTrackingId;
      const message = "you've got mail";

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProcessTracking);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockProcessTracking.save = saveStub;

      const getProcessTrackingByIdStub = sandbox.stub();
      getProcessTrackingByIdStub.resolves(localMockProcessTracking);
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', getProcessTrackingByIdStub);

      let errored = false;
      try {
        await ProcessTrackingModel.addMessagesByFilter({_id: processTrackingId}, [message]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the error array is empty', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const localMockProcessTracking = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracking._id = processTrackingId;

      const findByFilterStub = sandbox.stub();
      findByFilterStub.resolves(localMockProcessTracking);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByFilterStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProcessTracking);
      localMockProcessTracking.save = saveStub;

      const getProcessTrackingByFileterStub = sandbox.stub();
      getProcessTrackingByFileterStub.resolves(localMockProcessTracking);
      sandbox.replace(ProcessTrackingModel, 'getProcessTrackingDocumentByFilter', getProcessTrackingByFileterStub);

      let errored = false;
      try {
        await ProcessTrackingModel.addMessagesByFilter({_id: processTrackingId}, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
  context('addMessagesById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add an message to a process tracking document', async () => {
      const processTrackingId = new mongoose.Types.ObjectId();
      const localMockProcessTracker = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracker._id = processTrackingId;
      const message = "you've got mail";

      const findByFilterStub = sandbox.stub();
      findByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByFilterStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProcessTracker);
      localMockProcessTracker.save = saveStub;

      const getProcessTrackerDocumentByFilterStub = sandbox.stub();
      getProcessTrackerDocumentByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        getProcessTrackerDocumentByFilterStub
      );

      const updatedProcessTracker = await ProcessTrackingModel.addMessagesById(processTrackingId, [message]);

      assert.strictEqual(updatedProcessTracker._id, processTrackingId);
      assert.strictEqual(updatedProcessTracker.processMessages[0], message);

      assert.isTrue(findByFilterStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProcessTrackerDocumentByFilterStub.calledOnce);
    });
  });

  context('addMessagesByProcessId', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add an error to a process tracking document', async () => {
      const processId = new mongoose.Types.ObjectId().toString();
      const localMockProcessTracker = JSON.parse(JSON.stringify(MOCK_PROCESS_TRACKING_DOCUMENT));
      localMockProcessTracker.processId = processId;
      const message = "you've got mail";

      const findByFilterStub = sandbox.stub();
      findByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(ProcessTrackingModel, 'findOne', findByFilterStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProcessTracker);
      localMockProcessTracker.save = saveStub;

      const getProcessTrackerDocumentByFilterStub = sandbox.stub();
      getProcessTrackerDocumentByFilterStub.resolves(localMockProcessTracker);
      sandbox.replace(
        ProcessTrackingModel,
        'getProcessTrackingDocumentByFilter',
        getProcessTrackerDocumentByFilterStub
      );

      const updatedProcessTracker = await ProcessTrackingModel.addMessagesByProcessId(processId, [message]);

      assert.strictEqual(updatedProcessTracker.processId, processId);
      assert.strictEqual(updatedProcessTracker.processMessages[0], message);

      assert.isTrue(findByFilterStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProcessTrackerDocumentByFilterStub.calledOnce);
    });
  });
});
