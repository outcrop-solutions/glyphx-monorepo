import 'mocha';
import {assert} from 'chai';
import {Session} from 'next-auth';

import {createSandbox} from 'sinon';
// where the magic happens
import * as proxyquireType from 'proxyquire';
const proxyquire = proxyquireType.noCallThru();
import {testApiHandler} from 'next-test-api-route-handler';
import {_createModel} from 'lib/client/mutations/core';
import {wrapConfig} from './utilities/wrapConfig';
import {genericDelete, genericGet, genericPut} from './utilities/genericReqs';
import {Types as mongooseTypes} from 'mongoose';
import {databaseTypes, webTypes, fileIngestionTypes} from 'types';

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
  tags: [],
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

const MOCK_PAYLOAD_HASH = '2d6518de3ae5b3dc477e44759a64a22c';
const MOCK_FILESYSTEM_HASH = 'cde4d74582624873915e646f34ec588c';
const MOCK_SDT_FILENAME = '2d6518de3ae5b3dc477e44759a64a22c.sdt';
const MOCK_SGN_FILENAME = '2d6518de3ae5b3dc477e44759a64a22c.sgn';
const MOCK_SGC_FILENAME = '2d6518de3ae5b3dc477e44759a64a22c.sgc';

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

const MOCK_STATE: databaseTypes.IState = {
  _id: new mongooseTypes.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: MOCK_USER,
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
  fileSystem: [],
  workspace: {
    _id: new mongooseTypes.ObjectId(),
  } as unknown as databaseTypes.IWorkspace,
  project: {
    _id: new mongooseTypes.ObjectId(),
  } as unknown as databaseTypes.IProject,
  fileSystemHash: MOCK_FILESYSTEM_HASH,
  payloadHash: MOCK_PAYLOAD_HASH,
  name: 'mockState1',
  static: true,
  version: 0,
  aspectRatio: {
    height: 300,
    width: 300,
  },
  camera: {
    pos: {
      x: 0,
      y: 0,
      z: 0,
    },
    dir: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  rowIds: [],
};

describe('GLYPH ENGINE ROUTE', () => {
  const sandbox = createSandbox();
  // glyph engine stubs
  let glyphEngineRoute;
  let glyphEngineRouteWrapper;
  let glyphEngine;
  let glyphEngineStub;

  // route stubs
  let validateSessionStub;
  let initializerStub;

  // handler stubs
  let formatUserAgentStub;
  let generateFilterQueryStub;
  let isValidPayloadStub;

  // mock services
  let mockProcessTrackingService;
  let mockProjectService;
  let mockStateService;
  let mockGlyphEngine;
  let mockActivityLogService;
  let mockGeneralPurposeFunctions;

  beforeEach(() => {
    // route stubs
    validateSessionStub = sandbox.stub();
    validateSessionStub.resolves(MOCK_SESSION);
    initializerStub = {init: sandbox.stub(), initedField: false};
    initializerStub.init.resolves();

    //   handler stubs
    glyphEngineStub = sandbox.stub();
    formatUserAgentStub = sandbox.stub();
    generateFilterQueryStub = sandbox.stub();
    isValidPayloadStub = sandbox.stub();

    //   mock services
    mockProjectService = {addStates: sandbox.stub(), updateProjectState: sandbox.stub()};
    mockGlyphEngine = {init: sandbox.stub(), process: sandbox.stub()};
    mockProcessTrackingService = {createProcessTracking: sandbox.stub()};
    mockStateService = {createState: sandbox.stub()};
    mockGeneralPurposeFunctions = {createProcessTracking: sandbox.stub(), getProcessId: sandbox.stub()};
    mockActivityLogService = {createLog: sandbox.stub()};

    /******************** ROUTE /api/workspace/team/role ********************/
    // replace handler import resolution
    glyphEngine = proxyquire.load('../lib/server/etl/glyphEngine', {
      business: {
        processTrackingService: mockProcessTrackingService,
        projectService: mockProjectService,
        activityLogService: mockActivityLogService,
        stateService: mockStateService,
      },
      glyphengine: {
        GlyphEngine: mockGlyphEngine,
      },
      core: {
        generalPursposeFunctions: mockGeneralPurposeFunctions,
      },
      'lib/utils/formatUserAgent': {
        formatUserAgent: formatUserAgentStub,
      },
      'lib/client/helpers': {
        generateFilterQuery: generateFilterQueryStub,
      },
      'lib/utils/isValidPayload': {
        isValidPayload: isValidPayloadStub,
      },
    }).glyphEngine;

    // swap overridden import into handler to be able to call
    glyphEngineRouteWrapper = proxyquire('../pages/api/etl/glyphengine', {
      business: {
        validateSession: validateSessionStub,
      },
      'lib/server/etl/glyphEngine': {
        glyphEngine: glyphEngine,
      },
    });

    // for testing routing at api/workspace
    glyphEngineRoute = proxyquire('../pages/api/etl/glyphengine', {
      business: {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/etl/glyphEngine': {
        glyphEngine: glyphEngineStub,
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('/api/etl/glyphengine', async () => {
    describe('GlyphEngine handler', () => {
      it('should run glyph engine', async () => {
        isValidPayloadStub.resolves(true);

        mockGeneralPurposeFunctions.getProcessId.returns(new mongooseTypes.ObjectId());
        mockGeneralPurposeFunctions.createProcessTracking.resolves();

        mockGlyphEngine.init.resolves();
        mockGlyphEngine.process.resolves({
          sdtFileName: MOCK_SDT_FILENAME,
          sgnFileName: MOCK_SGN_FILENAME,
          sgcFileName: MOCK_SGC_FILENAME,
        });

        mockProjectService.updateProjectState.resolves(MOCK_PROJECT);
        mockStateService.createState.resolves(MOCK_STATE);
        mockProjectService.addStates.resolves();

        formatUserAgentStub.returns({agentData: MOCK_USER_AGENT, location: MOCK_LOCATION});
        mockActivityLogService.createLog.resolves();

        await testApiHandler({
          handler: glyphEngineRouteWrapper,
          url: 'api/etl/glyphengine',
          test: async ({fetch}) => {
            const config = wrapConfig(_createModel(MOCK_PROJECT, false, MOCK_PAYLOAD_HASH));
            const res = await fetch(config);
            assert.strictEqual(res.status, 200);
          },
        });
      });
    });

    describe('Authentication', () => {
      it('should return 401 for invalid session', async () => {
        validateSessionStub.resolves('invalid session');

        await testApiHandler({
          handler: glyphEngineRoute,
          url: 'api/etl/glyphengine',
          test: async ({fetch}) => {
            const res = await fetch(genericGet);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(glyphEngineStub.calledOnce);
            assert.strictEqual(res.status, 401);
          },
        });
      });
    });

    describe('Unsupported Methods', () => {
      it('should return 405 for unsupported method GET', async () => {
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: glyphEngineRoute,
          url: 'api/etl/glyphengine',
          test: async ({fetch}) => {
            const res = await fetch(genericGet);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(glyphEngineStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'POST');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'GET method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method PUT', async () => {
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: glyphEngineRoute,
          url: 'api/etl/glyphengine',
          test: async ({fetch}) => {
            const res = await fetch(genericPut);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(glyphEngineStub.calledOnce);
            assert.strictEqual(res.headers.get('allow'), 'POST');
            assert.strictEqual(res.status, 405);
            assert.strictEqual(res.statusText, 'Method Not Allowed');

            const data = await res.json();
            assert.strictEqual(data.error, 'PUT method unsupported');
          },
        });
      });

      it('should return 405 for unsupported method DELETE', async () => {
        validateSessionStub.resolves(MOCK_SESSION);

        await testApiHandler({
          handler: glyphEngineRoute,
          url: 'api/etl/glyphengine',
          test: async ({fetch}) => {
            const res = await fetch(genericDelete);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(glyphEngineStub.calledOnce);
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
