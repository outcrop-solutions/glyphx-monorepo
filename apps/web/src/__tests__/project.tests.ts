import 'mocha';
import { assert } from 'chai';
import { Session } from 'next-auth';
import { createSandbox } from 'sinon';
// where the magic happens
import * as proxyquireType from 'proxyquire';
const proxyquire = proxyquireType.noCallThru();
import { testApiHandler } from 'next-test-api-route-handler';
import { _createDefaultProject, _deleteProject, _updateProjectState } from 'lib/client/mutations/project';
import { wrapConfig } from './utilities/wrapConfig';
import { genericGet, genericPatch } from './utilities/genericReqs';
import { database as databaseTypes, fileIngestion as fileIngestionTypes, web as webTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';
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

const MOCK_WORKSPACE = {
  _id: 'workspaceId',
};
const MOCK_STATE: Omit<
  databaseTypes.IState,
  | 'project'
  | '_id'
  | 'name'
  | 'workspace'
  | 'createdAt'
  | 'updatedAt'
  | 'description'
  | 'fileSystemHash'
  | 'payloadHash'
  | 'fileSystem'
  | 'version'
  | 'static'
  | 'camera'
  | 'createdBy'
> = {
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
};
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

const PROJECT_ID = 'projectId';

const MOCK_PROJECT: databaseTypes.IProject = {
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

describe('PROJECT ROUTES', () => {
  const sandbox = createSandbox();
  // getProject
  let getProjectRouteWrapper;
  let getProject;
  let getProjectStub;

  // createProjectState
  let createProjectRouteWrapper;
  let createProject;
  let createProjectStub;

  // updateProjectState
  let updateProjectStateRouteWrapper;
  let updateProjectState;
  let updateProjectStateStub;

  // deactivate Project
  let deleteProjectRouteWrapper;
  let deleteProject;
  let deleteProjectStub;

  // route stubs
  let validateSessionStub;
  let initializerStub;
  let projectRoute;

  // handler stubs
  let formatUserAgentStub;
  let mockProjectService;
  let mockActivityLogService;

  beforeEach(() => {
    // route stubs
    validateSessionStub = sandbox.stub();
    validateSessionStub.resolves(MOCK_SESSION);
    initializerStub = { init: sandbox.stub(), initedField: false };
    initializerStub.init.resolves();
    getProjectStub = sandbox.stub();
    createProjectStub = sandbox.stub();
    updateProjectStateStub = sandbox.stub();
    deleteProjectStub = sandbox.stub();

    // handler stubs
    formatUserAgentStub = sandbox.stub();
    mockProjectService = {
      createProject: sandbox.stub(),
      getProject: sandbox.stub(),
      updateProjectState: sandbox.stub(),
      deactivate: sandbox.stub(),
    };
    mockActivityLogService = { createLog: sandbox.stub() };

    /************************* GET PROJECT **************************/
    // replace handler import resolution
    getProject = proxyquire.load('../lib/server/project', {
      '@glyphx/business': {
        projectService: mockProjectService,
        activityLogService: mockActivityLogService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).getProject;

    // swap overridden import into handler to be able to call
    getProjectRouteWrapper = proxyquire('../pages/api/project/[projectId]', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/project': {
        getProject: getProject,
      },
    });

    /************************* CREATE PROJECT **************************/
    // replace handler import resolution
    createProject = proxyquire.load('../lib/server/project', {
      '@glyphx/business': {
        projectService: mockProjectService,
        activityLogService: mockActivityLogService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).createProject;

    // swap overridden import into handler to be able to call
    createProjectRouteWrapper = proxyquire('../pages/api/project/[projectId]', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/project': {
        createProject: createProject,
      },
    });

    /************************* UPDATE PROJECT **************************/
    // replace handler import resolution
    updateProjectState = proxyquire.load('../lib/server/project', {
      '@glyphx/business': {
        projectService: mockProjectService,
        activityLogService: mockActivityLogService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).updateProjectState;

    // swap overridden import into handler to be able to call
    updateProjectStateRouteWrapper = proxyquire('../pages/api/project/[projectId]', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/project': {
        updateProjectState: updateProjectState,
      },
    });

    /************************* DELETE PROJECT **************************/
    // replace handler import resolution
    deleteProject = proxyquire.load('../lib/server/project', {
      '@glyphx/business': {
        projectService: mockProjectService,
        activityLogService: mockActivityLogService,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
    }).deleteProject;

    // swap overridden import into handler to be able to call
    deleteProjectRouteWrapper = proxyquire('../pages/api/project/[projectId]', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/project': {
        deleteProject: deleteProject,
      },
    });

    /************************* PROJECT ROUTE **************************/
    projectRoute = proxyquire('../pages/api/project/[projectId]', {
      '@glyphx/business': {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/project': {
        getProject: getProjectStub,
        createProject: createProjectStub,
        updateProjectState: updateProjectStateStub,
        deleteProject: deleteProjectStub,
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('/api/project', async function () {
    describe('GET handler', () => {
      it('should get a project', async function () {
        mockProjectService.getProject.resolves(MOCK_PROJECT);

        await testApiHandler({
          handler: getProjectRouteWrapper,
          url: `/api/project/[projectId]`,
          params: { projectId: PROJECT_ID },
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isTrue(mockProjectService.getProject.calledOnce);
            assert.strictEqual(res.status, 200);

            const { data } = await res.json();
            assert.strictEqual(data.project.name, MOCK_PROJECT.name);
          },
        });
      });
    });
    describe('CREATE handler', () => {
      it('should create a project', async function () {
        mockProjectService.createProject.resolves(MOCK_PROJECT);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: createProjectRouteWrapper,
          url: `/api/project/[projectId]`,
          test: async ({ fetch }) => {
            const config = wrapConfig(_createDefaultProject(MOCK_WORKSPACE._id));
            const res = await fetch(config);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isTrue(mockProjectService.createProject.calledOnce);
            assert.strictEqual(res.status, 200);

            const { data } = await res.json();
            assert.strictEqual(data.name, MOCK_PROJECT.name);
          },
        });
      });
    });
    describe('PUT handler', () => {
      it('should update project state', async function () {
        mockProjectService.updateProjectState.resolves(MOCK_PROJECT);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: updateProjectStateRouteWrapper,
          url: `/api/project/[projectId]`,
          params: { projectId: PROJECT_ID },
          test: async ({ fetch }) => {
            const config = wrapConfig(
              _updateProjectState(
                PROJECT_ID.toString(),
                MOCK_STATE as unknown as Omit<
                  databaseTypes.IState,
                  | 'project'
                  | '_id'
                  | 'createdAt'
                  | 'updatedAt'
                  | 'description'
                  | 'fileSystemHash'
                  | 'payloadHash'
                  | 'fileSystem'
                  | 'version'
                  | 'static'
                  | 'camera'
                  | 'createdBy'
                >
              )
            );
            const res = await fetch(config);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isTrue(mockProjectService.updateProjectState.calledOnce);
            assert.strictEqual(res.status, 200);

            const { data } = await res.json();
            assert.strictEqual(data.project.name, MOCK_PROJECT.name);
          },
        });
      });
    });
    describe('DELETE handler', () => {
      it('should delete a project', async function () {
        mockProjectService.deactivate.resolves(MOCK_PROJECT);
        formatUserAgentStub.returns({ agentData: MOCK_USER_AGENT, location: MOCK_LOCATION });
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: deleteProjectRouteWrapper,
          url: `/api/project/[projectId]`,
          params: { projectId: PROJECT_ID },
          test: async ({ fetch }) => {
            const config = wrapConfig(_deleteProject(PROJECT_ID));
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
          handler: projectRoute,
          url: '/api/project/:id',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(deleteProjectStub.calledOnce);
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
          handler: projectRoute,
          url: '/api/project/:id',
          test: async ({ fetch }) => {
            const res = await fetch(genericPatch);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(deleteProjectStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'GET, POST, PUT, DELETE');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'PATCH method unsupported');
          },
        });
      });
    });
  });
});
