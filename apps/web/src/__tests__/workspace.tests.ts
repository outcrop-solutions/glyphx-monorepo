import 'mocha';
import { assert } from 'chai';

import { createSandbox } from 'sinon';
// where the magic happens
import * as proxyquireType from 'proxyquire';
const proxyquire = proxyquireType.noCallThru();
import { testApiHandler } from 'next-test-api-route-handler';
import {
  _createWorkspace,
  _deleteWorkspace,
  _joinWorkspace,
  _updateWorkspaceName,
  _updateWorkspaceSlug,
} from 'lib/client/mutations/workspace';
import { wrapConfig } from './utilities/wrapConfig';
import { genericDelete, genericGet, genericPatch, genericPost, genericPut } from './utilities/genericReqs';
import { database, database as databaseTypes } from '@glyphx/types';
import mongoose, { Types as mongooseTypes } from 'mongoose';
import { _acceptInvitation, _createMember, _declineInvitation, _removeMember, _updateRole } from 'lib';
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
const MOCK_WORKSPACE_2: databaseTypes.IWorkspace = {
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

const MOCK_WORKSPACES = [MOCK_WORKSPACE, MOCK_WORKSPACE_2];

const MOCK_MEMBER_1: databaseTypes.IMember = {
  _id: 'mockMemberId1' as unknown as mongooseTypes.ObjectId,
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

  // is team owner?
  let isTeamOwnerRoute;
  let isTeamOwnerRouteWrapper;
  let isTeamOwner;
  let isTeamOwnerStub;

  // get memebrs
  let getMembersRoute;
  let getMembersRouteWrapper;
  let getMembers;
  let getMembersStub;

  // update workspace name
  let updateWorkspaceNameRoute;
  let updateWorkspaceNameRouteWrapper;
  let updateWorkspaceName;
  let updateWorkspaceNameStub;

  // update workspace slug
  let updateWorkspaceSlugRoute;
  let updateWorkspaceSlugRouteWrapper;
  let updateWorkspaceSlug;
  let updateWorkspaceSlugStub;

  // accept workspace invitations
  let acceptInvitationRoute;
  let acceptInvitationRouteWrapper;
  let acceptInvitation;
  let acceptInvitationStub;

  // decline workspace invitations
  let declineInvitationRoute;
  let declineInvitationRouteWrapper;
  let declineInvitation;
  let declineInvitationStub;

  // join workspace
  let joinWorkspaceRoute;
  let joinWorkspaceRouteWrapper;
  let joinWorkspace;
  let joinWorkspaceStub;

  // remove member from workspace
  let removeMemberRoute;
  let removeMemberRouteWrapper;
  let removeMember;
  let removeMemberStub;

  // update role for member in workspace
  let updateRoleRoute;
  let updateRoleRouteWrapper;
  let updateRole;
  let updateRoleStub;

  // getWorkspaces for dashboard
  let getWorkspacesRoute;
  let getWorkspacesRouteWrapper;
  let getWorkspaces;
  let getWorkspacesStub;

  // getPendingInvitations for dashboard
  let getPendingInvitationsRoute;
  let getPendingInvitationsRouteWrapper;
  let getPendingInvitations;
  let getPendingInvitationsStub;

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
    inviteUsersStub = sandbox.stub();
    isTeamOwnerStub = sandbox.stub();
    getMembersStub = sandbox.stub();
    updateWorkspaceNameStub = sandbox.stub();
    updateWorkspaceSlugStub = sandbox.stub();
    acceptInvitationStub = sandbox.stub();
    declineInvitationStub = sandbox.stub();
    joinWorkspaceStub = sandbox.stub();
    removeMemberStub = sandbox.stub();
    updateRoleStub = sandbox.stub();
    deleteWorkspaceStub = sandbox.stub();
    getWorkspacesStub = sandbox.stub();
    getPendingInvitationsStub = sandbox.stub();

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
      updateRole: sandbox.stub(),
      updateStatus: sandbox.stub(),
    };

    mockActivityLogService = { createLog: sandbox.stub() };

    /******************** ROUTE /api/workspace ********************/
    // replace handler import resolution
    createWorkspace = proxyquire.load('../lib/server/workspace', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
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
        membershipService: mockMembershipService,
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
        membershipService: mockMembershipService,
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
        membershipService: mockMembershipService,
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

    /******************** ROUTE /api/workspace/[workspaceSlug]/isTeamOwner ********************/
    // replace handler import resolution
    isTeamOwner = proxyquire.load('../lib/server/workspace', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
        validateUpdateWorkspaceSlug: validateUpdateWorkspaceSlugStub,
        validateUpdateWorkspaceName: validateUpdateWorkspaceNameStub,
        validateCreateWorkspace: validateCreateWorkspaceStub,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).isTeamOwner;

    // swap overridden import into handler to be able to call
    isTeamOwnerRouteWrapper = proxyquire('../pages/api/workspace/[workspaceSlug]/isTeamOwner', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        isTeamOwner: isTeamOwner,
      },
    });

    // for testing routing at api/workspace
    isTeamOwnerRoute = proxyquire('../pages/api/workspace/[workspaceSlug]/isTeamOwner', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        isTeamOwner: isTeamOwnerStub,
      },
    });
    /******************** ROUTE /api/workspace/[workspaceSlug]/getMembers ********************/
    // replace handler import resolution
    getMembers = proxyquire.load('../lib/server/workspace', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
        validateUpdateWorkspaceSlug: validateUpdateWorkspaceSlugStub,
        validateUpdateWorkspaceName: validateUpdateWorkspaceNameStub,
        validateCreateWorkspace: validateCreateWorkspaceStub,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).getMembers;

    // swap overridden import into handler to be able to call
    getMembersRouteWrapper = proxyquire('../pages/api/workspace/[workspaceSlug]/members', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        getMembers: getMembers,
      },
    });

    // for testing routing at api/workspace
    getMembersRoute = proxyquire('../pages/api/workspace/[workspaceSlug]/members', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        getMembers: getMembersStub,
      },
    });
    /******************** ROUTE /api/workspace/[workspaceSlug]/name ********************/
    // replace handler import resolution
    updateWorkspaceName = proxyquire.load('../lib/server/workspace', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
        validateUpdateWorkspaceSlug: validateUpdateWorkspaceSlugStub,
        validateUpdateWorkspaceName: validateUpdateWorkspaceNameStub,
        validateCreateWorkspace: validateCreateWorkspaceStub,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).updateWorkspaceName;

    // swap overridden import into handler to be able to call
    updateWorkspaceNameRouteWrapper = proxyquire('../pages/api/workspace/[workspaceSlug]/name', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        updateWorkspaceName: updateWorkspaceName,
      },
    });

    // for testing routing at api/workspace
    updateWorkspaceNameRoute = proxyquire('../pages/api/workspace/[workspaceSlug]/name', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        updateWorkspaceName: updateWorkspaceNameStub,
      },
    });
    /******************** ROUTE /api/workspace/[workspaceSlug]/slug ********************/
    // replace handler import resolution
    updateWorkspaceSlug = proxyquire.load('../lib/server/workspace', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
        validateUpdateWorkspaceSlug: validateUpdateWorkspaceSlugStub,
        validateUpdateWorkspaceName: validateUpdateWorkspaceNameStub,
        validateCreateWorkspace: validateCreateWorkspaceStub,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).updateWorkspaceSlug;

    // swap overridden import into handler to be able to call
    updateWorkspaceSlugRouteWrapper = proxyquire('../pages/api/workspace/[workspaceSlug]/slug', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        updateWorkspaceSlug: updateWorkspaceSlug,
      },
    });

    // for testing routing at api/workspace
    updateWorkspaceSlugRoute = proxyquire('../pages/api/workspace/[workspaceSlug]/slug', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspace': {
        updateWorkspaceSlug: updateWorkspaceSlugStub,
      },
    });
    /******************** ROUTE /api/workspace/team/accept ********************/
    // replace handler import resolution
    acceptInvitation = proxyquire.load('../lib/server/team', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).acceptInvitation;

    // swap overridden import into handler to be able to call
    acceptInvitationRouteWrapper = proxyquire('../pages/api/workspace/team/accept', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/team': {
        acceptInvitation: acceptInvitation,
      },
    });

    // for testing routing at api/workspace
    acceptInvitationRoute = proxyquire('../pages/api/workspace/team/accept', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/team': {
        acceptInvitation: acceptInvitationStub,
      },
    });
    /******************** ROUTE /api/workspace/team/decline ********************/
    // replace handler import resolution
    declineInvitation = proxyquire.load('../lib/server/team', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).declineInvitation;

    // swap overridden import into handler to be able to call
    declineInvitationRouteWrapper = proxyquire('../pages/api/workspace/team/decline', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/team': {
        declineInvitation: declineInvitation,
      },
    });

    // for testing routing at api/workspace
    declineInvitationRoute = proxyquire('../pages/api/workspace/team/decline', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/team': {
        declineInvitation: declineInvitationStub,
      },
    });
    /******************** ROUTE /api/workspace/team/join ********************/
    // replace handler import resolution
    joinWorkspace = proxyquire.load('../lib/server/team', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).joinWorkspace;

    // swap overridden import into handler to be able to call
    joinWorkspaceRouteWrapper = proxyquire('../pages/api/workspace/team/join', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/team': {
        joinWorkspace: joinWorkspace,
      },
    });

    // for testing routing at api/workspace
    joinWorkspaceRoute = proxyquire('../pages/api/workspace/team/join', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/team': {
        joinWorkspace: joinWorkspaceStub,
      },
    });
    /******************** ROUTE /api/workspace/team/member ********************/
    // replace handler import resolution
    removeMember = proxyquire.load('../lib/server/team', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).removeMember;

    // swap overridden import into handler to be able to call
    removeMemberRouteWrapper = proxyquire('../pages/api/workspace/team/member', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/team': {
        removeMember: removeMember,
      },
    });

    // for testing routing at api/workspace
    removeMemberRoute = proxyquire('../pages/api/workspace/team/member', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/team': {
        removeMember: removeMemberStub,
      },
    });

    /******************** ROUTE /api/workspace/team/role ********************/
    // replace handler import resolution
    updateRole = proxyquire.load('../lib/server/team', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).updateRole;

    // swap overridden import into handler to be able to call
    updateRoleRouteWrapper = proxyquire('../pages/api/workspace/team/role', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/team': {
        updateRole: updateRole,
      },
    });

    // for testing routing at api/workspace
    updateRoleRoute = proxyquire('../pages/api/workspace/team/role', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/team': {
        updateRole: updateRoleStub,
      },
    });
    /******************** ROUTE /api/workspaces ********************/
    // replace handler import resolution
    getWorkspaces = proxyquire.load('../lib/server/workspaces', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).getWorkspaces;

    // swap overridden import into handler to be able to call
    getWorkspacesRouteWrapper = proxyquire('../pages/api/workspaces', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspaces': {
        getWorkspaces: getWorkspaces,
      },
    });

    // for testing routing at api/workspace
    getWorkspacesRoute = proxyquire('../pages/api/workspaces', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspaces': {
        getWorkspaces: getWorkspacesStub,
      },
    });
    /******************** ROUTE /api/workspaces/invitations ********************/
    // replace handler import resolution
    getPendingInvitations = proxyquire.load('../lib/server/workspaces', {
      '@glyphx/business': {
        workspaceService: mockWorkspaceService,
        activityLogService: mockActivityLogService,
        membershipService: mockMembershipService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).getPendingInvitations;

    // swap overridden import into handler to be able to call
    getPendingInvitationsRouteWrapper = proxyquire('../pages/api/workspaces/invitations', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspaces': {
        getPendingInvitations: getPendingInvitations,
      },
    });

    // for testing routing at api/workspace
    getPendingInvitationsRoute = proxyquire('../pages/api/workspaces/invitations', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/workspaces': {
        getPendingInvitations: getPendingInvitationsStub,
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
          handler: inviteUsersRoute,
          url: '/api/workspace/[workspaceSlug]/invite',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(inviteUsersStub.calledOnce);
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
          handler: inviteUsersRoute,
          url: '/api/workspace/[workspaceSlug]/invite',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(inviteUsersStub.calledOnce);
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
          handler: inviteUsersRoute,
          url: '/api/workspace',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(inviteUsersStub.calledOnce);
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
          handler: inviteUsersRoute,
          url: '/api/workspace',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(inviteUsersStub.calledOnce);
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

  context('/api/workspace/[workspaceSlug]/isTeamOwner', async function () {
    describe('IS TEAM OWNER handler', () => {
      it('should check if member is a team to a workspace', async function () {
        mockWorkspaceService.getWorkspace.resolves(MOCK_WORKSPACE);
        mockWorkspaceService.isWorkspaceOwner.resolves(true);

        await testApiHandler({
          handler: isTeamOwnerRouteWrapper,
          url: '/api/workspace/[workspaceSlug]/isTeamOwner',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
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
          handler: isTeamOwnerRoute,
          url: '/api/workspace/[workspaceSlug]/isTeamOwner',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(isTeamOwnerStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method POST', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);
        // isTeamOwnerStub.resolves();

        await testApiHandler({
          handler: isTeamOwnerRoute,
          url: '/api/workspace/[workspaceSlug]/isTeamOwner',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(isTeamOwnerStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
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
          handler: isTeamOwnerRoute,
          url: '/api/workspace/[workspaceSlug]/isTeamOwner',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(isTeamOwnerStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
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
          handler: isTeamOwnerRoute,
          url: '/api/workspace/[workspaceSlug]/isTeamOwner',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(isTeamOwnerStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'DELETE method unsupported');
          },
        });
      });
    });
  });

  context('/api/workspace/[workspaceSlug]/members', async function () {
    describe('MEMBERS handler', () => {
      it('should get members for a workspace', async function () {
        mockMembershipService.getMembers.resolves(MOCK_MEMBERS);

        await testApiHandler({
          handler: getMembersRouteWrapper,
          url: '/api/workspace/[workspaceSlug]/members',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
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
          handler: getMembersRoute,
          url: '/api/workspace/[workspaceSlug]/members',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getMembersStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method POST', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: getMembersRoute,
          url: '/api/workspace/[workspaceSlug]/members',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getMembersStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
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
          handler: getMembersRoute,
          url: '/api/workspace/[workspaceSlug]/members',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getMembersStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
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
          handler: getMembersRoute,
          url: '/api/workspace/[workspaceSlug]/members',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getMembersStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'DELETE method unsupported');
          },
        });
      });
    });
  });

  context('/api/workspace/[workspaceSlug]/name', async function () {
    describe('CHANGE WORKSPACE NAME handler', () => {
      it('should update name for a workspace', async function () {
        validateUpdateWorkspaceNameStub.resolves();
        mockWorkspaceService.updateWorkspaceName.resolves(MOCK_WORKSPACE);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: updateWorkspaceNameRouteWrapper,
          url: '/api/workspace/[workspaceSlug]/name',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const config = _updateWorkspaceName({ slug: MOCK_WORKSPACE.slug, name: 'NEW NAME' });
            const res = await fetch(wrapConfig(config));

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
          handler: updateWorkspaceNameRoute,
          url: '/api/workspace/[workspaceSlug]/name',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateWorkspaceNameStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method POST', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: updateWorkspaceNameRoute,
          url: '/api/workspace/[workspaceSlug]/name',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateWorkspaceNameStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'POST method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method GET', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: updateWorkspaceNameRoute,
          url: '/api/workspace/[workspaceSlug]/name',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateWorkspaceNameStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'GET method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method DELETE', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: updateWorkspaceNameRoute,
          url: '/api/workspace/[workspaceSlug]/name',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateWorkspaceNameStub.calledOnce);
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

  context('/api/workspace/[workspaceSlug]/slug', async function () {
    describe('CHANGE WORKSPACE SLUG handler', () => {
      it('should update slug for a workspace', async function () {
        validateUpdateWorkspaceSlugStub.resolves();
        mockWorkspaceService.updateWorkspaceSlug.resolves(MOCK_WORKSPACE);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: updateWorkspaceSlugRouteWrapper,
          url: '/api/workspace/[workspaceSlug]/slug',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const config = _updateWorkspaceSlug({ slug: MOCK_WORKSPACE.slug, newSlug: 'NEW_SLUG' });
            const res = await fetch(wrapConfig(config));

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
          handler: updateWorkspaceSlugRoute,
          url: '/api/workspace/[workspaceSlug]/slug',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateWorkspaceSlugStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method POST', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: updateWorkspaceSlugRoute,
          url: '/api/workspace/[workspaceSlug]/slug',
          params: { workspaceSlug: MOCK_WORKSPACE.slug },
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateWorkspaceSlugStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'POST method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method GET', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: updateWorkspaceSlugRoute,
          url: '/api/workspace/[workspaceSlug]/slug',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateWorkspaceSlugStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'GET method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method DELETE', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: updateWorkspaceSlugRoute,
          url: '/api/workspace/[workspaceSlug]/slug',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateWorkspaceSlugStub.calledOnce);
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

  context('/api/workspace/team/accept', async function () {
    describe('ACCEPT INVITATION handler', () => {
      it('should accept an invitation for a workspace', async function () {
        mockMembershipService.updateStatus.resolves(MOCK_MEMBER_1);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: acceptInvitationRouteWrapper,
          url: '/api/workspace/team/accept',
          test: async ({ fetch }) => {
            const config = _acceptInvitation(MOCK_MEMBER_1._id.toString());
            const res = await fetch(wrapConfig(config));
            assert.strictEqual(res.status, 200);
          },
        });
      });
    });

    describe('Already Inited', () => {
      it('should return 401 for invalid session', async () => {
        initializerStub.inititedField = true;
        validateSessionStub.resolves('invalid session');

        await testApiHandler({
          handler: acceptInvitationRoute,
          url: '/api/workspace/team/accept',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(acceptInvitationStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Authentication', () => {
      it('should return 401 for invalid session', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves('invalid session');

        await testApiHandler({
          handler: acceptInvitationRoute,
          url: '/api/workspace/team/accept',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(acceptInvitationStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method POST', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: acceptInvitationRoute,
          url: '/api/workspace/team/accept',
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(acceptInvitationStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'POST method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method GET', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: acceptInvitationRoute,
          url: '/api/workspace/team/accept',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(acceptInvitationStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'GET method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method DELETE', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: acceptInvitationRoute,
          url: '/api/workspace/team/accept',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(acceptInvitationStub.calledOnce);
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

  context('/api/workspace/team/decline', async function () {
    describe('DECLINE INVITATION handler', () => {
      it('should decline an invitation for a workspace', async function () {
        mockMembershipService.updateStatus.resolves(MOCK_MEMBER_1);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: declineInvitationRouteWrapper,
          url: '/api/workspace/team/decline',
          test: async ({ fetch }) => {
            const config = _declineInvitation(MOCK_MEMBER_1._id.toString());
            const res = await fetch(wrapConfig(config));
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
          handler: declineInvitationRoute,
          url: '/api/workspace/team/decline',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(declineInvitationStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method POST', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: declineInvitationRoute,
          url: '/api/workspace/team/decline',
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(declineInvitationStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'POST method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method GET', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: declineInvitationRoute,
          url: '/api/workspace/team/decline',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(declineInvitationStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'GET method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method DELETE', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: declineInvitationRoute,
          url: '/api/workspace/team/decline',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(declineInvitationStub.calledOnce);
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

  context('/api/workspace/team/join', async function () {
    describe('JOIN WORKSPACE handler', () => {
      it('should join an invitation for a workspace', async function () {
        mockWorkspaceService.joinWorkspace.resolves(MOCK_WORKSPACE);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: joinWorkspaceRouteWrapper,
          url: '/api/workspace/team/join',
          test: async ({ fetch }) => {
            const config = _joinWorkspace(MOCK_WORKSPACE.workspaceCode);
            const res = await fetch(wrapConfig(config));
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
          handler: joinWorkspaceRoute,
          url: '/api/workspace/team/join',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(joinWorkspaceStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method PUT', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: joinWorkspaceRoute,
          url: '/api/workspace/team/join',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(joinWorkspaceStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'POST');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'PUT method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method GET', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: joinWorkspaceRoute,
          url: '/api/workspace/team/join',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(joinWorkspaceStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'POST');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'GET method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method DELETE', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: joinWorkspaceRoute,
          url: '/api/workspace/team/join',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(joinWorkspaceStub.calledOnce);
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

  context('/api/workspace/team/member', async function () {
    describe('REMOVE MEMBER handler', () => {
      it('should remove a member from a workspace', async function () {
        mockMembershipService.remove.resolves(MOCK_MEMBER_1);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: removeMemberRouteWrapper,
          url: '/api/workspace/team/member',
          test: async ({ fetch }) => {
            const config = _removeMember(MOCK_MEMBER_1._id.toString());
            const res = await fetch(wrapConfig(config));
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
          handler: removeMemberRoute,
          url: '/api/workspace/team/member',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(removeMemberStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method PUT', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: removeMemberRoute,
          url: '/api/workspace/team/member',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(removeMemberStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'DELETE');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'PUT method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method GET', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: removeMemberRoute,
          url: '/api/workspace/team/member',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(removeMemberStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'DELETE');
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
          handler: removeMemberRoute,
          url: '/api/workspace/team/member',
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(removeMemberStub.calledOnce);
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

  context('/api/workspace/team/role', async function () {
    describe('UPDATE ROLE handler', () => {
      it('should update a member role in a workspace', async function () {
        mockMembershipService.getMember.resolves(MOCK_MEMBER_1);
        mockMembershipService.updateRole.resolves();
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: updateRoleRouteWrapper,
          url: '/api/workspace/team/role',
          test: async ({ fetch }) => {
            const config = _updateRole(MOCK_MEMBER_1._id.toString(), databaseTypes.constants.ROLE.OWNER);
            const res = await fetch(wrapConfig(config));
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
          handler: updateRoleRoute,
          url: '/api/workspace/team/role',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateRoleStub.calledOnce);
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
          handler: updateRoleRoute,
          url: '/api/workspace/team/role',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateRoleStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'DELETE method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method GET', async () => {
        initializerStub.init.resolves();
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: updateRoleRoute,
          url: '/api/workspace/team/role',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateRoleStub.calledOnce);
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
          handler: updateRoleRoute,
          url: '/api/workspace/team/role',
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(updateRoleStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'PUT');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'POST method unsupported');
          },
        });
      });
    });
  });
  context('/api/workspaces', async function () {
    describe('GET WORKSPACES handler', () => {
      it('should get all workspaces', async function () {
        mockWorkspaceService.getWorkspaces.resolves(MOCK_WORKSPACES);

        await testApiHandler({
          handler: getWorkspacesRouteWrapper,
          url: '/api/workspaces',
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
          handler: getWorkspacesRoute,
          url: '/api/workspaces',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspacesStub.calledOnce);
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
          handler: getWorkspacesRoute,
          url: '/api/workspaces',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspacesStub.calledOnce);
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
          handler: getWorkspacesRoute,
          url: '/api/workspaces',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspacesStub.calledOnce);
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
          handler: getWorkspacesRoute,
          url: '/api/workspaces',
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getWorkspacesStub.calledOnce);
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
  context('/api/workspaces/invitations', async function () {
    describe('GET WORKSPACE INVITATIONS handler', () => {
      it('should get all workspace invitations', async function () {
        mockMembershipService.getPendingInvitations.resolves(MOCK_MEMBERS);

        await testApiHandler({
          handler: getPendingInvitationsRouteWrapper,
          url: '/api/workspaces/invitations',
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
          handler: getPendingInvitationsRoute,
          url: '/api/workspaces/invitations',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getPendingInvitationsStub.calledOnce);
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
          handler: getPendingInvitationsRoute,
          url: '/api/workspaces/invitations',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getPendingInvitationsStub.calledOnce);
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
          handler: getPendingInvitationsRoute,
          url: '/api/workspaces/invitations',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getPendingInvitationsStub.calledOnce);
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
          handler: getPendingInvitationsRoute,
          url: '/api/workspaces/invitations',
          test: async ({ fetch }) => {
            const res = await fetch(genericPost);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(getPendingInvitationsStub.calledOnce);
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
