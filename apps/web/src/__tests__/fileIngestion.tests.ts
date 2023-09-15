import 'mocha';
import {assert} from 'chai';

import {createSandbox} from 'sinon';
// where the magic happens
import * as proxyquireType from 'proxyquire';
const proxyquire = proxyquireType.noCallThru();
import {testApiHandler} from 'next-test-api-route-handler';
import {_ingestFiles} from 'lib/client/mutations/core';
import {wrapConfig} from './utilities/wrapConfig';
import {genericDelete, genericGet, genericPut} from './utilities/genericReqs';
import {Types as mongooseTypes} from 'mongoose';
import {databaseTypes, webTypes, fileIngestionTypes} from 'types';
import {BasicColumnNameCleaner} from 'fileingestion';
import {Session} from 'next-auth';

const MOCK_SESSION = {
  user: {
    userId: '645aa1458d6a87808abf59db',
    name: 'James Graham',
    email: 'james@glyphx.co',
  },
  expires: new Date().toISOString(),
} as unknown as Session;

const MOCK_USER_AGENT: databaseTypes.IUserAgent = {
  userAgent: '',
  platform: '',
  appName: '',
  appVersion: '',
  vendor: '',
  language: '',
  cookieEnabled: false,
};
const MOCK_LOCATION = 'location';

const MOCK_PROJECT: databaseTypes.IProject = {
  _id: new mongooseTypes.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'test project',
  description: 'this is a test description',
  sdtPath: 'sdtPath',
  currentVersion: 0,
  workspace: {
    _id: new mongooseTypes.ObjectId(),
  } as unknown as databaseTypes.IWorkspace,
  template: {
    _id: new mongooseTypes.ObjectId(),
  } as unknown as databaseTypes.IProjectTemplate,
  stateHistory: [],
  members: [],
  tags: [],
  state: {
    properties: {
      X: {
        axis: webTypes.constants.AXIS.X,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column X', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
      Y: {
        axis: webTypes.constants.AXIS.Y,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column Y', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
      Z: {
        axis: webTypes.constants.AXIS.Z,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column Z', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
      A: {
        axis: webTypes.constants.AXIS.A,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column 1', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
      B: {
        axis: webTypes.constants.AXIS.B,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column 2', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
      C: {
        axis: webTypes.constants.AXIS.C,
        accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
        key: 'Column 3', // corresponds to column name
        dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
        interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
        direction: webTypes.constants.DIRECTION_TYPE.ASC,
        filter: {
          min: 0,
          max: 0,
        },
      },
    },
  } as unknown as databaseTypes.IState,
  files: [],
  viewName: 'testView',
};
const MOCK_PAYLOAD: webTypes.IClientSidePayload = {
  clientId: 'testclientid',
  modelId: 'testmodelid',
  bucketName: 'jps-test-bucket',
  fileStats: [
    {
      fileName: 'Table1.csv',
      tableName: 'Table1',
      numberOfColumns: 4,
      numberOfRows: 100,
      columns: [
        {
          name: 'col1',
          fieldType: 0,
        },
        {
          name: 'col2',
          fieldType: 1,
        },
        {
          name: 'col3',
          fieldType: 1,
        },
        {
          name: 'col4',
          fieldType: 0,
        },
      ],
      fileSize: 3523,
    },
  ],
  fileInfo: [
    {
      tableName: 'Table1',
      fileName: 'Table1.csv',
      operation: 2,
    },
  ],
};
const MOCK_FILE_INFO: Omit<fileIngestionTypes.IFileInfo, 'fileStream'>[] = [
  {
    tableName: 'Table1',
    fileName: 'Table1.csv',
    operation: 2,
  },
];
const MOCK_STATUS: databaseTypes.constants.PROCESS_STATUS = databaseTypes.constants.PROCESS_STATUS.COMPLETED;

describe.only('FILE INGESTION ROUTE', () => {
  const sandbox = createSandbox();

  // file ingestion stubs
  let fileIngestionRoute;
  let fileIngestionRouteWrapper;
  let fileIngestion;
  let fileIngestionStub;

  // route stubs
  let validateSessionStub;
  let initializerStub;

  // handler stubs
  let formatUserAgentStub;

  // mock services
  let mockProcessTrackingService;
  let mockProjectService;
  let mockActivityLogService;
  let mockGeneralPurposeFunctions;
  let mockFileIngestor;
  let mockAws;
  let mockS3Manager;

  beforeEach(() => {
    // route stubs
    validateSessionStub = sandbox.stub();
    validateSessionStub.resolves(MOCK_SESSION);
    initializerStub = {init: sandbox.stub(), initedField: false};
    initializerStub.init.resolves();

    //   handler stubs
    fileIngestionStub = sandbox.stub();
    formatUserAgentStub = sandbox.stub();

    //   mock services
    mockAws = {
      S3Manager: sandbox.stub(),
    };
    mockS3Manager = {
      inited: true,
      init: sandbox.stub(),
      getObjectStream: sandbox.stub(),
    };
    mockFileIngestor = {
      inited: true,
      init: sandbox.stub(),
      process: sandbox.stub(),
    };
    mockProjectService = {updateProjectFileStats: sandbox.stub()};
    mockProcessTrackingService = {createProcessTracking: sandbox.stub()};
    mockGeneralPurposeFunctions = {createProcessTracking: sandbox.stub(), getProcessId: sandbox.stub()};
    mockActivityLogService = {createLog: sandbox.stub()};

    /******************** ROUTE /api/workspace/team/role ********************/
    // replace handler import resolution
    fileIngestion = proxyquire.load('../lib/server/etl/fileIngestion', {
      business: {
        processTrackingService: mockProcessTrackingService,
        projectService: mockProjectService,
        activityLogService: mockActivityLogService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
      fileingestion: {
        FileIngestor: mockFileIngestor,
      },
      core: {
        generalPursposeFunctions: mockGeneralPurposeFunctions,
        aws: mockAws,
      },
    }).fileIngestion;

    // swap overridden import into handler to be able to call
    fileIngestionRouteWrapper = proxyquire('../pages/api/etl/ingest', {
      business: {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/etl/fileIngestion': {
        fileIngestion: fileIngestion,
      },
    });

    // for testing routing at api/workspace
    fileIngestionRoute = proxyquire('../pages/api/etl/ingest', {
      business: {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/etl/fileIngestion': {
        fileIngestion: fileIngestionStub,
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('/api/etl/ingest', async () => {
    describe('FILE INGESTION handler', () => {
      it('should process files via fileIngestor', async () => {
        const cleanColumnNameStub = sandbox.stub();
        cleanColumnNameStub.resolves();
        sandbox.replace(BasicColumnNameCleaner.prototype, 'cleanColumnName', cleanColumnNameStub);

        mockProjectService.updateProjectFileStats.resolves(MOCK_PROJECT);
        mockAws.S3Manager.resolves();
        mockS3Manager.init.resolves();
        mockS3Manager.getObjectStream.resolves();
        mockGeneralPurposeFunctions.getProcessId.returns(
          //
          new mongooseTypes.ObjectId()
        );
        mockGeneralPurposeFunctions.createProcessTracking.resolves();
        mockFileIngestor.init.resolves();
        mockFileIngestor.process.resolves({
          fileInformation: MOCK_FILE_INFO,
          fileProcessingErrors: [],
          joinInformation: [],
          viewName: MOCK_PROJECT.viewName,
          status: MOCK_STATUS,
        });
        formatUserAgentStub.returns({agentData: MOCK_USER_AGENT, location: MOCK_LOCATION});
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: fileIngestionRouteWrapper,
          url: '/api/etl/ingest',
          test: async ({fetch}) => {
            const config = wrapConfig(_ingestFiles(MOCK_PAYLOAD));
            const res = await fetch(config);
            assert.strictEqual(res.status, 200);
          },
        });
      });
    });

    describe('Authentication', () => {
      it('should return 401 for invalid session', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves('invalid session');

        await testApiHandler({
          handler: fileIngestionRoute,
          url: '/api/etl/ingest',
          test: async ({fetch}) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(fileIngestionStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method GET', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: fileIngestionRoute,
          url: '/api/etl/ingest',
          test: async ({fetch}) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(fileIngestionStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'POST');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'GET method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method PUT', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: fileIngestionRoute,
          url: '/api/etl/ingest',
          test: async ({fetch}) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(fileIngestionStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'POST');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'PUT method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method DELETE', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: fileIngestionRoute,
          url: '/api/etl/ingest',
          test: async ({fetch}) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(fileIngestionStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'POST');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'DELETE method unsupported');
          },
        });
      });
    });
  });
});
