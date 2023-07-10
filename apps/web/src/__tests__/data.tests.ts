import 'mocha';
import { assert } from 'chai';
import { Session } from 'next-auth';
import { createSandbox } from 'sinon';
// where the magic happens
import * as proxyquireType from 'proxyquire';
const proxyquire = proxyquireType.noCallThru();
import { testApiHandler } from 'next-test-api-route-handler';
import { _deactivateAccount, _updateUserEmail, _updateUserName } from 'lib/client/mutations/user';
import { wrapConfig } from './utilities/wrapConfig';
import { genericDelete, genericGet, genericPut } from './utilities/genericReqs';
import { Types as mongooseTypes } from 'mongoose';
import { database as databaseTypes, fileIngestion as fileIngestionTypes, web as webTypes } from '@glyphx/types';
import { formatGridData } from 'lib/client/files/transforms/formatGridData';
import { _getDataGrid, _getRowIds } from 'lib';

// import type { PageConfig } from 'next';
// Respect the Next.js config object if it's exported
// const handler: typeof deactivate & { config?: PageConfig } = deactivate;
// handler.config = config;

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
const MOCK_LOCATION: string = 'location';

const MOCK_USER: databaseTypes.IUser = {
  userCode: 'dfkadfkljafdkalsjskldf',
  name: 'testUser',
  username: 'test@user.com',
  email: 'test@user.com',
  emailVerified: new Date(),
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [],
  sessions: [],
  membership: [],
  invitedMembers: [],
  createdWorkspaces: [],
  projects: [],
  webhooks: [],
};

const MOCK_WORKSPACE: databaseTypes.IWorkspace = {
  _id: new mongooseTypes.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  workspaceCode: 'testWorkspaceCode',
  inviteCode: 'testInviteCode',
  name: 'Test Workspace',
  slug: 'testSlug',
  description: 'a test workspace',
  creator: {
    _id: new mongooseTypes.ObjectId(),
  } as unknown as databaseTypes.IUser,
  members: [],
  projects: [],
  states: [],
  tags: [],
};

const MOCK_DATA: any[] = [
  { column1: 'col1Value', column2: 'col2Value' },
  { column1: 'col1Value', column2: 'col2Value' },
];

const MOCK_RENDERABLE_DATA_GRID: webTypes.IRenderableDataGrid = {
  columns: [
    {
      key: 'id',
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
      width: 40,
      resizable: true,
      sortable: true,
    },
    {
      key: 'column1',
      dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
      width: 40,
      resizable: true,
      sortable: true,
    },
    {
      key: 'column2',
      dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
      width: 40,
      resizable: true,
      sortable: true,
    },
  ],
  rows: [
    { id: 0, column1: 'col1Value', column2: 'col2Value' },
    { id: 1, column1: 'col1Value', column2: 'col2Value' },
  ],
};

const MOCK_TABLE_NAME = 'mocktableName';

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
  slug: 'what is a slug anyway',
  template: {
    _id: new mongooseTypes.ObjectId(),
  } as unknown as databaseTypes.IProjectTemplate,
  stateHistory: [],
  members: [],
  state: {
    _id: new mongooseTypes.ObjectId(),
  } as unknown as databaseTypes.IState,
  files: [],
  viewName: 'testView',
  tags: [],
};

describe('DATA ROUTES', () => {
  const sandbox = createSandbox();
  // get data by tablename
  let getDataByTableNameRoute;
  let getDataByTableNameRouteWrapper;
  let getDataByTableName;
  let getDataByTableNameStub;

  let getDataByTableNameServiceStub;
  let getDataByRowIdsServiceStub;
  // get data by row id
  let getDataByRowIdRoute;
  let getDataByRowIdRouteWrapper;
  let getDataByRowId;
  let getDataByRowIdStub;

  // route stubs
  let validateSessionStub;
  let initializerStub;

  // handler stubs
  let formatGridDataStub;
  let mockDataService;
  let mockGeneralPurposeFunctions;

  beforeEach(() => {
    // route stubs
    validateSessionStub = sandbox.stub();
    validateSessionStub.resolves(MOCK_SESSION);
    initializerStub = { init: sandbox.stub(), initedField: false };
    initializerStub.init.resolves();
    formatGridDataStub = sandbox.stub();
    getDataByTableNameStub = sandbox.stub();
    getDataByTableNameServiceStub = sandbox.stub();
    getDataByRowIdsServiceStub = sandbox.stub();
    getDataByRowIdStub = sandbox.stub();
    mockGeneralPurposeFunctions = {
      fileIngestion: {
        getFullTableName: sandbox.stub(),
      },
    };

    mockDataService = {
      getDataByTableName: getDataByTableNameServiceStub,
      getDataByGlyphxIds: getDataByRowIdsServiceStub,
    };
    // GET DATA BY ROW ID
    // replace handler import resolution
    getDataByTableName = proxyquire.load('../lib/server/data', {
      '@glyphx/business': {
        dataService: mockDataService,
      },
      '@glyphx/core': {
        generalPurposeFunctions: mockGeneralPurposeFunctions,
      },
      'lib/client/files/transforms/formatGridData': {
        formatGridData: formatGridDataStub,
      },
    }).getDataByTableName;

    // swap overridden import into handler to be able to call
    getDataByTableNameRouteWrapper = proxyquire('../pages/api/data/grid', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/data': {
        getDataByTableName: getDataByTableName,
      },
    });

    // for testing routing
    getDataByTableNameRoute = proxyquire('../pages/api/data/grid', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/data': {
        getDataByTableName: getDataByTableNameStub,
      },
    });

    // GET DATA BY ROW ID
    // replace handler import resolution
    getDataByRowId = proxyquire.load('../lib/server/data', {
      '@glyphx/business': {
        dataService: mockDataService,
      },
      '@glyphx/core': {
        generalPurposeFunctions: mockGeneralPurposeFunctions,
      },
      'lib/client/files/transforms/formatGridData': {
        formatGridData: formatGridDataStub,
      },
    }).getDataByRowId;

    // swap overridden import into handler to be able to call
    getDataByRowIdRouteWrapper = proxyquire('../pages/api/data/rows', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/data': {
        getDataByRowId: getDataByRowId,
      },
    });

    // for testing routing
    getDataByRowIdRoute = proxyquire('../pages/api/data/rows', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/data': {
        getDataByRowId: getDataByRowIdStub,
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('/api/data/grid', async function () {
    describe('GET DATA BY TABLENAME handler', () => {
      it('should get all data for a given view', async function () {
        mockGeneralPurposeFunctions.fileIngestion.getFullTableName.resolves(MOCK_TABLE_NAME);
        mockDataService.getDataByTableName.resolves(MOCK_DATA);
        formatGridDataStub.returns(MOCK_RENDERABLE_DATA_GRID);

        await testApiHandler({
          handler: getDataByTableNameRouteWrapper,
          url: '/api/data/grid',
          test: async ({ fetch }) => {
            const res = await fetch(
              wrapConfig(_getDataGrid(MOCK_WORKSPACE._id.toString(), MOCK_PROJECT._id.toString(), MOCK_TABLE_NAME))
            );

            assert.strictEqual(res.status, 200);

            const data = await res.json();
            assert.strictEqual(data.data.rows.length, MOCK_RENDERABLE_DATA_GRID.rows.length);
            assert.strictEqual(data.data.columns.length, MOCK_RENDERABLE_DATA_GRID.columns.length);
            assert.strictEqual(data.totalPages, 1);
            assert.strictEqual(data.currentPage, 1);
          },
        });
      });
    });

    describe('Authentication', () => {
      it('should return 401 for invalid session', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves('invalid session');

        await testApiHandler({
          handler: getDataByTableNameRoute,
          url: '/api/data/grid',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getDataByTableNameStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method DELETE', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: getDataByTableNameRoute,
          url: '/api/data/grid',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getDataByTableNameStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'POST');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'DELETE method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method PUT', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: getDataByTableNameRoute,
          url: '/api/data/grid',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getDataByTableNameStub.calledOnce);
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
          handler: getDataByTableNameRoute,
          url: '/api/data/grid',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getDataByTableNameStub.calledOnce);
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
  context('/api/data/rows', async function () {
    describe('GET DATA BY ROW ID handler', () => {
      it('should get data by row id', async function () {
        mockGeneralPurposeFunctions.fileIngestion.getFullTableName.resolves(MOCK_TABLE_NAME);
        mockDataService.getDataByGlyphxIds.resolves(MOCK_DATA);
        formatGridDataStub.returns(MOCK_RENDERABLE_DATA_GRID);
        await testApiHandler({
          handler: getDataByRowIdRouteWrapper,
          url: '/api/data/rows',
          test: async ({ fetch }) => {
            const res = await fetch(
              wrapConfig(
                _getRowIds(MOCK_WORKSPACE._id.toString(), MOCK_PROJECT._id.toString(), MOCK_TABLE_NAME, ['0', '1'])
              )
            );

            assert.strictEqual(res.status, 200);

            const data = await res.json();
            assert.strictEqual(data.data.rows.length, MOCK_RENDERABLE_DATA_GRID.rows.length);
            assert.strictEqual(data.data.columns.length, MOCK_RENDERABLE_DATA_GRID.columns.length);
            assert.strictEqual(data.totalPages, 1);
            assert.strictEqual(data.currentPage, 1);
          },
        });
      });
    });

    describe('Authentication', () => {
      it('should return 401 for invalid session', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves('invalid session');

        await testApiHandler({
          handler: getDataByRowIdRoute,
          url: '/api/data/rows',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getDataByRowIdStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method DELETE', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: getDataByRowIdRoute,
          url: '/api/data/rows',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getDataByRowIdStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'POST');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'DELETE method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method PUT', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: getDataByRowIdRoute,
          url: '/api/data/rows',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getDataByRowIdStub.calledOnce);
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
          handler: getDataByRowIdRoute,
          url: '/api/data/rows',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getDataByRowIdStub.calledOnce);
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
