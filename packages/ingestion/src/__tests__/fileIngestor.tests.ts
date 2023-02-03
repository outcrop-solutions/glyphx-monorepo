import {assert} from 'chai';
import {FileIngestor} from '../fileIngestor';
import {createSandbox} from 'sinon';
import mockPayload from './fileIngestionMocks.json';
import {error, aws} from '@glyphx/core';
import {BasicAthenaProcessor} from '@fileProcessing';
import {fileIngestion, database as databaseTypes} from '@glyphx/types';
import {FileUploadManager} from '../fileProcessing/fileUploadManager';
import {
  IFileInformation,
  IFileProcessingError,
  IJoinTableDefinition,
} from '@interfaces/fileProcessing';
import {FileReconciliator} from '../fileProcessing/fileReconciliator';
import {
  FILE_PROCESSING_STATUS,
  FILE_PROCESSING_ERROR_TYPES,
} from '@util/constants';
import * as businessLogic from '@glyphx/business';

describe('fileIngestor', () => {
  context('constructor', () => {
    it('Should build a FileIngestor object', () => {
      const payload = JSON.parse(JSON.stringify(mockPayload)).payload;
      const databaseName = 'testDatabaseName';

      const fileIngestor = new FileIngestor(payload, databaseName);

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
      sandbox.replace(
        aws.S3Manager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        BasicAthenaProcessor.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        businessLogic.Initializer,
        'init',
        sandbox.stub().resolves(null as unknown as void)
      );
      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves([])
      );
      const payload = JSON.parse(JSON.stringify(mockPayload)).payload;
      const databaseName = 'testDatabaseName';

      const fileIngestor = new FileIngestor(payload, databaseName);
      await fileIngestor.init();

      assert.isTrue(fileIngestor.inited);

      assert.isTrue(fileIngestor.isSafe);
    });

    it('should init our only the first time that init is called.', async () => {
      const s3InitFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(aws.S3Manager.prototype, 'init', s3InitFake);
      const athenaInitFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitFake);
      const athenaProcessorInitFake = sandbox.fake.resolves(
        true as unknown as void
      );
      sandbox.replace(
        BasicAthenaProcessor.prototype,
        'init',
        athenaProcessorInitFake
      );
      sandbox.replace(
        businessLogic.Initializer,
        'init',
        sandbox.stub().resolves(null as unknown as void)
      );

      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves([])
      );

      const payload = JSON.parse(JSON.stringify(mockPayload)).payload;
      const databaseName = 'testDatabaseName';

      const fileIngestor = new FileIngestor(payload, databaseName);
      await fileIngestor.init();
      await fileIngestor.init();

      assert.strictEqual(s3InitFake.callCount, 1);
      assert.strictEqual(athenaInitFake.callCount, 1);
      assert.strictEqual(athenaProcessorInitFake.callCount, 1);
    });

    it('should throw an invalid argument error when underlying inits fail', async () => {
      sandbox.replace(
        aws.S3Manager.prototype,
        'init',
        sandbox.fake.rejects('An error has occurred')
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        BasicAthenaProcessor.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        businessLogic.Initializer,
        'init',
        sandbox.stub().resolves(null as unknown as void)
      );
      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves([])
      );

      const payload = JSON.parse(JSON.stringify(mockPayload)).payload;
      const databaseName = 'testDatabaseName';

      const fileIngestor = new FileIngestor(payload, databaseName);

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
    let payload: fileIngestion.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(
        aws.S3Manager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        BasicAthenaProcessor.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        businessLogic.Initializer,
        'init',
        sandbox.stub().resolves(null as unknown as void)
      );
      sandbox.replace(
        businessLogic.projectService,
        'updateProjectFileStats',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );
      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );
      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      fileIngestor = new FileIngestor(payload, databaseName);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should add a table and create a new view', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);
      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

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
      const results = await fileIngestor.process();

      assert.isTrue(dropViewFake.calledOnce);
      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 0);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 1);
      assert.strictEqual(results.joinInformation[0].tableName, 'fooTable');
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.OK);
    });

    it('should fail because the table already exists', async () => {
      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropView',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(true)
      );

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
        assert.strictEqual(
          fileError.errorType,
          FILE_PROCESSING_ERROR_TYPES.TABLE_ALREADY_EXISTS
        );
      }
    });

    it('should fail because we are adding the same table twice', async () => {
      payload.fileInfo[1].tableName = 'Table1';
      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropView',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

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
      assert.strictEqual(
        fileError.errorType,
        FILE_PROCESSING_ERROR_TYPES.INVALID_TABLE_SET
      );
    });

    it('should fail because an underlying function throws an exception', async () => {
      const errorString = 'Something bad happened';
      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropView',
        sandbox.fake.rejects(errorString)
      );
      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

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
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.isTrue(
        results.fileProcessingErrors[0].message.indexOf(errorString) >= 0
      );
      assert.strictEqual(
        results.fileProcessingErrors[0].errorType,
        FILE_PROCESSING_ERROR_TYPES.UNEXPECTED_ERROR
      );
    });
    it('should fail because an underlying function throws an GlyphxError', async () => {
      const glyphxError = new error.GlyphxError(
        'something bad has happend',
        999
      );
      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropView',
        sandbox.fake.rejects(glyphxError)
      );
      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

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
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(
        results.fileProcessingErrors[0].errorType,
        FILE_PROCESSING_ERROR_TYPES.UNEXPECTED_ERROR
      );
    });
  });
  context('Append a File to a table', () => {
    const databaseName = 'testDatabaseName';
    const sandbox = createSandbox();
    let payload: fileIngestion.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(
        aws.S3Manager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        BasicAthenaProcessor.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        businessLogic.Initializer,
        'init',
        sandbox.stub().resolves(null as unknown as void)
      );
      sandbox.replace(
        businessLogic.projectService,
        'updateProjectFileStats',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );

      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );
      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      payload.fileInfo.splice(1);
      payload.fileInfo[0].operation =
        fileIngestion.constants.FILE_OPERATION.APPEND;
      fileIngestor = new FileIngestor(payload, databaseName);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should append a file to an existing table', async () => {
      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(true)
      );
      sandbox.replace(
        fileIngestor['s3Manager'],
        'fileExists',
        sandbox.fake.resolves(false)
      );

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
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 0);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.OK);
    });

    it('should not fail when the table is added and appended in the same fileInfo set', async () => {
      const newFileInfo = JSON.parse(JSON.stringify(payload.fileInfo[0]));
      newFileInfo.fileName = 'APPEND' + newFileInfo.fileName;
      payload.fileInfo.push(newFileInfo);
      payload.fileInfo[0].operation =
        fileIngestion.constants.FILE_OPERATION.ADD;

      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropView',
        sandbox.fake.resolves(true as unknown as void)
      );

      sandbox.replace(
        fileIngestor['s3Manager'],
        'fileExists',
        sandbox.fake.resolves(false)
      );

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
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 0);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 1);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.OK);
    });

    it('should fail when the table does not exist', async () => {
      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );
      sandbox.replace(
        fileIngestor['s3Manager'],
        'fileExists',
        sandbox.fake.resolves(false)
      );

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
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(
        results.fileProcessingErrors[0].errorType,
        FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST
      );
    });

    it('should fail when the file already exists', async () => {
      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(true)
      );
      sandbox.replace(
        fileIngestor['s3Manager'],
        'fileExists',
        sandbox.fake.resolves(true)
      );

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
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(
        results.fileProcessingErrors[0].errorType,
        FILE_PROCESSING_ERROR_TYPES.FILE_ALREADY_EXISTS
      );
    });

    it('should fail when we have the same file/table combination more than once', async () => {
      const newFileInfo = JSON.parse(JSON.stringify(payload.fileInfo[0]));
      newFileInfo.fileName = 'APPEND' + newFileInfo.fileName;
      payload.fileInfo.push(newFileInfo);
      payload.fileInfo.push(newFileInfo);
      payload.fileInfo[0].operation =
        fileIngestion.constants.FILE_OPERATION.ADD;

      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropView',
        sandbox.fake.resolves(true as unknown as void)
      );

      sandbox.replace(
        fileIngestor['s3Manager'],
        'fileExists',
        sandbox.fake.resolves(false)
      );

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
      const results = await fileIngestor.process();

      assert.isArray(results.fileInformation);
      assert.isArray(results.fileProcessingErrors);
      assert.strictEqual(results.fileProcessingErrors.length, 1);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 0);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.ERROR);
      assert.strictEqual(
        results.fileProcessingErrors[0].errorType,
        FILE_PROCESSING_ERROR_TYPES.INVALID_TABLE_SET
      );
    });
  });

  context('Replace A Table', () => {
    const databaseName = 'testDatabaseName';
    const sandbox = createSandbox();
    let payload: fileIngestion.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(
        aws.S3Manager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        BasicAthenaProcessor.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        businessLogic.Initializer,
        'init',
        sandbox.stub().resolves(null as unknown as void)
      );
      sandbox.replace(
        businessLogic.projectService,
        'updateProjectFileStats',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );

      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );

      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      payload.fileInfo.splice(1);
      payload.fileInfo[0].operation =
        fileIngestion.constants.FILE_OPERATION.REPLACE;
      fileIngestor = new FileIngestor(payload, databaseName);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Should replace an existing table', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropTable',
        dropTableFake
      );

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(
        fileIngestor['tableArchver'],
        'archiveTable',
        archiveTableFake
      );

      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(true)
      );

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
    });

    it('should fail if the table does not exist', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropTable',
        dropTableFake
      );

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(
        fileIngestor['tableArchver'],
        'archiveTable',
        archiveTableFake
      );

      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

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
      assert.strictEqual(
        results.fileProcessingErrors[0].errorType,
        FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST
      );
    });

    it('should fail if we try to replace a table being added in this set', async () => {
      const addTableInfo = JSON.parse(JSON.stringify(payload.fileInfo[0]));
      addTableInfo.operation = fileIngestion.constants.FILE_OPERATION.ADD;
      addTableInfo.fileName = 'ADD' + addTableInfo.fileName;
      payload.fileInfo.unshift(addTableInfo);
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropTable',
        dropTableFake
      );

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(
        fileIngestor['tableArchver'],
        'archiveTable',
        archiveTableFake
      );

      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

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
      assert.strictEqual(
        results.fileProcessingErrors[0].errorType,
        FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST
      );
    });
  });

  context('Delete a Table', () => {
    const databaseName = 'testDatabaseName';
    const sandbox = createSandbox();
    let payload: fileIngestion.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(
        aws.S3Manager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        BasicAthenaProcessor.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );

      sandbox.replace(
        businessLogic.Initializer,
        'init',
        sandbox.stub().resolves(null as unknown as void)
      );
      sandbox.replace(
        businessLogic.projectService,
        'updateProjectFileStats',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );
      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );
      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      payload.fileInfo.splice(1);
      payload.fileInfo[0].operation =
        fileIngestion.constants.FILE_OPERATION.DELETE;
      fileIngestor = new FileIngestor(payload, databaseName);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should delete a table that exists', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropTable',
        dropTableFake
      );

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(
        fileIngestor['tableArchver'],
        'archiveTable',
        archiveTableFake
      );

      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(true)
      );

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
    });

    it('should fail if the table does not exist', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropTable',
        dropTableFake
      );

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(
        fileIngestor['tableArchver'],
        'archiveTable',
        archiveTableFake
      );

      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

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
      assert.strictEqual(
        results.fileProcessingErrors[0].errorType,
        FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST
      );
    });

    it('should fail if the table is added and deleted in the same set', async () => {
      const addTableInfo = JSON.parse(JSON.stringify(payload.fileInfo[0]));
      addTableInfo.operation = fileIngestion.constants.FILE_OPERATION.ADD;
      addTableInfo.fileName = 'ADD' + addTableInfo.fileName;
      payload.fileInfo.unshift(addTableInfo);
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);

      const dropTableFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(
        fileIngestor['athenaManager'],
        'dropTable',
        dropTableFake
      );

      const archiveTableFake = sandbox.fake.resolves(true as unknown as void);
      sandbox.replace(
        fileIngestor['tableArchver'],
        'archiveTable',
        archiveTableFake
      );

      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

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
      assert.strictEqual(
        results.fileProcessingErrors[0].errorType,
        FILE_PROCESSING_ERROR_TYPES.TABLE_DOES_NOT_EXIST
      );
    });
  });

  context('view affecting operation', () => {
    const databaseName = 'testDatabaseName';
    const sandbox = createSandbox();
    let payload: fileIngestion.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(
        aws.S3Manager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        BasicAthenaProcessor.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        businessLogic.Initializer,
        'init',
        sandbox.stub().resolves(null as unknown as void)
      );
      sandbox.replace(
        businessLogic.projectService,
        'updateProjectFileStats',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );

      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );
      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      fileIngestor = new FileIngestor(payload, databaseName);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });
    it('Should only try to drop the view once even if multiple view affecting operations are present', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);
      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

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
      const results = await fileIngestor.process();

      assert.isTrue(dropViewFake.calledOnce);
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.OK);
    });
  });

  context('file upload has errors', () => {
    const databaseName = 'testDatabaseName';
    const sandbox = createSandbox();
    let payload: fileIngestion.IPayload;
    let fileIngestor: FileIngestor;
    beforeEach(async () => {
      sandbox.replace(
        aws.S3Manager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        BasicAthenaProcessor.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );
      sandbox.replace(
        businessLogic.Initializer,
        'init',
        sandbox.stub().resolves(null as unknown as void)
      );
      sandbox.replace(
        businessLogic.projectService,
        'updateProjectFileStats',
        sandbox.stub().resolves({} as unknown as databaseTypes.IProject)
      );

      sandbox.replace(
        businessLogic.projectService,
        'getProjectFileStats',
        sandbox.stub().resolves(mockPayload.payload.fileStats)
      );
      payload = JSON.parse(JSON.stringify(mockPayload)).payload;

      fileIngestor = new FileIngestor(payload, databaseName);
      await fileIngestor.init();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should report errors if sent by file upload', async () => {
      const dropViewFake = sandbox.fake.resolves(true as unknown);
      sandbox.replace(fileIngestor['athenaManager'], 'dropView', dropViewFake);
      sandbox.replace(
        fileIngestor['athenaManager'],
        'tableExists',
        sandbox.fake.resolves(false)
      );

      sandbox.replace(
        FileUploadManager,
        'processAndUploadNewFiles',
        sandbox.fake.resolves({
          fileInformation: {} as IFileInformation,
          errorInformation: [
            {error: 'oops'} as unknown as IFileProcessingError,
          ] as IFileProcessingError[],
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
      const results = await fileIngestor.process();

      assert.strictEqual(results.fileProcessingErrors.length, 2);
      assert.isArray(results.joinInformation);
      assert.strictEqual(results.joinInformation.length, 1);
      assert.strictEqual(results.joinInformation[0].tableName, 'fooTable');
      assert.strictEqual(results.status, FILE_PROCESSING_STATUS.WARNING);
    });
  });
});
