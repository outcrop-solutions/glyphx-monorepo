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
import { genericDelete, genericGet, genericPost, genericPut } from './utilities/genericReqs';
import { Types as mongooseTypes } from 'mongoose';
import { database as databaseTypes } from '@glyphx/types';

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
};

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
};

const MOCK_PROJECT_LOG: databaseTypes.IActivityLog = {
  createdAt: new Date(),
  updatedAt: new Date(),
  actor: MOCK_USER,
  location: MOCK_LOCATION,
  projectId: new mongooseTypes.ObjectId(),
  userAgent: MOCK_USER_AGENT,
  action: databaseTypes.constants.ACTION_TYPE.UPDATED,
  onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT,
  resource: MOCK_USER,
};
const MOCK_WORKSPACE_LOG: databaseTypes.IActivityLog = {
  createdAt: new Date(),
  updatedAt: new Date(),
  actor: MOCK_USER,
  workspaceId: 'workspaceId' as unknown as mongooseTypes.ObjectId,
  location: MOCK_LOCATION,
  userAgent: MOCK_USER_AGENT,
  action: databaseTypes.constants.ACTION_TYPE.UPDATED,
  onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
  resource: MOCK_WORKSPACE,
};

describe('LOG ROUTES', () => {
  const sandbox = createSandbox();
  // get project logs
  let getProjectLogsRoute;
  let getProjectLogsRouteWrapper;
  let getProjectLogs;
  let getProjectLogsStub;

  // get workspace logs
  let getWorkspaceLogsRoute;
  let getWorkspaceLogsRouteWrapper;
  let getWorkspaceLogs;
  let getWorkspaceLogsStub;

  // route stubs
  let validateSessionStub;
  let initializerStub;

  // handler stubs
  let formatUserAgentStub;
  let mockActivityLogService;

  beforeEach(() => {
    // route stubs
    validateSessionStub = sandbox.stub();
    validateSessionStub.resolves(MOCK_SESSION);
    initializerStub = { init: sandbox.stub(), initedField: false };
    initializerStub.init.resolves();
    getProjectLogsStub = sandbox.stub();
    getWorkspaceLogsStub = sandbox.stub();

    // handler stubs
    formatUserAgentStub = sandbox.stub();
    mockActivityLogService = { createLog: sandbox.stub(), getLogs: sandbox.stub() };

    // GET PROJECT LOGS
    // replace handler import resolution
    getProjectLogs = proxyquire.load('../lib/server/activity', {
      '@glyphx/business': {
        activityLogService: mockActivityLogService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).getProjectLogs;

    // swap overridden import into handler to be able to call
    getProjectLogsRouteWrapper = proxyquire('../pages/api/logs/project/[projectId]', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/activity': {
        getProjectLogs: getProjectLogs,
      },
    });

    // for testing routing
    getProjectLogsRoute = proxyquire('../pages/api/logs/project/[projectId]', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/activity': {
        getProjectLogs: getProjectLogsStub,
      },
    });
    // GET WORKSPACE LOGS
    // replace handler import resolution
    getWorkspaceLogs = proxyquire.load('../lib/server/activity', {
      '@glyphx/business': {
        activityLogService: mockActivityLogService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).getWorkspaceLogs;

    // swap overridden import into handler to be able to call
    getWorkspaceLogsRouteWrapper = proxyquire('../pages/api/logs/workspace/[workspaceId]', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/activity': {
        getWorkspaceLogs: getWorkspaceLogs,
      },
    });

    // for testing routing
    getWorkspaceLogsRoute = proxyquire('../pages/api/logs/workspace/[workspaceId]', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/activity': {
        getWorkspaceLogs: getWorkspaceLogsStub,
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('/api/logs/project/[projectId]', async function () {
    describe('GET PROJECT LOGS handler', () => {
      it('should get a projects logs', async function () {
        mockActivityLogService.getLogs.resolves([MOCK_PROJECT_LOG]);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });

        await testApiHandler({
          handler: getProjectLogsRouteWrapper,
          url: '/api/logs/project/[projectId]',
          params: { projectId: MOCK_PROJECT._id.toString() },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
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
          handler: getProjectLogsRoute,
          url: '/api/logs/project/[projectId]',
          params: { projectId: MOCK_PROJECT._id.toString() },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getProjectLogsStub.calledOnce);
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
          handler: getProjectLogsRoute,
          url: '/api/logs/project/[projectId]',
          params: { projectId: MOCK_PROJECT._id.toString() },
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getProjectLogsStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
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
          handler: getProjectLogsRoute,
          url: '/api/logs/project/[projectId]',
          params: { projectId: MOCK_PROJECT._id.toString() },
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getProjectLogsStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'PUT method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method POST', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: getProjectLogsRoute,
          url: '/api/logs/project/[projectId]',
          params: { projectId: MOCK_PROJECT._id.toString() },
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getProjectLogsStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'POST method unsupported');
          },
        });
      });
    });
  });
  context('/api/logs/workspace/[workspaceId]', async function () {
    describe('GET WORKSPACE LOGS handler', () => {
      it('should get a workspaces logs', async function () {
        mockActivityLogService.getLogs.resolves([MOCK_WORKSPACE_LOG]);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });

        await testApiHandler({
          handler: getWorkspaceLogsRouteWrapper,
          url: '/api/logs/workspace/[workspaceId]',
          params: { workspaceId: MOCK_WORKSPACE._id.toString() },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
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
          handler: getWorkspaceLogsRoute,
          url: '/api/logs/workspace/[workspaceId]',
          params: { workspaceId: MOCK_WORKSPACE._id.toString() },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspaceLogsStub.calledOnce);
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
          handler: getWorkspaceLogsRoute,
          url: '/api/logs/workspace/[workspaceId]',
          params: { workspaceId: MOCK_WORKSPACE._id.toString() },
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspaceLogsStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
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
          handler: getWorkspaceLogsRoute,
          url: '/api/logs/workspace/[workspaceId]',
          params: { workspaceId: MOCK_WORKSPACE._id.toString() },
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspaceLogsStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'PUT method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method POST', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: getWorkspaceLogsRoute,
          url: '/api/logs/workspace/[workspaceId]',
          params: { workspaceId: MOCK_WORKSPACE._id.toString() },
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspaceLogsStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'POST method unsupported');
          },
        });
      });
    });
  });
});
