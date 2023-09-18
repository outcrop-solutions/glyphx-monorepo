import 'mocha';
import {assert} from 'chai';
import {FileIngestor} from '../fileIngestor';
import {createSandbox} from 'sinon';
import mockPayload from './fileIngestionMocks.json';
import {error, aws, generalPurposeFunctions} from 'core';
import {BasicAthenaProcessor, BasicJoinProcessor as JoinProcessor} from '../fileProcessing';
import {fileIngestionTypes, databaseTypes} from 'types';
import {FileUploadManager} from '../fileProcessing/fileUploadManager';
import {
  IFileInformation,
  IFileProcessingError,
  IJoinTableDefinition,
  IJoinTableColumnDefinition,
} from '../interfaces/fileProcessing';
import {FileReconciliator} from '../fileProcessing/fileReconciliator';
import {FILE_PROCESSING_STATUS, FILE_PROCESSING_ERROR_TYPES} from '../util/constants';
import * as businessLogic from 'business';
import {config} from '../config';
const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
describe('fileIngestor', () => {
  beforeEach(() => {
    (config as any).inited = false;
  });
  context('constructor', () => {
    it('Should build a FileIngestor object', () => {
      const payload = JSON.parse(JSON.stringify(mockPayload)).payload;
      const databaseName = 'testDatabaseName';
      const s3Manager = new aws.S3Manager(payload.bucketName);
      const athenaManager = new aws.AthenaManager(databaseName);
      const fileIngestor = new FileIngestor(payload, s3Manager, athenaManager, PROCESS_ID);

      assert.isOk(fileIngestor);

      assert.strictEqual(fileIngestor.clientId, payload.clientId);
      assert.strictEqual(fileIngestor.modelId, payload.modelId);
      assert.strictEqual(fileIngestor.bucketName, payload.bucketName);
      assert.strictEqual(fileIngestor.databaseName, databaseName);

      assert.isFalse(fileIngestor.inited);

      assert.strictEqual(fileIngestor.fileInfo.length, payload.fileInfo.length);
      assert.strictEqual(fileIngestor.fileStatistics.length, 0);

      assert.throws(() => {
        fileIngestor.isSafe;
      }, error.InvalidOperationError);
    });
  });

  context('init', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('should successfuly init our fileingestor', async () => {
      sandbox.replace(aws.S3Manager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(aws.AthenaManager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(BasicAthenaProcessor.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(businessLogic.Initializer, 'init', sandbox.stub().resolves(null as unknown as void));
      sandbox.replace(businessLogic.projectService, 'getProjectFileStats', sandbox.stub().resolves([]));
      const payload = JSON.parse(JSON.stringify(mockPayload)).payload;
      const databaseName = 'testDatabaseName';

      const s3Manager = new aws.S3Manager(payload.bucketName);
      const athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const fileIngestor = new FileIngestor(payload, s3Manager, athenaManager, PROCESS_ID);
      await fileIngestor.init();

      assert.isTrue(fileIngestor.inited);

      assert.isTrue(fileIngestor.isSafe);
    });

    it('should init our only the first time that init is called.', async () => {
      const s3InitFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(aws.S3Manager.prototype, 'init', s3InitFake);
      const athenaInitFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitFake);
      const athenaProcessorInitFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(BasicAthenaProcessor.prototype, 'init', athenaProcessorInitFake);
      sandbox.replace(businessLogic.Initializer, 'init', sandbox.stub().resolves(null as unknown as void));

      sandbox.replace(businessLogic.projectService, 'getProjectFileStats', sandbox.stub().resolves([]));

      const payload = JSON.parse(JSON.stringify(mockPayload)).payload;
      const databaseName = 'testDatabaseName';

      const s3Manager = new aws.S3Manager(payload.bucketName);
      const athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const fileIngestor = new FileIngestor(payload, s3Manager, athenaManager, PROCESS_ID);
      await fileIngestor.init();
      await fileIngestor.init();

      assert.strictEqual(s3InitFake.callCount, 1);
      assert.strictEqual(athenaInitFake.callCount, 1);
      assert.strictEqual(athenaProcessorInitFake.callCount, 1);
    });

    it('should throw an invalid argument error when underlying inits fail', async () => {
      sandbox.replace(aws.S3Manager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(aws.AthenaManager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(BasicAthenaProcessor.prototype, 'init', sandbox.fake.rejects('An error has occurred'));
      sandbox.replace(businessLogic.Initializer, 'init', sandbox.stub().resolves(null as unknown as void));
      sandbox.replace(businessLogic.projectService, 'getProjectFileStats', sandbox.stub().resolves([]));

      const payload = JSON.parse(JSON.stringify(mockPayload)).payload;
      const databaseName = 'testDatabaseName';

      const s3Manager = new aws.S3Manager(payload.bucketName);
      const athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const fileIngestor = new FileIngestor(payload, s3Manager, athenaManager, PROCESS_ID);

      let hasError = false;
      try {
        await fileIngestor.init();
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        hasError = true;
      }
      assert.isTrue(hasError);
      assert.isFalse(fileIngestor.inited);

      assert.throws(() => {
        fileIngestor.isSafe;
      }, error.InvalidOperationError);
    });
  });

  context('add tables', () => {
    const databaseName = 'testDatabaseName';
    const sandbox = createSandbox();
    let payload: fileIngestionTypes.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(aws.S3Manager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(aws.AthenaManager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(BasicAthenaProcessor.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(businessLogic.Initializer, 'init', sandbox.stub().resolves(null as unknown as void));
      sandbox.replace(
        businessLogic.projectService,
        'updateProject',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );
      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );
      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      const s3Manager = new aws.S3Manager(payload.bucketName);
      const athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      fileIngestor = new FileIngestor(payload, s3Manager, athenaManager, PROCESS_ID);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should add a table and create a new view', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);
      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );
      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);

      const results = await fileIngestor.process();

      assert.isTrue(dropViewFake.calledOnce);
      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 0);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 1);
      assert.strictEqual(results.joinInformation[0].tableName, 'fooTable');
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.OK);
      assert.strictEqual(
        results.viewName,
        generalPurposeFunctions.fileIngestion.getViewName(payload.clientId, payload.modelId)
      );
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.notCalled);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.COMPLETED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should fail because the table already exists', async () => {
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(true));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );
      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);
      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.strictEqual(results.fileInformation.length, 2);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 2);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      for (let i = 0; i < payload.fileInfo.length; i++) {
        const fileInfo = payload.fileInfo[i];
        const fileError = results.fileProcessingErrors[i];
        assert.strictEqual(fileInfo.tableName, fileError.tableName);
        assert.strictEqual(fileError.errorType, FILE_PROCESSING_ERROR_TYPES.TABLE_ALREADY_EXISTS);
      }
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.calledOnce);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.FAILED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should fail because we are adding the same table twice', async () => {
      payload.fileInfo[1].tableName = 'Table1';
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );
      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);

      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.strictEqual(results.fileInformation.length, 2);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      const fileInfo = payload.fileInfo[0];
      const fileError = results.fileProcessingErrors[0];
      assert.strictEqual(fileInfo.tableName, fileError.tableName);
      assert.strictEqual(fileError.errorType, FILE_PROCESSING_ERROR_TYPES.INVALID_TABLE_SET);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.calledOnce);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.FAILED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should fail because an underlying function throws an exception', async () => {
      const errorString = 'Something bad happened';
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', sandbox.fake.rejects(errorString));
      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );
      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);
      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.isTrue(results.fileProcessingErrors[0].message.indexOf(errorString) >= 0);
      assert.strictEqual(results.fileProcessingErrors[0].errorType, FILE_PROCESSING_ERROR_TYPES.UNEXPECTED_ERROR);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.calledOnce);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.FAILED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should fail because an underlying function throws an GlyphxError', async () => {
      const glyphxError = new error.GlyphxError('something bad has happend', 999);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', sandbox.fake.rejects(glyphxError));
      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );

      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);
      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(results.fileProcessingErrors[0].errorType, FILE_PROCESSING_ERROR_TYPES.UNEXPECTED_ERROR);

      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.calledOnce);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.FAILED);
      assert.isTrue(setHeartBeatStub.called);
    });
  });

  context('Append a File to a table', () => {
    const databaseName = 'testDatabaseName';
    const sandbox = createSandbox();
    let payload: fileIngestionTypes.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(aws.S3Manager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(aws.AthenaManager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(BasicAthenaProcessor.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(businessLogic.Initializer, 'init', sandbox.stub().resolves(null as unknown as void));
      sandbox.replace(
        businessLogic.projectService,
        'updateProject',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );

      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );
      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      payload.fileInfo.splice(1);
      payload.fileInfo[0].operation = fileIngestionTypes.constants.FILE_OPERATION.APPEND;
      const s3Manager = new aws.S3Manager(payload.bucketName);
      const athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      fileIngestor = new FileIngestor(payload, s3Manager, athenaManager, PROCESS_ID);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should append a file to an existing table', async () => {
      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(true));
      sandbox.replace(fileIngestor['s3Manager'], 'fileExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );
      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);
      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 0);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.OK);
      assert.strictEqual(
        results.viewName,
        generalPurposeFunctions.fileIngestion.getViewName(payload.clientId, payload.modelId)
      );
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.notCalled);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.COMPLETED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should not fail when the table is added and appended in the same fileInfo set', async () => {
      const newFileInfo = JSON.parse(JSON.stringify(payload.fileInfo[0]));
      newFileInfo.fileName = 'APPEND' + newFileInfo.fileName;
      payload.fileInfo.push(newFileInfo);
      payload.fileInfo[0].operation = fileIngestionTypes.constants.FILE_OPERATION.ADD;

      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(fileIngestor['athenaManager'], 'dropView', sandbox.fake.resolves(true as unknown as void));

      sandbox.replace(fileIngestor['s3Manager'], 'fileExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );
      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);
      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 0);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 1);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.OK);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.notCalled);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.COMPLETED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should fail when the table does not exist', async () => {
      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));
      sandbox.replace(fileIngestor['s3Manager'], 'fileExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );

      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);

      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(results.fileProcessingErrors[0].errorType, FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.calledOnce);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.FAILED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should fail when the file already exists', async () => {
      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(true));
      sandbox.replace(fileIngestor['s3Manager'], 'fileExists', sandbox.fake.resolves(true));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );

      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(results.fileProcessingErrors[0].errorType, FILE_PROCESSING_ERROR_TYPES.FILE_ALREADY_EXISTS);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.calledOnce);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.FAILED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should fail when we have the same file/table combination more than once', async () => {
      const newFileInfo = JSON.parse(JSON.stringify(payload.fileInfo[0]));
      newFileInfo.fileName = 'APPEND' + newFileInfo.fileName;
      payload.fileInfo.push(newFileInfo);
      payload.fileInfo.push(newFileInfo);
      payload.fileInfo[0].operation = fileIngestionTypes.constants.FILE_OPERATION.ADD;

      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(fileIngestor['athenaManager'], 'dropView', sandbox.fake.resolves(true as unknown as void));

      sandbox.replace(fileIngestor['s3Manager'], 'fileExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );

      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(results.fileProcessingErrors[0].errorType, FILE_PROCESSING_ERROR_TYPES.INVALID_TABLE_SET);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.calledOnce);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.FAILED);
      assert.isTrue(setHeartBeatStub.called);
    });
  });

  context('Replace A Table', () => {
    const databaseName = 'testDatabaseName';
    const sandbox = createSandbox();
    let payload: fileIngestionTypes.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(aws.S3Manager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(aws.AthenaManager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(BasicAthenaProcessor.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(businessLogic.Initializer, 'init', sandbox.stub().resolves(null as unknown as void));
      sandbox.replace(
        businessLogic.projectService,
        'updateProject',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );

      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );

      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      payload.fileInfo.splice(1);
      payload.fileInfo[0].operation = fileIngestionTypes.constants.FILE_OPERATION.REPLACE;
      const s3Manager = new aws.S3Manager(payload.bucketName);
      const athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      fileIngestor = new FileIngestor(payload, s3Manager, athenaManager, PROCESS_ID);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Should replace an existing table', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropTable', dropTableFake);

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(fileIngestor['tableArchver'], 'archiveTable', archiveTableFake);

      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(true));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );

      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();
      assert.isTrue(dropTableFake.calledOnce);
      assert.isTrue(dropViewFake.calledOnce);
      assert.isTrue(archiveTableFake.calledOnce);
      assert.isArray(results.fileInformation);
      assert.strictEqual(results.fileInformation.length, 1);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 0);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 1);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.OK);
      assert.strictEqual(
        results.viewName,
        generalPurposeFunctions.fileIngestion.getViewName(payload.clientId, payload.modelId)
      );
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.notCalled);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.COMPLETED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should fail if the table does not exist', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropTable', dropTableFake);

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(fileIngestor['tableArchver'], 'archiveTable', archiveTableFake);

      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );

      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();
      assert.isFalse(dropTableFake.calledOnce);
      assert.isFalse(dropViewFake.calledOnce);
      assert.isFalse(archiveTableFake.calledOnce);
      assert.isArray(results.fileInformation);
      assert.strictEqual(results.fileInformation.length, 2);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(results.fileProcessingErrors[0].errorType, FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.calledOnce);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.FAILED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should fail if we try to replace a table being added in this set', async () => {
      const addTableInfo = JSON.parse(JSON.stringify(payload.fileInfo[0]));
      addTableInfo.operation = fileIngestionTypes.constants.FILE_OPERATION.ADD;
      addTableInfo.fileName = 'ADD' + addTableInfo.fileName;
      payload.fileInfo.unshift(addTableInfo);
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropTable', dropTableFake);

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(fileIngestor['tableArchver'], 'archiveTable', archiveTableFake);

      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );

      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();
      assert.isFalse(dropTableFake.calledOnce);
      assert.isFalse(dropViewFake.calledOnce);
      assert.isFalse(archiveTableFake.calledOnce);
      assert.isArray(results.fileInformation);
      assert.strictEqual(results.fileInformation.length, 2);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(results.fileProcessingErrors[0].errorType, FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.calledOnce);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.FAILED);
      assert.isTrue(setHeartBeatStub.called);
    });
  });

  context('Delete a Table', () => {
    const databaseName = 'testDatabaseName';
    const sandbox = createSandbox();
    let payload: fileIngestionTypes.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(aws.S3Manager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(aws.AthenaManager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(BasicAthenaProcessor.prototype, 'init', sandbox.fake.resolves(true as unknown as void));

      sandbox.replace(businessLogic.Initializer, 'init', sandbox.stub().resolves(null as unknown as void));
      sandbox.replace(
        businessLogic.projectService,
        'updateProject',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );
      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );
      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      payload.fileInfo.splice(1);
      payload.fileInfo[0].operation = fileIngestionTypes.constants.FILE_OPERATION.DELETE;
      const s3Manager = new aws.S3Manager(payload.bucketName);
      const athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      fileIngestor = new FileIngestor(payload, s3Manager, athenaManager, PROCESS_ID);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should delete a table that exists', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropTable', dropTableFake);

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(fileIngestor['tableArchver'], 'archiveTable', archiveTableFake);

      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(true));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [],
          accumFiles: [],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );

      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();
      assert.isTrue(dropTableFake.calledOnce);
      assert.isTrue(dropViewFake.calledOnce);
      assert.isTrue(archiveTableFake.calledOnce);
      assert.isArray(results.fileInformation);
      assert.strictEqual(results.fileInformation.length, 0);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 0);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.OK);
      assert.strictEqual(
        results.viewName,
        generalPurposeFunctions.fileIngestion.getViewName(payload.clientId, payload.modelId)
      );
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.notCalled);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.COMPLETED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should fail if the table does not exist', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropTable', dropTableFake);

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(fileIngestor['tableArchver'], 'archiveTable', archiveTableFake);

      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );

      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();
      assert.isFalse(dropTableFake.calledOnce);
      assert.isFalse(dropViewFake.calledOnce);
      assert.isFalse(archiveTableFake.calledOnce);
      assert.isArray(results.fileInformation);
      assert.strictEqual(results.fileInformation.length, 2);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(results.fileProcessingErrors[0].errorType, FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.calledOnce);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.FAILED);
      assert.isTrue(setHeartBeatStub.called);
    });

    it('should fail if the table is added and deleted in the same set', async () => {
      const addTableInfo = JSON.parse(JSON.stringify(payload.fileInfo[0]));
      addTableInfo.operation = fileIngestionTypes.constants.FILE_OPERATION.ADD;
      addTableInfo.fileName = 'ADD' + addTableInfo.fileName;
      payload.fileInfo.unshift(addTableInfo);
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropTable', dropTableFake);

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(fileIngestor['tableArchver'], 'archiveTable', archiveTableFake);

      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );

      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();
      assert.isFalse(dropTableFake.calledOnce);
      assert.isFalse(dropViewFake.calledOnce);
      assert.isFalse(archiveTableFake.calledOnce);
      assert.isArray(results.fileInformation);
      assert.strictEqual(results.fileInformation.length, 2);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(results.fileProcessingErrors[0].errorType, FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.calledOnce);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.FAILED);
      assert.isTrue(setHeartBeatStub.called);
    });
  });

  context('view affecting operation', () => {
    const databaseName = 'testDatabaseName';
    const sandbox = createSandbox();
    let payload: fileIngestionTypes.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(aws.S3Manager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(aws.AthenaManager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(BasicAthenaProcessor.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(businessLogic.Initializer, 'init', sandbox.stub().resolves(null as unknown as void));
      sandbox.replace(
        businessLogic.projectService,
        'updateProject',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );

      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );
      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      const s3Manager = new aws.S3Manager(payload.bucketName);
      const athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      fileIngestor = new FileIngestor(payload, s3Manager, athenaManager, PROCESS_ID);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Should only try to drop the view once even if multiple view affecting operations are present', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);
      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );
      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);
      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();

      assert.isTrue(dropViewFake.calledOnce);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.OK);
      assert.isTrue(setHeartBeatStub.called);
    });
  });

  context('file upload has errors', () => {
    const databaseName = 'testDatabaseName';
    const sandbox = createSandbox();
    let payload: fileIngestionTypes.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(aws.S3Manager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(aws.AthenaManager.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(BasicAthenaProcessor.prototype, 'init', sandbox.fake.resolves(true as unknown as void));
      sandbox.replace(businessLogic.Initializer, 'init', sandbox.stub().resolves(null as unknown as void));
      sandbox.replace(
        businessLogic.projectService,
        'updateProject',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );

      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );
      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      const s3Manager = new aws.S3Manager(payload.bucketName);
      const athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      fileIngestor = new FileIngestor(payload, s3Manager, athenaManager, PROCESS_ID);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should report errors if sent by file upload', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);
      sandbox.replace(fileIngestor['athenaManager'], 'tableExists', sandbox.fake.resolves(false));

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [{error: 'oops'} as unknown as IFileProcessingError] as IFileProcessingError[],
        })
      );

      sandbox.replace(
        FileReconciliator,
        'reconcileFileInformation',
        sandbox.fake.returns({
          allFiles: [{tableName: 'fooTable'}] as IFileInformation[],
          accumFiles: [{tableName: 'fooTable'}] as IFileInformation[],
        })
      );

      sandbox.replace(
        fileIngestor['basicAthenaProcessor'],
        'processTables',
        sandbox.fake.resolves([{tableName: 'fooTable'} as IJoinTableDefinition])
      );

      const updateStub = sandbox.stub();
      updateStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'updateProcessStatus', updateStub);
      const errorStub = sandbox.stub();
      errorStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'addProcessError', errorStub);
      const completeStub = sandbox.stub();
      completeStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'completeProcess', completeStub);

      const setHeartBeatStub = sandbox.stub();
      setHeartBeatStub.resolves();
      sandbox.replace(businessLogic.processTrackingService, 'setHeartbeat', setHeartBeatStub);
      const results = await fileIngestor.process();

      assert.strictEqual(results.fileProcessingErrors.length, 2);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 1);
      assert.strictEqual(results.joinInformation[0].tableName, 'fooTable');
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.WARNING);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorStub.notCalled);
      assert.isTrue(completeStub.calledOnce);
      const completedArgs = completeStub.getCall(0).args;
      const completedStatus = completedArgs[2];
      assert.strictEqual(completedStatus, databaseTypes.constants.PROCESS_STATUS.COMPLETED);
      assert.isTrue(setHeartBeatStub.called);
    });
  });
  context('cleanJointInformation', () => {
    const table1 = {
      tableName: 'table1',
      backingFileName: 'table1.parquet',
      fields: [
        {
          name: 'GLYPHX_ID_COLUMN_NAME',
          origionalName: 'GLYPHX_ID_COLUMN_NAME',
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
        },
        {
          name: 'field1',
          origionalName: 'field1',
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
        },
        {
          name: 'field2',
          origionalName: 'field2',
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
        },
      ],
    };

    const table2 = {
      tableName: 'table2',
      backingFileName: 'table2.parquet',
      fields: [
        {
          name: 'GLYPHX_ID_COLUMN_NAME',
          origionalName: 'GLYPHX_ID_COLUMN_NAME',
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
        },
        {
          name: 'field1',
          origionalName: 'field1',
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
        },
        {
          name: 'field3',
          origionalName: 'field3',
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
        },
      ],
    };

    it('will remove the table definition from the joinTableInformation.columns', () => {
      const joinProcessor = new JoinProcessor();
      joinProcessor.processColumns(table1.tableName, table1.backingFileName, table1.fields);
      joinProcessor.processColumns(table2.tableName, table2.backingFileName, table2.fields);

      const joinInformation = joinProcessor.joinData;
      const payload = JSON.parse(JSON.stringify(mockPayload)).payload;
      const databaseName = 'testDatabaseName';

      const s3Manager = new aws.S3Manager(payload.bucketName);
      const athenaManager = new aws.AthenaManager(databaseName);
      const fileIngestor = new FileIngestor(payload, s3Manager, athenaManager, PROCESS_ID);

      const updatedJoinInformation = (fileIngestor as any).cleanJoinInformation(joinInformation);

      updatedJoinInformation.forEach((joinTable: IJoinTableDefinition) => {
        joinTable.columns.forEach((column: IJoinTableColumnDefinition) => {
          assert.isUndefined(column.tableDefinition);
        });
      });
    });
  });
});
