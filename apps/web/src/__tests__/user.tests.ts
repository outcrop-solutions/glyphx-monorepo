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

describe('USER ROUTES', () => {
  const sandbox = createSandbox();
  // deactivate
  let deactivateUserRoute;
  let deactivateUserRouteWrapper;
  let deactivateUser;
  let deactivateUserStub;

  // updateEmail
  let updateEmailRoute;
  let updateEmailRouteWrapper;
  let updateEmail;
  let updateEmailStub;

  // updateName
  let updateNameRoute;
  let updateNameRouteWrapper;
  let updateName;
  let updateNameStub;

  // route stubs
  let validateSessionStub;
  let initializerStub;

  // handler stubs
  let formatUserAgentStub;
  let mockUserService;
  let mockActivityLogService;
  let validateUpdateEmailStub;
  let validateUpdateNameStub;

  beforeEach(() => {
    // route stubs
    validateSessionStub = sandbox.stub();
    validateSessionStub.resolves(MOCK_SESSION);
    initializerStub = { init: sandbox.stub(), initedField: false };
    initializerStub.init.resolves();
    deactivateUserStub = sandbox.stub();
    updateEmailStub = sandbox.stub();
    updateNameStub = sandbox.stub();

    // handler stubs
    formatUserAgentStub = sandbox.stub();
    mockUserService = { deactivate: sandbox.stub(), updateEmail: sandbox.stub(), updateName: sandbox.stub() };
    mockActivityLogService = { createLog: sandbox.stub() };
    validateUpdateEmailStub = sandbox.stub();
    validateUpdateNameStub = sandbox.stub();

    // DEACTIVATE USER
    // replace handler import resolution
    deactivateUser = proxyquire.load('../lib/server/user', {
      '@glyphx/business': {
        userService: mockUserService,
        activityLogService: mockActivityLogService,
        validateUpdateEmail: validateUpdateEmailStub,
        validateUpdateName: validateUpdateNameStub,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).deactivateUser;

    // swap overridden import into handler to be able to call
    deactivateUserRouteWrapper = proxyquire('../pages/api/user', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/user': {
        deactivateUser: deactivateUser,
      },
    });

    // for testing routing
    deactivateUserRoute = proxyquire('../pages/api/user', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/user': {
        deactivateUser: deactivateUserStub,
      },
    });

    // UPDATE EMAIL
    // replace handler import resolution
    updateEmail = proxyquire.load('../lib/server/user', {
      '@glyphx/business': {
        userService: mockUserService,
        activityLogService: mockActivityLogService,
        validateUpdateEmail: validateUpdateEmailStub,
        validateUpdateName: validateUpdateNameStub,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).updateEmail;

    // swap overridden import into handler to be able to call
    updateEmailRouteWrapper = proxyquire('../pages/api/user/email', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/user': {
        updateEmail: updateEmail,
      },
    });

    // for testing routing
    updateEmailRoute = proxyquire('../pages/api/user/email', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/user': {
        updateEmail: updateEmailStub,
      },
    });

    // UPDATE NAME
    // replace handler import resolution
    updateName = proxyquire.load('../lib/server/user', {
      '@glyphx/business': {
        userService: mockUserService,
        activityLogService: mockActivityLogService,
        validateUpdateEmail: validateUpdateEmailStub,
        validateUpdateName: validateUpdateNameStub,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).updateName;

    // swap overridden import into handler to be able to call
    updateNameRouteWrapper = proxyquire('../pages/api/user/name', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/user': {
        updateName: updateName,
      },
    });

    // for testing routing
    updateNameRoute = proxyquire('../pages/api/user/name', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/user': {
        updateName: updateNameStub,
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('/api/user', async function () {
    describe('DELETE handler', () => {
      it('should deactivate a user', async function () {
        mockUserService.deactivate.resolves(MOCK_USER);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: deactivateUserRouteWrapper,
          url: '/api/user',
          test: async ({ fetch }) => {
            const config = wrapConfig(_deactivateAccount());
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
          handler: deactivateUserRoute,
          url: '/api/user',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(deactivateUserStub.calledOnce);
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
          handler: deactivateUserRoute,
          url: '/api/user',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(deactivateUserStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'DELETE');
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
          handler: deactivateUserRoute,
          url: '/api/user',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(deactivateUserStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'DELETE');
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
          handler: deactivateUserRoute,
          url: '/api/user',
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(deactivateUserStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'DELETE');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'POST method unsupported');
          },
        });
      });
    });
  });

  context('/api/user/email', async function () {
    describe('PUT handler', () => {
      it('should update user email', async function () {
        validateUpdateEmailStub.resolves();
        mockUserService.updateEmail.resolves(MOCK_USER);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: updateEmailRouteWrapper,
          url: '/api/user/email',
          test: async ({ fetch }) => {
            const config = wrapConfig(_updateUserEmail(MOCK_USER.email));
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
          handler: deactivateUserRoute,
          url: '/api/user/email',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(deactivateUserStub.calledOnce);
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
          handler: updateEmailRoute,
          url: '/api/user/email',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateEmailStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'GET method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method POST', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: updateEmailRoute,
          url: '/api/user/email',
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateEmailStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'POST method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method DELETE', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: updateEmailRoute,
          url: '/api/user/email',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateEmailStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'DELETE method unsupported');
          },
        });
      });
    });
  });

  context('/api/user/name', async function () {
    describe('PUT Handler', () => {
      it('should change user name', async function () {
        validateUpdateNameStub.resolves();
        mockUserService.updateName.resolves(MOCK_USER);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: updateNameRouteWrapper,
          url: '/api/user/name',
          test: async ({ fetch }) => {
            const config = wrapConfig(_updateUserName(MOCK_USER.name));
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
          handler: updateNameRoute,
          url: '/api/user/name',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateNameStub.calledOnce);
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
          handler: updateNameRoute,
          url: '/api/user/name',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateNameStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'GET method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method POST', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: updateNameRoute,
          url: '/api/user/name',
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateNameStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'POST method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method DELETE', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: updateNameRoute,
          url: '/api/user/name',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateNameStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
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
