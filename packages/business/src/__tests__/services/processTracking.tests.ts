import 'mocha';
import {assert} from 'chai';
import {ProcessTrackingService} from '../../services/processTracking';
import {createSandbox} from 'sinon';
import {MongoDbConnection} from '@glyphx/database';
import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {error} from '@glyphx/core';
import {dbConnection} from '../../../dist';

describe('ProcessTrackingService', () => {
  context('createProcessTracking', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id: new mongooseTypes.ObjectId(),
      processId: 'testProcessId',
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processMessages: [],
      processError: [],
    };
    const dbConnection = new MongoDbConnection();
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should create a processTracking document', async () => {
      const createStub = sandbox.stub();
      createStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'createProcessTrackingDocument',
        createStub
      );

      const result = await ProcessTrackingService.createProcessTracking(
        mockProcessTracking.processId,
        mockProcessTracking.processName
      );
      assert.equal(result.processId, mockProcessTracking.processId);
      assert.equal(
        createStub.getCall(0).args[0].processStatus,
        databaseTypes.constants.PROCESS_STATUS.PENDING
      );
    });

    it('should create a processTracking document respecting our passed status', async () => {
      const createStub = sandbox.stub();
      createStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'createProcessTrackingDocument',
        createStub
      );

      const result = await ProcessTrackingService.createProcessTracking(
        mockProcessTracking.processId,
        mockProcessTracking.processName,
        databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS
      );
      assert.equal(result.processId, mockProcessTracking.processId);
      assert.equal(
        createStub.getCall(0).args[0].processStatus,
        databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS
      );
    });

    it('should publish and throw a DataValidationError thrown by the model', async () => {
      const notFoundError = new error.DataValidationError(
        'The data is not valid',
        'key',
        'value'
      );
      const createStub = sandbox.stub();
      createStub.rejects(notFoundError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'createProcessTrackingDocument',
        createStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataValidationError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await ProcessTrackingService.createProcessTracking(
          mockProcessTracking.processId,
          mockProcessTracking.processName
        );
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('should publish and throw a DataServiceError when the model throws any other error', async () => {
      const databaseError = new error.DatabaseOperationError(
        'An error occurred',
        'mongoDb',
        'createProcessTrackingDocument'
      );
      const createStub = sandbox.stub();
      createStub.rejects(databaseError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'createProcessTrackingDocument',
        createStub
      );

      const publishOverride = sandbox.stub();
      //it doesn't really return this. In real life it should return a service error, but we do not have a good way to trap this.
      publishOverride.resolves(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await ProcessTrackingService.createProcessTracking(
          mockProcessTracking.processId,
          mockProcessTracking.processName
        );
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }

      assert.isTrue(errored);
      assert.isTrue(publishOverride.calledOnce);
    });
  });

  context('getProcessStatus', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id: new mongooseTypes.ObjectId(),
      processId: 'testProcessId',
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processMessages: [
        'message1',
        'message2',
        'message3',
        'message4',
        'message5',
        'message6',
        'message7',
        'message8',
        'message9',
        'message10',
        'message11',
        'message12',
        'message13',
        'message14',
        'message15',
      ],
      processError: [
        {message: 'error1'},
        {message: 'error2'},
        {message: 'error3'},
        {message: 'error4'},
        {message: 'error5'},
        {message: 'error6'},
        {message: 'error7'},
        {message: 'error8'},
        {message: 'error9'},
        {message: 'error10'},
        {message: 'error11'},
        {message: 'error12'},
      ],
      processResult: {result: "i'm good"},
    };
    const dbConnection = new MongoDbConnection();
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('should return the process status processId is a string', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentByProcessId',
        getStub
      );

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessStatus(processId);
      assert.isOk(result);
      assert.strictEqual(
        result?.processStatus,
        mockProcessTracking.processStatus
      );
      assert.strictEqual(result?.processError.length, 10);
      assert.strictEqual(
        result?.processError[0].message,
        mockProcessTracking.processError[0].message
      );
      assert.strictEqual(result?.processMessages.length, 10);
      assert.strictEqual(
        result?.processMessages[0],
        mockProcessTracking.processMessages[0]
      );
      assert.strictEqual(
        result?.processResult?.result,
        mockProcessTracking.processResult?.result
      );
    });

    it('should return the process status processId is an ObjectId', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getStub
      );

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessStatus(processId);
      assert.isOk(result);
      assert.strictEqual(
        result?.processStatus,
        mockProcessTracking.processStatus
      );
      assert.strictEqual(result?.processError.length, 10);
      assert.strictEqual(
        result?.processError[0].message,
        mockProcessTracking.processError[0].message
      );
      assert.strictEqual(result?.processMessages.length, 10);
      assert.strictEqual(
        result?.processMessages[0],
        mockProcessTracking.processMessages[0]
      );
      assert.strictEqual(
        result?.processResult?.result,
        mockProcessTracking.processResult?.result
      );
    });
    it('will return null when the processId does not exist', async () => {
      const notFoundError = new error.DataNotFoundError(
        'the data is not found',
        'key',
        'value'
      );
      const getStub = sandbox.stub();
      getStub.rejects(notFoundError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessStatus(processId);
      assert.isNotOk(result);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will throw a DataServiceError when any other error is thrown by the model', async () => {
      const databaseError = new error.DatabaseOperationError(
        'An error occurred',
        'mongoDb',
        'createProcessTrackingDocument'
      );
      const getStub = sandbox.stub();
      getStub.rejects(databaseError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getStub
      );

      const publishOverride = sandbox.stub();
      //it doesn't really return this. In real life it should return a service error, but we do not have a good way to trap this.
      publishOverride.resolves(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      let errored = false;
      try {
        await ProcessTrackingService.getProcessStatus(processId);
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }

      assert.isTrue(errored);
      assert.isTrue(publishOverride.calledOnce);
    });
  });

  context('updateProcessStatus', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id: new mongooseTypes.ObjectId(),
      processId: 'testProcessId',
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processMessages: [],
      processError: [],
    };
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should update the process status using the processId as string', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingDocumentByProcessId',
        updateStub
      );

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addMessagesById',
        addMessageStub
      );

      const processId = mockProcessTracking.processId;
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;

      await ProcessTrackingService.updateProcessStatus(
        processId,
        processStatus
      );

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0], processId);
      assert.strictEqual(updateArgs[1].processStatus, processStatus);
      assert.isNotOk(updateArgs[1].processEndTime);
      assert.isNotOk(updateArgs[1].processResult);

      assert.isFalse(addMessageStub.called);
    });

    it('should update the process status using the processId as an ObjectId', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingDocumentById',
        updateStub
      );

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addMessagesById',
        addMessageStub
      );

      const processId = new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;

      await ProcessTrackingService.updateProcessStatus(
        processId,
        processStatus
      );

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0].toString(), processId.toString());
      assert.strictEqual(updateArgs[1].processStatus, processStatus);
      assert.isNotOk(updateArgs[1].processEndTime);
      assert.isNotOk(updateArgs[1].processResult);

      assert.isFalse(addMessageStub.called);
    });

    it('should update the endTime and Result if status === "completed"', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingDocumentById',
        updateStub
      );

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addMessagesById',
        addMessageStub
      );

      const processId = new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.COMPLETED;

      await ProcessTrackingService.updateProcessStatus(
        processId,
        processStatus
      );

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0].toString(), processId.toString());
      assert.strictEqual(updateArgs[1].processStatus, processStatus);
      assert.isOk(updateArgs[1].processEndTime);
      assert.isOk(updateArgs[1].processResult);

      assert.isFalse(addMessageStub.called);
    });

    it('should update the endTime and Result if status === "failed"', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingDocumentById',
        updateStub
      );

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addMessagesById',
        addMessageStub
      );

      const processId = new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;

      await ProcessTrackingService.updateProcessStatus(
        processId,
        processStatus
      );

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0].toString(), processId.toString());
      assert.strictEqual(updateArgs[1].processStatus, processStatus);
      assert.isOk(updateArgs[1].processEndTime);
      assert.isOk(updateArgs[1].processResult);

      assert.isFalse(addMessageStub.called);
    });

    it('should add a message if it is supplied as an arg', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingDocumentById',
        updateStub
      );

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addMessagesById',
        addMessageStub
      );

      const processId = new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const message = 'test message';
      await ProcessTrackingService.updateProcessStatus(
        processId,
        processStatus,
        message
      );

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0].toString(), processId.toString());
      assert.strictEqual(updateArgs[1].processStatus, processStatus);
      assert.isNotOk(updateArgs[1].processEndTime);
      assert.isNotOk(updateArgs[1].processResult);

      assert.isTrue(addMessageStub.called);
    });

    it('should publish a DataNotFound error that is thrown by the model', async () => {
      const notFoundError = new error.DataNotFoundError(
        'the data is not found',
        'key',
        'value'
      );
      const updateStub = sandbox.stub();
      updateStub.rejects(notFoundError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingDocumentById',
        updateStub
      );

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addMessagesById',
        addMessageStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const message = 'test message';
      let errored = false;
      try {
        await ProcessTrackingService.updateProcessStatus(
          processId,
          processStatus,
          message
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateStub.calledOnce);

      assert.isFalse(addMessageStub.called);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish and throw a DataServiceError when the model throws any other error', async () => {
      const databaseError = new error.DatabaseOperationError(
        'the data is not found',
        'mongoDb',
        'updateProcessTracking'
      );
      const updateStub = sandbox.stub();
      updateStub.rejects(databaseError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingDocumentById',
        updateStub
      );

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addMessagesById',
        addMessageStub
      );

      const publishOverride = sandbox.stub();
      publishOverride.returns(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const message = 'test message';
      let errored = false;
      try {
        await ProcessTrackingService.updateProcessStatus(
          processId,
          processStatus,
          message
        );
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateStub.calledOnce);

      assert.isFalse(addMessageStub.called);
      assert.isTrue(publishOverride.calledOnce);
    });
  });

  context('completeProcess', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id: new mongooseTypes.ObjectId(),
      processId: 'testProcessId',
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processMessages: [],
      processError: [],
    };
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should update the process to complete with the processId as a string', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingDocumentByProcessId',
        updateStub
      );

      const processId = mockProcessTracking.processId;
      const processStatus = databaseTypes.constants.PROCESS_STATUS.COMPLETED;
      const result = {text: 'I am finished'};

      await ProcessTrackingService.completeProcess(
        processId,
        result,
        processStatus
      );

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0], processId);
      assert.strictEqual(updateArgs[1].processStatus, processStatus);
      assert.isOk(updateArgs[1].processEndTime);
      assert.strictEqual(updateArgs[1].processResult.text, result.text);
    });

    it('should update the process to complete with the processId as an ObjectId', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingDocumentById',
        updateStub
      );

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const processStatus = databaseTypes.constants.PROCESS_STATUS.COMPLETED;
      const result = {text: 'I am finished'};

      await ProcessTrackingService.completeProcess(
        processId,
        result,
        processStatus
      );

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0].toString(), processId.toString());
      assert.strictEqual(updateArgs[1].processStatus, processStatus);
      assert.isOk(updateArgs[1].processEndTime);
      assert.strictEqual(updateArgs[1].processResult.text, result.text);
    });

    it('should publish a DataNotFound error that is thrown by the model', async () => {
      const notFoundError = new error.DataNotFoundError(
        'the data is not found',
        'key',
        'value'
      );
      const updateStub = sandbox.stub();
      updateStub.rejects(notFoundError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingDocumentById',
        updateStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const result = {text: 'I am finished'};
      let errored = false;
      try {
        await ProcessTrackingService.completeProcess(
          processId,
          result,
          processStatus
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateStub.calledOnce);

      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish and throw a DataServiceError when the model throws any other error', async () => {
      const databaseError = new error.DatabaseOperationError(
        'the data is not found',
        'mongoDb',
        'updateProcessTracking'
      );
      const updateStub = sandbox.stub();
      updateStub.rejects(databaseError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'updateProcessTrackingDocumentById',
        updateStub
      );

      const publishOverride = sandbox.stub();
      publishOverride.returns(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const result = {text: 'I am finished'};
      let errored = false;
      try {
        await ProcessTrackingService.completeProcess(
          processId,
          result,
          processStatus
        );
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateStub.calledOnce);

      assert.isTrue(publishOverride.calledOnce);
    });
  });

  context('addProcessError', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id: new mongooseTypes.ObjectId(),
      processId: 'testProcessId',
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processMessages: [],
      processError: [],
    };
    const dbConnection = new MongoDbConnection();
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should add an error to the process with the processId as a string', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addErrorsByProcessId',
        updateStub
      );

      const processId = mockProcessTracking.processId;
      const processError = new error.GlyphxError('I am an error', 999);

      await ProcessTrackingService.addProcessError(processId, processError);

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0], processId);
      assert.strictEqual(updateArgs[1][0].message, processError.message);
    });

    it('should add an error to the process with the processId as an ObjectId', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addErrorsById',
        updateStub
      );

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const processError = new error.GlyphxError('I am an error', 999);

      await ProcessTrackingService.addProcessError(processId, processError);

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0].toString(), processId.toString());
      assert.strictEqual(updateArgs[1][0].message, processError.message);
    });

    it('should publish and throw a DataNotFoundError when the processId does not exist', async () => {
      const notFoundError = new error.DataNotFoundError(
        'the data is not found',
        'key',
        'value'
      );
      const updateStub = sandbox.stub();
      updateStub.rejects(notFoundError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addErrorsById',
        updateStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const processError = new error.GlyphxError('I am an error', 999);

      let errored = false;
      try {
        await ProcessTrackingService.addProcessError(processId, processError);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errored);

      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish and throw a DataServiceError when the model throws a DatabaseOperationError', async () => {
      const databaseError = new error.DatabaseOperationError(
        'something bad happened',
        'mongoDb',
        'addErrorsById'
      );
      const updateStub = sandbox.stub();
      updateStub.rejects(databaseError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addErrorsById',
        updateStub
      );

      const publishOverride = sandbox.stub();
      publishOverride.returns(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const processError = new error.GlyphxError('I am an error', 999);

      let errored = false;
      try {
        await ProcessTrackingService.addProcessError(processId, processError);
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errored);

      assert.isTrue(publishOverride.calledOnce);
    });
  });

  context('addProcessMessage', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id: new mongooseTypes.ObjectId(),
      processId: 'testProcessId',
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processMessages: [],
      processError: [],
    };
    const dbConnection = new MongoDbConnection();
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should add a message to the process with the processId as a string', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addMessagesByProcessId',
        updateStub
      );

      const processId = mockProcessTracking.processId;
      const message = 'I am a message';

      await ProcessTrackingService.addProcessMessage(processId, message);

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0], processId);
      assert.strictEqual(updateArgs[1][0], message);
    });

    it('should add a message to the process with the processId as an ObjectId', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addMessagesById',
        updateStub
      );

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const message = 'I am a message';

      await ProcessTrackingService.addProcessMessage(processId, message);

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0].toString(), processId.toString());
      assert.strictEqual(updateArgs[1][0], message);
    });

    it('should publish and throw a DataNotFoundError when the processId does not exist', async () => {
      const notFoundError = new error.DataNotFoundError(
        'the data is not found',
        'key',
        'value'
      );
      const updateStub = sandbox.stub();
      updateStub.rejects(notFoundError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addMessagesById',
        updateStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const message = 'I am a message';

      let errored = false;
      try {
        await ProcessTrackingService.addProcessMessage(processId, message);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errored);

      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish and throw a DataServiceError when the model throws a DatabaseOperationError', async () => {
      const databaseError = new error.DatabaseOperationError(
        'something bad happened',
        'mongoDb',
        'addErrorsById'
      );
      const updateStub = sandbox.stub();
      updateStub.rejects(databaseError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'addMessagesById',
        updateStub
      );

      const publishOverride = sandbox.stub();
      publishOverride.returns(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const message = 'I am a message';

      let errored = false;
      try {
        await ProcessTrackingService.addProcessMessage(processId, message);
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errored);

      assert.isTrue(publishOverride.calledOnce);
    });
  });

  context('getProcessTracking', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id: new mongooseTypes.ObjectId(),
      processId: 'testProcessId',
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processMessages: [
        'message1',
        'message2',
        'message3',
        'message4',
        'message5',
        'message6',
        'message7',
        'message8',
        'message9',
        'message10',
        'message11',
        'message12',
        'message13',
        'message14',
        'message15',
      ],
      processError: [
        {message: 'error1'},
        {message: 'error2'},
        {message: 'error3'},
        {message: 'error4'},
        {message: 'error5'},
        {message: 'error6'},
        {message: 'error7'},
        {message: 'error8'},
        {message: 'error9'},
        {message: 'error10'},
        {message: 'error11'},
        {message: 'error12'},
      ],
      processResult: {result: "i'm good"},
    };
    const dbConnection = new MongoDbConnection();
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return the processTracking object when processId is a string', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentByProcessId',
        getStub
      );

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessTracking(processId);
      assert.isOk(result);
      assert.strictEqual(
        result?.processStatus,
        mockProcessTracking.processStatus
      );
      assert.strictEqual(
        result?.processError.length,
        mockProcessTracking.processError.length
      );
      assert.strictEqual(
        result?.processError[0].message,
        mockProcessTracking.processError[0].message
      );
      assert.strictEqual(
        result?.processMessages.length,
        mockProcessTracking.processMessages.length
      );
      assert.strictEqual(
        result?.processMessages[0],
        mockProcessTracking.processMessages[0]
      );
      assert.strictEqual(
        result?.processResult?.result,
        mockProcessTracking.processResult?.result
      );

      assert.strictEqual(
        result?.processStartTime.getTime(),
        mockProcessTracking.processStartTime.getTime()
      );

      assert.strictEqual(result?.processId, mockProcessTracking.processId);
      assert.strictEqual(result?.processName, mockProcessTracking.processName);
      assert.strictEqual(result?._id, mockProcessTracking._id);
    });

    it('should return the processTracking document when processId is an ObjectId', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getStub
      );

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessTracking(processId);
      assert.isOk(result);
      assert.strictEqual(
        result?.processStatus,
        mockProcessTracking.processStatus
      );
      assert.strictEqual(
        result?.processError.length,
        mockProcessTracking.processError.length
      );
      assert.strictEqual(
        result?.processError[0].message,
        mockProcessTracking.processError[0].message
      );
      assert.strictEqual(
        result?.processMessages.length,
        mockProcessTracking.processMessages.length
      );
      assert.strictEqual(
        result?.processMessages[0],
        mockProcessTracking.processMessages[0]
      );
      assert.strictEqual(
        result?.processResult?.result,
        mockProcessTracking.processResult?.result
      );

      assert.strictEqual(
        result?.processStartTime.getTime(),
        mockProcessTracking.processStartTime.getTime()
      );

      assert.strictEqual(result?.processId, mockProcessTracking.processId);
      assert.strictEqual(result?.processName, mockProcessTracking.processName);
      assert.strictEqual(result?._id, mockProcessTracking._id);
    });

    it('will return null when the processId does not exist', async () => {
      const notFoundError = new error.DataNotFoundError(
        'the data is not found',
        'key',
        'value'
      );
      const getStub = sandbox.stub();
      getStub.rejects(notFoundError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessTracking(processId);
      assert.isNotOk(result);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will throw a DataServiceError when any other error is thrown by the model', async () => {
      const databaseError = new error.DatabaseOperationError(
        'An error occurred',
        'mongoDb',
        'createProcessTrackingDocument'
      );
      const getStub = sandbox.stub();
      getStub.rejects(databaseError);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getStub
      );

      const publishOverride = sandbox.stub();
      //it doesn't really return this. In real life it should return a service error, but we do not have a good way to trap this.
      publishOverride.resolves(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      let errored = false;
      try {
        await ProcessTrackingService.getProcessTracking(processId);
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }

      assert.isTrue(errored);
      assert.isTrue(publishOverride.calledOnce);
    });
  });

  context('getProcessError', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id: new mongooseTypes.ObjectId(),
      processId: 'testProcessId',
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processMessages: [],
      processError: [
        {message: 'error1'},
        {message: 'error2'},
        {message: 'error3'},
        {message: 'error4'},
        {message: 'error5'},
        {message: 'error6'},
        {message: 'error7'},
        {message: 'error8'},
        {message: 'error9'},
        {message: 'error10'},
        {message: 'error11'},
        {message: 'error12'},
      ],
    };
    const dbConnection = new MongoDbConnection();
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return the processTracking.processError array  when processId is a string', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentByProcessId',
        getStub
      );

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessError(processId);
      assert.isOk(result);
      assert.strictEqual(
        result?.processError.length,
        mockProcessTracking.processError.length
      );
      assert.strictEqual(
        result?.processError[0].message,
        mockProcessTracking.processError[0].message
      );
    });

    it('should return the processTracking processError array when processId is an ObjectId', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getStub
      );

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessError(processId);
      assert.isOk(result);
      assert.strictEqual(
        result?.processError.length,
        mockProcessTracking.processError.length
      );
      assert.strictEqual(
        result?.processError[0].message,
        mockProcessTracking.processError[0].message
      );
    });

    it('should return null when processId is not found', async () => {
      const getStub = sandbox.stub();
      getStub.rejects(new error.DataNotFoundError('not found', 'key', 'value'));
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentByProcessId',
        getStub
      );

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessError(processId);
      assert.isNotOk(result);
    });
  });

  context('getProcessMessages', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id: new mongooseTypes.ObjectId(),
      processId: 'testProcessId',
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processMessages: [
        'message1',
        'message2',
        'message3',
        'message4',
        'message5',
        'message6',
        'message7',
        'message8',
        'message9',
        'message10',
        'message11',
        'message12',
        'message13',
        'message14',
        'message15',
      ],
      processError: [],
    };
    const dbConnection = new MongoDbConnection();
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return the processTracking processMessages array when processId is a string', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentByProcessId',
        getStub
      );

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessMessages(processId);
      assert.isOk(result);
      assert.strictEqual(
        result?.processMessages.length,
        mockProcessTracking.processMessages.length
      );
      assert.strictEqual(
        result?.processMessages[0],
        mockProcessTracking.processMessages[0]
      );
    });

    it('should return the processTracking processMessages array when processId is an ObjectId', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getStub
      );

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessMessages(processId);
      assert.isOk(result);
      assert.strictEqual(
        result?.processMessages.length,
        mockProcessTracking.processMessages.length
      );
      assert.strictEqual(
        result?.processMessages[0],
        mockProcessTracking.processMessages[0]
      );
    });
    it('should return null when processId is not found', async () => {
      const getStub = sandbox.stub();
      getStub.rejects(new error.DataNotFoundError('not found', 'key', 'value'));
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentByProcessId',
        getStub
      );

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessMessages(processId);
      assert.isNotOk(result);
    });
  });

  context('getProcessResult', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id: new mongooseTypes.ObjectId(),
      processId: 'testProcessId',
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processMessages: [],
      processError: [],
      processResult: {result: "i'm good"},
    };
    const dbConnection = new MongoDbConnection();
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return the processTracking processResult object when processId is a string', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentByProcessId',
        getStub
      );

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessResult(processId);
      assert.isOk(result);
      assert.strictEqual(
        result?.processResult?.result,
        mockProcessTracking.processResult?.result
      );
    });

    it('should return the processTracking processResult object when processId is an ObjectId', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentById',
        getStub
      );

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessResult(processId);
      assert.isOk(result);
      assert.strictEqual(
        result?.processResult?.result,
        mockProcessTracking.processResult?.result
      );
    });
    it('should return null when processId is not found', async () => {
      const getStub = sandbox.stub();
      getStub.rejects(new error.DataNotFoundError('not found', 'key', 'value'));
      sandbox.replace(
        dbConnection.models.ProcessTrackingModel,
        'getProcessTrackingDocumentByProcessId',
        getStub
      );

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessResult(processId);
      assert.isNotOk(result);
    });
  });
});
