import 'mocha';
import {assert} from 'chai';
import {ProcessTrackingService} from '../../services/processTracking';
import {createSandbox} from 'sinon';
import {MongoDbConnection} from 'database';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {error} from 'core';

describe.only('ProcessTrackingService', () => {
  context('createProcessTracking', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id:
        // @ts-ignore
        new mongooseTypes.ObjectId(),
      processId: new mongooseTypes.ObjectId().toString(),
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'createProcessTrackingDocument', createStub);

      const result = await ProcessTrackingService.createProcessTracking(
        mockProcessTracking.processId,
        mockProcessTracking.processName
      );
      assert.equal(result.processId, mockProcessTracking.processId);
      assert.equal(createStub.getCall(0).args[0].processStatus, databaseTypes.constants.PROCESS_STATUS.PENDING);
    });

    it('should create a processTracking document respecting our passed status', async () => {
      const createStub = sandbox.stub();
      createStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'createProcessTrackingDocument', createStub);

      const result = await ProcessTrackingService.createProcessTracking(
        mockProcessTracking.processId,
        mockProcessTracking.processName,
        databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS
      );
      assert.equal(result.processId, mockProcessTracking.processId);
      assert.equal(createStub.getCall(0).args[0].processStatus, databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS);
    });

    it('should publish and throw a DataValidationError thrown by the model', async () => {
      const notFoundError = new error.DataValidationError('The data is not valid', 'key', 'value');
      const createStub = sandbox.stub();
      createStub.rejects(notFoundError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'createProcessTrackingDocument', createStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.DataValidationError);

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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'createProcessTrackingDocument', createStub);

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
      id: new mongooseTypes.ObjectId().toString(),
      processId: new mongooseTypes.ObjectId().toString(),
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      processStartTime: new Date(),
      processHeartbeat: new Date(),
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const reconcileStatusStub = sandbox.stub();
      reconcileStatusStub.resolves(mockProcessTracking);
      sandbox.replace(ProcessTrackingService as any, 'reconcileStatus', reconcileStatusStub);

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessStatus(processId);
      assert.isOk(result);
      assert.strictEqual(result?.processStatus, mockProcessTracking.processStatus);
      assert.strictEqual(result?.processError.length, 10);
      assert.strictEqual(result?.processError[0].message, mockProcessTracking.processError[0].message);
      assert.strictEqual(result?.processMessages.length, 10);
      assert.strictEqual(result?.processMessages[0], mockProcessTracking.processMessages[0]);
      assert.strictEqual(result?.processResult?.result, mockProcessTracking.processResult?.result);
      assert.isOk(result?.processHeartbeat);
      assert.isTrue(reconcileStatusStub.calledOnce);
    });

    it('should return the process status processId is an ObjectId', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const reconcileStatusStub = sandbox.stub();
      reconcileStatusStub.resolves(mockProcessTracking);
      sandbox.replace(ProcessTrackingService as any, 'reconcileStatus', reconcileStatusStub);

      const processId = mockProcessTracking.id;
      const result = await ProcessTrackingService.getProcessStatus(processId!);
      assert.isOk(result);
      assert.strictEqual(result?.processStatus, mockProcessTracking.processStatus);
      assert.strictEqual(result?.processError.length, 10);
      assert.strictEqual(result?.processError[0].message, mockProcessTracking.processError[0].message);
      assert.strictEqual(result?.processMessages.length, 10);
      assert.strictEqual(result?.processMessages[0], mockProcessTracking.processMessages[0]);
      assert.strictEqual(result?.processResult?.result, mockProcessTracking.processResult?.result);
      assert.isOk(result?.processHeartbeat);
      assert.isTrue(reconcileStatusStub.calledOnce);
    });

    it('will return null when the processId does not exist', async () => {
      const notFoundError = new error.DataNotFoundError('the data is not found', 'key', 'value');
      const getStub = sandbox.stub();
      getStub.rejects(notFoundError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const reconcileStatusStub = sandbox.stub();
      reconcileStatusStub.resolves(mockProcessTracking);
      sandbox.replace(ProcessTrackingService as any, 'reconcileStatus', reconcileStatusStub);
      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);

        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessStatus(processId.toString());
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);
      const reconcileStatusStub = sandbox.stub();
      reconcileStatusStub.resolves(mockProcessTracking);
      sandbox.replace(ProcessTrackingService as any, 'reconcileStatus', reconcileStatusStub);

      const publishOverride = sandbox.stub();
      //it doesn't really return this. In real life it should return a service error, but we do not have a good way to trap this.
      publishOverride.resolves(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      let errored = false;
      try {
        await ProcessTrackingService.getProcessStatus(processId.toString());
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
      _id:
        // @ts-ignore
        new mongooseTypes.ObjectId(),
      processId: new mongooseTypes.ObjectId().toString(),
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

    it('should update the process status using the processId as string', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', addMessageStub);

      const processId = mockProcessTracking.processId;
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;

      await ProcessTrackingService.updateProcessStatus(processId, processStatus);

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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', addMessageStub);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;

      await ProcessTrackingService.updateProcessStatus(processId.toString(), processStatus);

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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', addMessageStub);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.COMPLETED;

      await ProcessTrackingService.updateProcessStatus(processId.toString(), processStatus);

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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', addMessageStub);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;

      await ProcessTrackingService.updateProcessStatus(processId.toString(), processStatus);

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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', addMessageStub);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const message = 'test message';
      await ProcessTrackingService.updateProcessStatus(processId.toString(), processStatus, message);

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0].toString(), processId.toString());
      assert.strictEqual(updateArgs[1].processStatus, processStatus);
      assert.isNotOk(updateArgs[1].processEndTime);
      assert.isNotOk(updateArgs[1].processResult);

      assert.isTrue(addMessageStub.called);
    });

    it('should publish an InvalidArgumentError that is thrown by the model', async () => {
      const notFoundError = new error.InvalidArgumentError('the data is not found', 'key', 'value');
      const updateStub = sandbox.stub();
      updateStub.rejects(notFoundError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', addMessageStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);

        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const message = 'test message';
      let errored = false;
      try {
        await ProcessTrackingService.updateProcessStatus(processId.toString(), processStatus, message);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateStub.calledOnce);

      assert.isFalse(addMessageStub.called);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish an InvalidOperationError that is thrown by the model', async () => {
      const operationError = new error.InvalidOperationError('bad op', {});
      const updateStub = sandbox.stub();
      updateStub.rejects(operationError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', addMessageStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);

        //@ts-ignore
        assert.strictEqual(this.message, operationError.message);
      }

      const boundPublish = fakePublish.bind(operationError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const message = 'test message';
      let errored = false;
      try {
        await ProcessTrackingService.updateProcessStatus(processId.toString(), processStatus, message);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', addMessageStub);

      const publishOverride = sandbox.stub();
      publishOverride.returns(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const message = 'test message';
      let errored = false;
      try {
        await ProcessTrackingService.updateProcessStatus(processId.toString(), processStatus, message);
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
      _id:
        // @ts-ignore
        new mongooseTypes.ObjectId(),
      processId: new mongooseTypes.ObjectId().toString(),
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

    it('should update the process to complete with the processId as a string', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const processId = mockProcessTracking.processId;
      const processStatus = databaseTypes.constants.PROCESS_STATUS.COMPLETED;
      const result = {text: 'I am finished'};

      await ProcessTrackingService.completeProcess(processId, result, processStatus);

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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const processStatus = databaseTypes.constants.PROCESS_STATUS.COMPLETED;
      const result = {text: 'I am finished'};

      await ProcessTrackingService.completeProcess(processId.toString(), result, processStatus);

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0].toString(), processId.toString());
      assert.strictEqual(updateArgs[1].processStatus, processStatus);
      assert.isOk(updateArgs[1].processEndTime);
      assert.strictEqual(updateArgs[1].processResult.text, result.text);
    });

    it('should publish an InvalidArgumentError that is thrown by the model', async () => {
      const notFoundError = new error.InvalidArgumentError('the data is not found', 'key', 'value');
      const updateStub = sandbox.stub();
      updateStub.rejects(notFoundError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);

        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const result = {text: 'I am finished'};
      let errored = false;
      try {
        await ProcessTrackingService.completeProcess(processId.toString(), result, processStatus);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateStub.calledOnce);

      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish an InvalidOperationError that is thrown by the model', async () => {
      const notFoundError = new error.InvalidOperationError('the data is not found', {});
      const updateStub = sandbox.stub();
      updateStub.rejects(notFoundError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);

        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const result = {text: 'I am finished'};
      let errored = false;
      try {
        await ProcessTrackingService.completeProcess(processId.toString(), result, processStatus);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const publishOverride = sandbox.stub();
      publishOverride.returns(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      const result = {text: 'I am finished'};
      let errored = false;
      try {
        await ProcessTrackingService.completeProcess(processId.toString(), result, processStatus);
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
      _id:
        // @ts-ignore
        new mongooseTypes.ObjectId(),
      processId: new mongooseTypes.ObjectId().toString(),
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addErrorsById', updateStub);

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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addErrorsById', updateStub);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const processError = new error.GlyphxError('I am an error', 999);

      await ProcessTrackingService.addProcessError(processId.toString(), processError);

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0].toString(), processId.toString());
      assert.strictEqual(updateArgs[1][0].message, processError.message);
    });

    it('should publish and throw a DataNotFoundError when the processId does not exist', async () => {
      const notFoundError = new error.DataNotFoundError('the data is not found', 'key', 'value');
      const updateStub = sandbox.stub();
      updateStub.rejects(notFoundError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addErrorsById', updateStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);

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
        await ProcessTrackingService.addProcessError(processId.toString(), processError);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errored);

      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish and throw an InvalidArgumentError when it is thrown by the model', async () => {
      const notFoundError = new error.InvalidArgumentError('The argument is invalid', 'key', 'value');
      const updateStub = sandbox.stub();
      updateStub.rejects(notFoundError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addErrorsById', updateStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);

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
        await ProcessTrackingService.addProcessError(processId.toString(), processError);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errored);

      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish and throw a DataServiceError when the model throws a DatabaseOperationError', async () => {
      const databaseError = new error.DatabaseOperationError('something bad happened', 'mongoDb', 'addErrorsById');
      const updateStub = sandbox.stub();
      updateStub.rejects(databaseError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addErrorsById', updateStub);

      const publishOverride = sandbox.stub();
      publishOverride.returns(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const processError = new error.GlyphxError('I am an error', 999);

      let errored = false;
      try {
        await ProcessTrackingService.addProcessError(processId.toString(), processError);
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
      _id:
        // @ts-ignore
        new mongooseTypes.ObjectId(),
      processId: new mongooseTypes.ObjectId().toString(),
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', updateStub);

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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', updateStub);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const message = 'I am a message';

      await ProcessTrackingService.addProcessMessage(processId.toString(), message);

      assert.isTrue(updateStub.calledOnce);

      const updateArgs = updateStub.getCall(0).args;
      assert.isOk(updateArgs);
      assert.strictEqual(updateArgs[0].toString(), processId.toString());
      assert.strictEqual(updateArgs[1][0], message);
    });

    it('should publish and throw a DataNotFoundError when the processId does not exist', async () => {
      const notFoundError = new error.DataNotFoundError('the data is not found', 'key', 'value');
      const updateStub = sandbox.stub();
      updateStub.rejects(notFoundError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', updateStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);

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
        await ProcessTrackingService.addProcessMessage(processId.toString(), message);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errored);

      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish and throw an InvalidArgumentError when one is thrown by the model', async () => {
      const notFoundError = new error.InvalidArgumentError('the argument is invalid', 'key', 'value');
      const updateStub = sandbox.stub();
      updateStub.rejects(notFoundError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', updateStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);

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
        await ProcessTrackingService.addProcessMessage(processId.toString(), message);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errored);

      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish and throw a DataServiceError when the model throws a DatabaseOperationError', async () => {
      const databaseError = new error.DatabaseOperationError('something bad happened', 'mongoDb', 'addErrorsById');
      const updateStub = sandbox.stub();
      updateStub.rejects(databaseError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'addMessagesById', updateStub);

      const publishOverride = sandbox.stub();
      publishOverride.returns(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const message = 'I am a message';

      let errored = false;
      try {
        await ProcessTrackingService.addProcessMessage(processId.toString(), message);
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
      _id:
        // @ts-ignore
        new mongooseTypes.ObjectId(),
      processId: new mongooseTypes.ObjectId().toString(),
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const reconcileStatusStub = sandbox.stub();
      reconcileStatusStub.resolves(mockProcessTracking);
      sandbox.replace(ProcessTrackingService as any, 'reconcileStatus', reconcileStatusStub);
      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessTracking(processId.toString());
      assert.isOk(result);
      assert.strictEqual(result?.processStatus, mockProcessTracking.processStatus);
      assert.strictEqual(result?.processError.length, mockProcessTracking.processError.length);
      assert.strictEqual(result?.processError[0].message, mockProcessTracking.processError[0].message);
      assert.strictEqual(result?.processMessages.length, mockProcessTracking.processMessages.length);
      assert.strictEqual(result?.processMessages[0], mockProcessTracking.processMessages[0]);
      assert.strictEqual(result?.processResult?.result, mockProcessTracking.processResult?.result);

      assert.strictEqual(result?.processStartTime.getTime(), mockProcessTracking.processStartTime.getTime());

      assert.strictEqual(result?.processId, mockProcessTracking.processId);
      assert.strictEqual(result?.processName, mockProcessTracking.processName);
      assert.strictEqual(result?._id, mockProcessTracking._id);

      assert.isTrue(reconcileStatusStub.calledOnce);
    });

    it('should return the processTracking document when processId is an ObjectId', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const reconcileStatusStub = sandbox.stub();
      reconcileStatusStub.resolves(mockProcessTracking);
      sandbox.replace(ProcessTrackingService as any, 'reconcileStatus', reconcileStatusStub);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessTracking(processId.toString());
      assert.isOk(result);
      assert.strictEqual(result?.processStatus, mockProcessTracking.processStatus);
      assert.strictEqual(result?.processError.length, mockProcessTracking.processError.length);
      assert.strictEqual(result?.processError[0].message, mockProcessTracking.processError[0].message);
      assert.strictEqual(result?.processMessages.length, mockProcessTracking.processMessages.length);
      assert.strictEqual(result?.processMessages[0], mockProcessTracking.processMessages[0]);
      assert.strictEqual(result?.processResult?.result, mockProcessTracking.processResult?.result);

      assert.strictEqual(result?.processStartTime.getTime(), mockProcessTracking.processStartTime.getTime());

      assert.strictEqual(result?.processId, mockProcessTracking.processId);
      assert.strictEqual(result?.processName, mockProcessTracking.processName);
      assert.strictEqual(result?._id, mockProcessTracking._id);
      assert.isTrue(reconcileStatusStub.calledOnce);
    });

    it('will return null when the processId does not exist', async () => {
      const notFoundError = new error.DataNotFoundError('the data is not found', 'key', 'value');
      const getStub = sandbox.stub();
      getStub.rejects(notFoundError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const reconcileStatusStub = sandbox.stub();
      reconcileStatusStub.resolves(mockProcessTracking);
      sandbox.replace(ProcessTrackingService as any, 'reconcileStatus', reconcileStatusStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);

        //@ts-ignore
        assert.strictEqual(this.message, notFoundError.message);
      }

      const boundPublish = fakePublish.bind(notFoundError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessTracking(processId.toString());
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const reconcileStatusStub = sandbox.stub();
      reconcileStatusStub.resolves(mockProcessTracking);
      sandbox.replace(ProcessTrackingService as any, 'reconcileStatus', reconcileStatusStub);

      const publishOverride = sandbox.stub();
      //it doesn't really return this. In real life it should return a service error, but we do not have a good way to trap this.
      publishOverride.resolves(databaseError);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      let errored = false;
      try {
        await ProcessTrackingService.getProcessTracking(processId.toString());
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
      _id:
        // @ts-ignore
        new mongooseTypes.ObjectId(),
      processId: new mongooseTypes.ObjectId().toString(),
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessError(processId.toString());
      assert.isOk(result);
      assert.strictEqual(result?.processError.length, mockProcessTracking.processError.length);
      assert.strictEqual(result?.processError[0].message, mockProcessTracking.processError[0].message);
    });

    it('should return the processTracking processError array when processId is an ObjectId', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessError(processId.toString());
      assert.isOk(result);
      assert.strictEqual(result?.processError.length, mockProcessTracking.processError.length);
      assert.strictEqual(result?.processError[0].message, mockProcessTracking.processError[0].message);
    });

    it('should return null when processId is not found', async () => {
      const getStub = sandbox.stub();
      getStub.rejects(new error.DataNotFoundError('not found', 'key', 'value'));
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessError(processId.toString());
      assert.isNotOk(result);
    });
  });

  context('getProcessMessages', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id:
        // @ts-ignore
        new mongooseTypes.ObjectId(),
      processId: new mongooseTypes.ObjectId().toString(),
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessMessages(processId.toString());
      assert.isOk(result);
      assert.strictEqual(result?.processMessages.length, mockProcessTracking.processMessages.length);
      assert.strictEqual(result?.processMessages[0], mockProcessTracking.processMessages[0]);
    });

    it('should return the processTracking processMessages array when processId is an ObjectId', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessMessages(processId.toString());
      assert.isOk(result);
      assert.strictEqual(result?.processMessages.length, mockProcessTracking.processMessages.length);
      assert.strictEqual(result?.processMessages[0], mockProcessTracking.processMessages[0]);
    });
    it('should return null when processId is not found', async () => {
      const getStub = sandbox.stub();
      getStub.rejects(new error.DataNotFoundError('not found', 'key', 'value'));
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessMessages(processId.toString());
      assert.isNotOk(result);
    });
  });

  context('getProcessResult', () => {
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      _id:
        // @ts-ignore
        new mongooseTypes.ObjectId(),
      processId: new mongooseTypes.ObjectId().toString(),
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
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessResult(processId.toString());
      assert.isOk(result);
      assert.strictEqual(result?.processResult?.result, mockProcessTracking.processResult?.result);
    });

    it('should return the processTracking processResult object when processId is an ObjectId', async () => {
      const getStub = sandbox.stub();
      getStub.resolves(mockProcessTracking);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const processId = mockProcessTracking._id as mongooseTypes.ObjectId;
      const result = await ProcessTrackingService.getProcessResult(processId.toString());
      assert.isOk(result);
      assert.strictEqual(result?.processResult?.result, mockProcessTracking.processResult?.result);
    });
    it('should return null when processId is not found', async () => {
      const getStub = sandbox.stub();
      getStub.rejects(new error.DataNotFoundError('not found', 'key', 'value'));
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'getProcessTrackingDocumentById', getStub);

      const processId = mockProcessTracking.processId;
      const result = await ProcessTrackingService.getProcessResult(processId.toString());
      assert.isNotOk(result);
    });
  });

  context('removeProcessTrackingDocument', () => {
    const dbConnection = new MongoDbConnection();
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('should remove the process tracking document by processId as string', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves();
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'deleteProcessTrackingDocumentById', deleteStub);

      const processId = new mongooseTypes.ObjectId().toString();
      await ProcessTrackingService.removeProcessTrackingDocument(processId);
      assert.isTrue(deleteStub.calledOnce);
    });

    it('should remove the process tracking document by processId as ObjectId', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves();
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'deleteProcessTrackingDocumentById', deleteStub);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      await ProcessTrackingService.removeProcessTrackingDocument(processId.toString());
      assert.isTrue(deleteStub.calledOnce);
    });

    it('should publish and rethrow an InvalidArgumentError thrown by the model', async () => {
      const invalidError = new error.InvalidArgumentError('invalid', 'key', 'value');
      const deleteStub = sandbox.stub();
      deleteStub.rejects(invalidError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'deleteProcessTrackingDocumentById', deleteStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);

        //@ts-ignore
        assert.strictEqual(this.message, invalidError.message);
      }

      const boundPublish = fakePublish.bind(invalidError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);
      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      let errored = false;
      try {
        await ProcessTrackingService.removeProcessTrackingDocument(processId.toString());
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(deleteStub.calledOnce);
      assert.isTrue(errored);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish and throw a DataServiceError when the model throws an error', async () => {
      const invalidError = new error.DatabaseOperationError(
        'databaseError',
        'mongoDb',
        'deleteProcessTrackingDocumentById'
      );
      const deleteStub = sandbox.stub();
      deleteStub.rejects(invalidError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'deleteProcessTrackingDocumentById', deleteStub);

      const publishOverride = sandbox.stub();
      publishOverride.resolves();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);
      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      let errored = false;
      try {
        await ProcessTrackingService.removeProcessTrackingDocument(processId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(deleteStub.calledOnce);
      assert.isTrue(errored);
      assert.isTrue(publishOverride.calledOnce);
    });
  });

  context('setHeartbeat', () => {
    const sandbox = createSandbox();
    const dbConnection = new MongoDbConnection();
    afterEach(() => {
      sandbox.restore();
    });

    it('should set the heartbeat with processId as string', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const processId = new mongooseTypes.ObjectId().toString();
      await ProcessTrackingService.setHeartbeat(processId);
      assert.isTrue(updateStub.calledOnce);
    });

    it('should set the heartbeat with processId as ObjectId', async () => {
      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      await ProcessTrackingService.setHeartbeat(processId.toString());
      assert.isTrue(updateStub.calledOnce);
    });

    it('should publish and rethrow an InvalidArgument error when it is thrown by the model.', async () => {
      const invalidError = new error.InvalidArgumentError('invalid', 'key', 'value');
      const updateStub = sandbox.stub();
      updateStub.rejects(invalidError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);

        //@ts-ignore
        assert.strictEqual(this.message, invalidError.message);
      }

      const boundPublish = fakePublish.bind(invalidError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);
      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      let errored = false;
      try {
        await ProcessTrackingService.setHeartbeat(processId.toString());
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish and rethrow an InvalidOperationError when it is thrown by the model.', async () => {
      const invalidError = new error.InvalidOperationError('invalid operation', {});
      const updateStub = sandbox.stub();
      updateStub.rejects(invalidError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);

        //@ts-ignore
        assert.strictEqual(this.message, invalidError.message);
      }

      const boundPublish = fakePublish.bind(invalidError);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);
      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      let errored = false;
      try {
        await ProcessTrackingService.setHeartbeat(processId.toString());
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('should publish and throw an DataServiceError when any other error is thrown by the model', async () => {
      const invalidError = new error.DatabaseOperationError(
        'invalid operation',
        'mongoDb',
        'updateProcessTrackingDocumentByFilter'
      );
      const updateStub = sandbox.stub();
      updateStub.rejects(invalidError);
      sandbox.replace(dbConnection.models.ProcessTrackingModel, 'updateProcessTrackingDocumentById', updateStub);

      const publishOverride = sandbox.stub();
      publishOverride.resolves();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);
      const processId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      let errored = false;
      try {
        await ProcessTrackingService.setHeartbeat(processId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });

  context('reconcileStatus', () => {
    const sandbox = createSandbox();
    const dbConnection = new MongoDbConnection();
    const mockProcessTracking: databaseTypes.IProcessTracking = {
      processId: new mongooseTypes.ObjectId().toString(),
      processName: 'testProcessName',
      processStatus: databaseTypes.constants.PROCESS_STATUS.PENDING,
      processStartTime: new Date(),
      processMessages: [],
      processError: [],
    };

    afterEach(() => {
      sandbox.restore();
    });

    it('will pass through a processTracking document whoes status === "COMPLETED"', async () => {
      const mockDocument = JSON.parse(JSON.stringify(mockProcessTracking)) as databaseTypes.IProcessTracking;
      mockDocument.processStatus = databaseTypes.constants.PROCESS_STATUS.COMPLETED;

      const completeProcessStub = sandbox.stub();
      completeProcessStub.resolves();
      sandbox.replace(ProcessTrackingService, 'completeProcess', completeProcessStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves();
      sandbox.replace(ProcessTrackingService, 'addProcessMessage', addMessageStub);

      const getProcessStub = sandbox.stub();
      getProcessStub.resolves();
      sandbox.replace(ProcessTrackingService, 'getProcessTracking', getProcessStub);

      const result = await (ProcessTrackingService as any).reconcileStatus(mockDocument);

      assert.strictEqual(result.processStatus, mockDocument.processStatus);
      assert.isUndefined(result.processEndTime);

      assert.isFalse(completeProcessStub.called);
      assert.isFalse(addMessageStub.called);
      assert.isFalse(getProcessStub.called);
    });

    it('will pass through a processTracking document whoes status === "In Progress" and it has a recent heartbeat', async () => {
      const mockDocument = JSON.parse(JSON.stringify(mockProcessTracking)) as databaseTypes.IProcessTracking;
      mockDocument.processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      mockDocument.processHeartbeat = new Date();

      const completeProcessStub = sandbox.stub();
      completeProcessStub.resolves();
      sandbox.replace(ProcessTrackingService, 'completeProcess', completeProcessStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves();
      sandbox.replace(ProcessTrackingService, 'addProcessMessage', addMessageStub);

      const getProcessStub = sandbox.stub();
      getProcessStub.resolves();
      sandbox.replace(ProcessTrackingService, 'getProcessTracking', getProcessStub);

      const result = await (ProcessTrackingService as any).reconcileStatus(mockDocument);

      assert.strictEqual(result.processStatus, mockDocument.processStatus);
      assert.isUndefined(result.processEndTime);

      assert.isFalse(completeProcessStub.called);
      assert.isFalse(addMessageStub.called);
      assert.isFalse(getProcessStub.called);
    });
    it('will pass through a processTracking document whoes status === "Pendig" and it has a recent start date', async () => {
      const mockDocument = JSON.parse(JSON.stringify(mockProcessTracking)) as databaseTypes.IProcessTracking;
      mockDocument.processStatus = databaseTypes.constants.PROCESS_STATUS.PENDING;
      mockDocument.processStartTime = new Date(mockDocument.processStartTime);

      const completeProcessStub = sandbox.stub();
      completeProcessStub.resolves();
      sandbox.replace(ProcessTrackingService, 'completeProcess', completeProcessStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves();
      sandbox.replace(ProcessTrackingService, 'addProcessMessage', addMessageStub);

      const getProcessStub = sandbox.stub();
      getProcessStub.resolves();
      sandbox.replace(ProcessTrackingService, 'getProcessTracking', getProcessStub);

      const result = await (ProcessTrackingService as any).reconcileStatus(mockDocument);

      assert.strictEqual(result.processStatus, mockDocument.processStatus);
      assert.isUndefined(result.processEndTime);

      assert.isFalse(completeProcessStub.called);
      assert.isFalse(addMessageStub.called);
      assert.isFalse(getProcessStub.called);
    });

    it('will set a processTracking document to hung if the heartbeat is > 15 minutes old', async () => {
      const mockDocument = JSON.parse(JSON.stringify(mockProcessTracking)) as databaseTypes.IProcessTracking;
      mockDocument.processStatus = databaseTypes.constants.PROCESS_STATUS.PENDING;
      mockDocument.processStartTime = new Date(mockDocument.processStartTime);

      mockDocument.processHeartbeat = new Date(new Date().getTime() - 900001);
      const completeProcessStub = sandbox.stub();
      const completeRetval = JSON.parse(JSON.stringify(mockDocument));
      completeRetval.processStatus = databaseTypes.constants.PROCESS_STATUS.HUNG;
      completeProcessStub.resolves(completeRetval);
      sandbox.replace(ProcessTrackingService, 'completeProcess', completeProcessStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves();
      sandbox.replace(ProcessTrackingService, 'addProcessMessage', addMessageStub);

      const getProcessStub = sandbox.stub();
      getProcessStub.resolves(completeRetval);
      sandbox.replace(ProcessTrackingService, 'getProcessTracking', getProcessStub);

      const result = await (ProcessTrackingService as any).reconcileStatus(mockDocument);

      assert.strictEqual(result.processStatus, completeRetval.processStatus);

      assert.isTrue(completeProcessStub.called);
      assert.isTrue(addMessageStub.called);
      assert.isTrue(getProcessStub.called);

      const completedArgs = completeProcessStub.getCall(0).args;
      assert.strictEqual(completedArgs[2], databaseTypes.constants.PROCESS_STATUS.HUNG);
    });

    it('will set a processTracking document to hung if the heartbeat is not set and start date is > 15 min', async () => {
      const mockDocument = JSON.parse(JSON.stringify(mockProcessTracking)) as databaseTypes.IProcessTracking;
      mockDocument.processStatus = databaseTypes.constants.PROCESS_STATUS.PENDING;

      mockDocument.processStartTime = new Date(new Date().getTime() - 900001);
      const completeProcessStub = sandbox.stub();
      const completeRetval = JSON.parse(JSON.stringify(mockDocument));
      completeRetval.processStatus = databaseTypes.constants.PROCESS_STATUS.HUNG;
      completeProcessStub.resolves(completeRetval);
      sandbox.replace(ProcessTrackingService, 'completeProcess', completeProcessStub);

      const addMessageStub = sandbox.stub();
      addMessageStub.resolves();
      sandbox.replace(ProcessTrackingService, 'addProcessMessage', addMessageStub);

      const getProcessStub = sandbox.stub();
      getProcessStub.resolves(completeRetval);
      sandbox.replace(ProcessTrackingService, 'getProcessTracking', getProcessStub);

      const result = await (ProcessTrackingService as any).reconcileStatus(mockDocument);

      assert.strictEqual(result.processStatus, completeRetval.processStatus);

      assert.isTrue(completeProcessStub.called);
      assert.isTrue(addMessageStub.called);
      assert.isTrue(getProcessStub.called);

      const completedArgs = completeProcessStub.getCall(0).args;
      assert.strictEqual(completedArgs[2], databaseTypes.constants.PROCESS_STATUS.HUNG);
    });
  });
});
