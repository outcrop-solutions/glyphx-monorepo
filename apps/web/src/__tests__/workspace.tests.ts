import 'mocha';
import { assert } from 'chai';
import { Session } from 'next-auth';
import { createSandbox } from 'sinon';
// where the magic happens
import * as proxyquireType from 'proxyquire';
const proxyquire = proxyquireType.noCallThru();
import { testApiHandler } from 'next-test-api-route-handler';
import { _createWorkspace, _deleteWorkspace } from 'lib/client/mutations/workspace';
import { wrapConfig } from './utilities/wrapConfig';
import { genericDelete, genericGet, genericPatch, genericPost, genericPut } from './utilities/genericReqs';
import { database, database as databaseTypes } from '@glyphx/types';
import mongoose from 'mongoose';
import { _createMember } from 'lib';
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

const MOCK_WORKSPACE: databaseTypes.IWorkspace = {
  createdAt: new Date(),
  updatedAt: new Date(),
  workspaceCode: 'testWorkspaceCode',
  inviteCode: 'testInviteCode',
  name: 'Test Workspace',
  slug: 'testSlug',
  description: 'a test workspace',
  creator: {
    _id: new mongoose.Types.ObjectId(),
  } as unknown as databaseTypes.IUser,
  members: [],
  projects: [],
  states: [],
};

const MOCK_MEMBER_1: databaseTypes.IMember = {
  email: 'jamesmurdockgraham@gmail.com',
  inviter: 'jp@glyphx.co',
  type: databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
  createdAt: new Date(),
  updatedAt: new Date(),
  joinedAt: new Date(),
  invitedAt: new Date(),
  status: databaseTypes.constants.INVITATION_STATUS.PENDING,
  teamRole: databaseTypes.constants.ROLE.MEMBER,
  member: { _id: new mongoose.Types.ObjectId() } as databaseTypes.IUser,
  invitedBy: { _id: new mongoose.Types.ObjectId() } as databaseTypes.IUser,
  workspace: { _id: new mongoose.Types.ObjectId() } as databaseTypes.IWorkspace,
};
const MOCK_MEMBER_2: databaseTypes.IMember = {
  email: 'jamesmurdockgraham@gmail.com',
  inviter: 'jp@glyphx.co',
  type: databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
  createdAt: new Date(),
  updatedAt: new Date(),
  joinedAt: new Date(),
  invitedAt: new Date(),
  status: databaseTypes.constants.INVITATION_STATUS.PENDING,
  teamRole: databaseTypes.constants.ROLE.MEMBER,
  member: { _id: new mongoose.Types.ObjectId() } as databaseTypes.IUser,
  invitedBy: { _id: new mongoose.Types.ObjectId() } as databaseTypes.IUser,
  workspace: { _id: new mongoose.Types.ObjectId() } as databaseTypes.IWorkspace,
};

const MOCK_MEMBERS: databaseTypes.IMember[] = [MOCK_MEMBER_1, MOCK_MEMBER_2];

describe('WORKSPACE ROUTES', () => {
  const sandbox = createSandbox();
  // create workspace
  let createWorkspaceRoute;
  let createWorkspaceRouteWrapper;
  let createWorkspace;
  let createWorkspaceStub;

  // get/delete workspace
  let workspaceRoute;
  let workspaceRouteWrapper;
  let getWorkspace;
  let getWorkspaceStub;
  let deleteWorkspace;
  let deleteWorkspaceStub;

  // invite users
  let inviteUsersRoute;
  let inviteUsersRouteWrapper;
  let inviteUsers;
  let inviteUsersStub;

  // route stubs
  let validateSessionStub;
  let initializerStub;

  // handler stubs
  let formatUserAgentStub;
  let mockWorkspaceService;
  let mockMembershipService;
  let mockActivityLogService;
  let validateUpdateWorkspaceNameStub;
  let validateUpdateWorkspaceSlugStub;
  let validateCreateWorkspaceStub;

  beforeEach(() => {
    // route stubs
    validateSessionStub = sandbox.stub();
    validateUpdateWorkspaceNameStub = sandbox.stub();
    validateUpdateWorkspaceSlugStub = sandbox.stub();
    validateCreateWorkspaceStub = sandbox.stub();
    validateSessionStub.resolves(MOCK_SESSION);
    initializerStub = { init: sandbox.stub(), initedField: false };
    initializerStub.init.resolves();
    createWorkspaceStub = sandbox.stub();
    getWorkspaceStub = sandbox.stub();
    deleteWorkspaceStub = sandbox.stub();

    // handler stubs
    formatUserAgentStub = sandbox.stub();
    mockWorkspaceService = {
      countWorkspaces: sandbox.stub(),
      createWorkspace: sandbox.stub(),
      deleteWorkspace: sandbox.stub(),
      getOwnWorkspace: sandbox.stub(),
      getInvitation: sandbox.stub(),
      getSiteWorkspace: sandbox.stub(),
      getWorkspace: sandbox.stub(),
      getWorkspaces: sandbox.stub(),
      getWorkspacePaths: sandbox.stub(),
      inviteUsers: sandbox.stub(),
      isWorkspaceCreator: sandbox.stub(),
      isWorkspaceOwner: sandbox.stub(),
      joinWorkspace: sandbox.stub(),
      updateWorkspaceName: sandbox.stub(),
      updateWorkspaceSlug: sandbox.stub(),
    };

    mockMembershipService = {
      getMember: sandbox.stub(),
      getMembers: sandbox.stub(),
      getPendingInvitations: sandbox.stub(),
      remove: sandbox.stub(),
      udpateRole: sandbox.stub(),
      udpateStatus: sandbox.stub(),
    };

    mockActivityLogService = { createLog: sandbox.stub() };

    /******************** ROUTE /api/workspace ********************/
    // replace handler import resolution
    createWorkspace = proxyquire.load('../lib/server/workspace', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        mockMembershipService: mockMembershipService,
        validateUpdateWorkspaceSlug: validateUpdateWorkspaceSlugStub,
        validateUpdateWorkspaceName: validateUpdateWorkspaceNameStub,
        validateCreateWorkspace: validateCreateWorkspaceStub,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).createWorkspace;

    // swap overridden import into handler to be able to call
    createWorkspaceRouteWrapper = proxyquire('../pages/api/workspace', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        createWorkspace: createWorkspace,
      },
    });

    // for testing routing at api/workspace
    createWorkspaceRoute = proxyquire('../pages/api/workspace', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        createWorkspace: createWorkspaceStub,
      },
    });

    /******************** ROUTE /api/workspace/[workspaceSlug] ********************/
    // replace handler import resolution
    getWorkspace = proxyquire.load('../lib/server/workspace', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        mockMembershipService: mockMembershipService,
        validateUpdateWorkspaceSlug: validateUpdateWorkspaceSlugStub,
        validateUpdateWorkspaceName: validateUpdateWorkspaceNameStub,
        validateCreateWorkspace: validateCreateWorkspaceStub,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).getWorkspace;

    // replace handler import resolution
    deleteWorkspace = proxyquire.load('../lib/server/workspace', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        mockMembershipService: mockMembershipService,
        validateUpdateWorkspaceSlug: validateUpdateWorkspaceSlugStub,
        validateUpdateWorkspaceName: validateUpdateWorkspaceNameStub,
        validateCreateWorkspace: validateCreateWorkspaceStub,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).deleteWorkspace;

    // swap overridden import into handler to be able to call
    workspaceRouteWrapper = proxyquire('../pages/api/workspace/[workspaceSlug]', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        getWorkspace: getWorkspace,
        deleteWorkspace: deleteWorkspace,
      },
    });

    // for testing routing at api/workspace
    workspaceRoute = proxyquire('../pages/api/workspace/[workspaceSlug]', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        getWorkspace: getWorkspaceStub,
        deleteWorkspace: deleteWorkspaceStub,
      },
    });

    /******************** ROUTE /api/workspace/[workspaceSlug]/invite ********************/
    // replace handler import resolution
    inviteUsers = proxyquire.load('../lib/server/workspace', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        mockMembershipService: mockMembershipService,
        validateUpdateWorkspaceSlug: validateUpdateWorkspaceSlugStub,
        validateUpdateWorkspaceName: validateUpdateWorkspaceNameStub,
        validateCreateWorkspace: validateCreateWorkspaceStub,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).inviteUsers;

    // swap overridden import into handler to be able to call
    inviteUsersRouteWrapper = proxyquire('../pages/api/workspace/[workspaceSlug]/invite', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        inviteUsers: inviteUsers,
      },
    });

    // for testing routing at api/workspace
    inviteUsersRoute = proxyquire('../pages/api/workspace/[workspaceSlug]/invite', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        inviteUsers: inviteUsersStub,
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('/api/workspace', async function () {
    describe('CREATE handler', () => {
      it('should create a workspace', async function () {
        validateCreateWorkspaceStub.resolves();
        mockWorkspaceService.createWorkspace.resolves(MOCK_WORKSPACE);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: createWorkspaceRouteWrapper,
          url: '/api/workspace',
          test: async ({ fetch }) => {
            const config = wrapConfig(_createWorkspace(MOCK_WORKSPACE.name));
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
          handler: createWorkspaceRoute,
          url: '/api/workspace',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(createWorkspaceStub.calledOnce);
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
          handler: createWorkspaceRoute,
          url: '/api/workspace',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(createWorkspaceStub.calledOnce);
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
          handler: createWorkspaceRoute,
          url: '/api/workspace',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(createWorkspaceStub.calledOnce);
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
          handler: createWorkspaceRoute,
          url: '/api/workspace',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(createWorkspaceStub.calledOnce);
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

  context('/api/workspace/[workspaceSlug]', async function () {
    describe('GET handler', () => {
      it('should get a workspace', async function () {
        mockWorkspaceService.getSiteWorkspace.resolves(MOCK_WORKSPACE);

        await testApiHandler({
          handler: workspaceRouteWrapper,
          url: `/api/workspace/[workspaceSlug]`,
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isTrue(mockWorkspaceService.getSiteWorkspace.calledOnce);
            assert.strictEqual(res.status, 200);

            const { data } = await res.json();
            assert.strictEqual(data.workspace.name, MOCK_WORKSPACE.name);
            assert.strictEqual(data.workspace.slug, MOCK_WORKSPACE.slug);
          },
        });
      });
    });
    describe('DELETE handler', () => {
      it('should delete a workspace', async function () {
        mockWorkspaceService.deleteWorkspace.resolves(MOCK_WORKSPACE);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: workspaceRouteWrapper,
          url: `/api/workspace/[workspaceSlug]`,
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const config = wrapConfig(_deleteWorkspace(MOCK_WORKSPACE.slug));
            const res = await fetch(config);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isTrue(mockWorkspaceService.deleteWorkspace.calledOnce);
            assert.strictEqual(res.status, 200);

            const { data } = await res.json();
            assert.strictEqual(data.workspace.name, MOCK_WORKSPACE.name);
            assert.strictEqual(data.workspace.slug, MOCK_WORKSPACE.slug);
          },
        });
      });
    });
    describe('Authentication', () => {
      it('should return 401 for invalid session', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves('invalid session');

        await testApiHandler({
          handler: workspaceRoute,
          url: `/api/workspace/[workspaceSlug]`,
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspaceStub.calledOnce);
            assert.isFalse(deleteWorkspaceStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });
    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method PATCH', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: workspaceRoute,
          url: `/api/workspace/[workspaceSlug]`,
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericPatch);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspaceStub.calledOnce);
            assert.isFalse(deleteWorkspaceStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET, DELETE');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'PATCH method unsupported');
          },
        });
      });
      it('should return 405 for unsupported method POST', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: workspaceRoute,
          url: `/api/workspace/[workspaceSlug]`,
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspaceStub.calledOnce);
            assert.isFalse(deleteWorkspaceStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET, DELETE');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'POST method unsupported');
          },
        });
      });
      it('should return 405 for unsupported method PUT', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: workspaceRoute,
          url: `/api/workspace/[workspaceSlug]`,
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspaceStub.calledOnce);
            assert.isFalse(deleteWorkspaceStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET, DELETE');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'PUT method unsupported');
          },
        });
      });
    });
  });

  context('/api/workspace/[workspaceSlug]/invite', async function () {
    describe('INVITE handler', () => {
      it('should invite users to a workspace', async function () {
        mockWorkspaceService.inviteUsers.resolves({ members: MOCK_MEMBERS, workspace: MOCK_WORKSPACE });
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: inviteUsersRouteWrapper,
          url: '/api/workspace/[workspaceSlug]/invite',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const config = wrapConfig(_createMember({ slug: MOCK_WORKSPACE.slug, members: MOCK_MEMBERS }));
            const res = await fetch(config);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isTrue(mockWorkspaceService.inviteUsers.calledOnce);
            assert.strictEqual(res.status, 200);

            const { data } = await res.json();
            assert.strictEqual(data.members.length, 2);
          },
        });
      });
    });

    describe('Authentication', () => {
      it('should return 401 for invalid session', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves('invalid session');

        await testApiHandler({
          handler: createWorkspaceRoute,
          url: '/api/workspace/[workspaceSlug]/invite',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(createWorkspaceStub.calledOnce);
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
          handler: createWorkspaceRoute,
          url: '/api/workspace/[workspaceSlug]/invite',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(createWorkspaceStub.calledOnce);
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
          handler: createWorkspaceRoute,
          url: '/api/workspace',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(createWorkspaceStub.calledOnce);
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
          handler: createWorkspaceRoute,
          url: '/api/workspace',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(createWorkspaceStub.calledOnce);
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
  //   context('/api/workspace/[workspaceSlug]/isTeamOwner', async function () {
  //     describe('IS TEAM OWNER handler', () => {
  //       it('should check if member is a team to a workspace', async function () {
  //         mockWorkspaceService.inviteUsers.resolves({ members: MOCK_MEMBERS, workspace: MOCK_WORKSPACE });
  //         formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
  //         mockActivityLogService.createLog.resolves();

  //         await testApiHandler({
  //           handler: inviteUsersRouteWrapper,
  //           url: '/api/workspace/[workspaceSlug]/invite',
  //           params: { workspaceSlug: MOCK_WORKSPACE.slug },
  //           test: async ({ fetch }) => {
  //             const config = wrapConfig(_createMember({ slug: MOCK_WORKSPACE.slug, members: MOCK_MEMBERS }));
  //             const res = await fetch(config);
  //             assert.strictEqual(res.status, 200);
  //           },
  //         });
  //       });
  //     });

  //     describe('Authentication', () => {
  //       it('should return 401 for invalid session', async () => {
  //         initializerStub.init.resolves();
  //         validateSessionStub.resolves('invalid session');

  //         await testApiHandler({
  //           handler: createWorkspaceRoute,
  //           url: '/api/workspace/[workspaceSlug]/invite',
  //           params: { workspaceSlug: MOCK_WORKSPACE.slug },
  //           test: async ({ fetch }) => {
  //             const res = await fetch(genericGet);
  //             assert.isTrue(initializerStub.init.calledOnce);
  //             assert.isTrue(validateSessionStub.calledOnce);
  //             assert.isFalse(createWorkspaceStub.calledOnce);
  //             assert.strictEqual(res.status, 401);
  //           },
  //         });
  //       });
  //     });

  //     describe('Unsupported Methods', () => {
  //       it('should return 405 for unsupported method GET', async () => {
  //         initializerStub.init.resolves();
  //         validateSessionStub.resolves(MOCK_SESSION);

  //         await testApiHandler({
  //           handler: createWorkspaceRoute,
  //           url: '/api/workspace/[workspaceSlug]/invite',
  //           params: { workspaceSlug: MOCK_WORKSPACE.slug },
  //           test: async ({ fetch }) => {
  //             const res = await fetch(genericGet);
  //             assert.isTrue(initializerStub.init.calledOnce);
  //             assert.isTrue(validateSessionStub.calledOnce);
  //             assert.isFalse(createWorkspaceStub.calledOnce);
  //             assert.strictEqual(res.headers.get('allow'), 'POST');
  //             assert.strictEqual(res.status, 405);
  //             assert.strictEqual(res.statusText, 'Method Not Allowed');

  //             const data = await res.json();
  //             assert.strictEqual(data.error, 'GET method unsupported');
  //           },
  //         });
  //       });

  //       it('should return 405 for unsupported method PUT', async () => {
  //         initializerStub.init.resolves();
  //         validateSessionStub.resolves(MOCK_SESSION);

  //         await testApiHandler({
  //           handler: createWorkspaceRoute,
  //           url: '/api/workspace',
  //           test: async ({ fetch }) => {
  //             const res = await fetch(genericPut);
  //             assert.isTrue(initializerStub.init.calledOnce);
  //             assert.isTrue(validateSessionStub.calledOnce);
  //             assert.isFalse(createWorkspaceStub.calledOnce);
  //             assert.strictEqual(res.headers.get('allow'), 'POST');
  //             assert.strictEqual(res.status, 405);
  //             assert.strictEqual(res.statusText, 'Method Not Allowed');

  //             const data = await res.json();
  //             assert.strictEqual(data.error, 'PUT method unsupported');
  //           },
  //         });
  //       });

  //       it('should return 405 for unsupported method DELETE', async () => {
  //         initializerStub.init.resolves();
  //         validateSessionStub.resolves(MOCK_SESSION);

  //         await testApiHandler({
  //           handler: createWorkspaceRoute,
  //           url: '/api/workspace',
  //           test: async ({ fetch }) => {
  //             const res = await fetch(genericDelete);
  //             assert.isTrue(initializerStub.init.calledOnce);
  //             assert.isTrue(validateSessionStub.calledOnce);
  //             assert.isFalse(createWorkspaceStub.calledOnce);
  //             assert.strictEqual(res.headers.get('allow'), 'POST');
  //             assert.strictEqual(res.status, 405);
  //             assert.strictEqual(res.statusText, 'Method Not Allowed');

  //             const data = await res.json();
  //             assert.strictEqual(data.error, 'DELETE method unsupported');
  //           },
  //         });
  //       });
  //     });
  //   });

  //   context('/api/workspace/email', async function () {
  //     describe('PUT handler', () => {
  //       it('should update user email', async function () {
  //         validateUpdateEmailStub.resolves();
  //         mockWorkspaceService.updateEmail.resolves(MOCK_WORKSPACE);
  //         formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
  //         mockActivityLogService.createLog.resolves();

  //         await testApiHandler({
  //           handler: updateEmailRouteWrapper,
  //           url: '/api/workspace/email',
  //           test: async ({ fetch }) => {
  //             const config = wrapConfig(_updateUserEmail(MOCK_WORKSPACE.email));
  //             const res = await fetch(config);
  //             assert.strictEqual(res.status, 200);
  //           },
  //         });
  //       });
  //     });
  //     describe('Authentication', () => {
  //       it('should return 401 for invalid session', async () => {
  //         initializerStub.init.resolves();
  //         validateSessionStub.resolves('invalid session');

  //         await testApiHandler({
  //           handler: createWorkspaceRoute,
  //           url: '/api/workspace/email',
  //           test: async ({ fetch }) => {
  //             const res = await fetch(genericGet);
  //             assert.isTrue(initializerStub.init.calledOnce);
  //             assert.isTrue(validateSessionStub.calledOnce);
  //             assert.isFalse(createWorkspaceStub.calledOnce);
  //             assert.strictEqual(res.status, 401);
  //           },
  //         });
  //       });
  //     });
  //     describe('Unsupported Methods', () => {
  //       it('should return 405 for unsupported method GET', async () => {
  //         initializerStub.init.resolves();
  //         validateSessionStub.resolves(MOCK_SESSION);

  //         await testApiHandler({
  //           handler: updateEmailRoute,
  //           url: '/api/workspace/email',
  //           test: async ({ fetch }) => {
  //             const res = await fetch(genericGet);
  //             assert.isTrue(initializerStub.init.calledOnce);
  //             assert.isTrue(validateSessionStub.calledOnce);
  //             assert.isFalse(updateEmailStub.calledOnce);
  //             assert.strictEqual(res.headers.get('allow'), 'PUT');
  //             assert.strictEqual(res.status, 405);
  //             assert.strictEqual(res.statusText, 'Method Not Allowed');

  //             const data = await res.json();
  //             assert.strictEqual(data.error, 'GET method unsupported');
  //           },
  //         });
  //       });

  //       it('should return 405 for unsupported method POST', async () => {
  //         initializerStub.init.resolves();
  //         validateSessionStub.resolves(MOCK_SESSION);

  //         await testApiHandler({
  //           handler: updateEmailRoute,
  //           url: '/api/workspace/email',
  //           test: async ({ fetch }) => {
  //             const res = await fetch(genericPost);
  //             assert.isTrue(initializerStub.init.calledOnce);
  //             assert.isTrue(validateSessionStub.calledOnce);
  //             assert.isFalse(updateEmailStub.calledOnce);
  //             assert.strictEqual(res.headers.get('allow'), 'PUT');
  //             assert.strictEqual(res.status, 405);
  //             assert.strictEqual(res.statusText, 'Method Not Allowed');

  //             const data = await res.json();
  //             assert.strictEqual(data.error, 'POST method unsupported');
  //           },
  //         });
  //       });

  //       it('should return 405 for unsupported method DELETE', async () => {
  //         initializerStub.init.resolves();
  //         validateSessionStub.resolves(MOCK_SESSION);

  //         await testApiHandler({
  //           handler: updateEmailRoute,
  //           url: '/api/workspace/email',
  //           test: async ({ fetch }) => {
  //             const res = await fetch(genericDelete);
  //             assert.isTrue(initializerStub.init.calledOnce);
  //             assert.isTrue(validateSessionStub.calledOnce);
  //             assert.isFalse(updateEmailStub.calledOnce);
  //             assert.strictEqual(res.headers.get('allow'), 'PUT');
  //             assert.strictEqual(res.status, 405);
  //             assert.strictEqual(res.statusText, 'Method Not Allowed');

  //             const data = await res.json();
  //             assert.strictEqual(data.error, 'DELETE method unsupported');
  //           },
  //         });
  //       });
  //     });
  //   });
});
