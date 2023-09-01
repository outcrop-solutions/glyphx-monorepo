import 'mocha';
import { assert } from 'chai';

import { createSandbox } from 'sinon';
// where the magic happens
import * as proxyquireType from 'proxyquire';
const proxyquire = proxyquireType.noCallThru();
import { testApiHandler } from 'next-test-api-route-handler';
import { _createModel, _ingestFiles, _getSignedDataUrls, _uploadFile } from 'lib/client/mutations/core';
import { wrapConfig } from './utilities/wrapConfig';
import { genericDelete, genericGet, genericPut } from './utilities/genericReqs';
import { Types as mongooseTypes } from 'mongoose';
import { databaseTypes, webTypes, fileIngestionTypes } from 'types';
import type { PageConfig } from 'next';
import upload, { config } from 'pages/api/etl/upload';
// Respect the Next.js config object if it's exported
const handler: typeof upload & { config?: PageConfig } = upload;
// handler.config = config;

const MOCK_WORKSPACE = {
  _id: new mongooseTypes.ObjectId(),
};

const MOCK_SESSION = {
  user: {
    userId: '645aa1458d6a87808abf59db',
    name: 'James Graham',
    email: 'james@glyphx.co',
  },
  expires: new Date().toISOString(),
} as unknown as Session;

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

const MOCK_ACCEPTED_FILE: ArrayBuffer = new ArrayBuffer(45);

const MOCK_USER_AGENT: databaseTypes.IUserAgent = {
  userAgent: '',
  platform: '',
  appName: '',
  appVersion: '',
  vendor: '',
  language: '',
  cookieEnabled: false,
};
const MOCK_CLEAN_TABLE_NAME: string = 'cleanTableName';
const MOCK_CLEAN_FILE_NAME: string = 'cleanFileName';

const MOCK_KEY: string = `client/${MOCK_WORKSPACE._id.toString()}/${MOCK_PROJECT._id.toString()}/input/${MOCK_CLEAN_TABLE_NAME}/${MOCK_CLEAN_FILE_NAME}.csv`;

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

describe('FILE UPLOAD ROUTE', () => {
  const sandbox = createSandbox();

  // file upload stubs
  let uploadFileRoute;
  let uploadFileRouteWrapper;
  let uploadFile;
  let uploadFileStub;

  // route stubs
  let validateSessionStub;
  let initializerStub;

  // handler stubs
  let formatUserAgentStub;
  let generateFilterQueryStub;

  // mock services
  let mockProcessTrackingService;
  let mockAws;
  let mockS3Manager;
  let mockBasicColumnCleaner;
  let mockStream;

  beforeEach(() => {
    // route stubs
    validateSessionStub = sandbox.stub();
    validateSessionStub.resolves(MOCK_SESSION);
    initializerStub = { init: sandbox.stub(), initedField: false };
    initializerStub.init.resolves();

    //   handler stubs
    uploadFileStub = sandbox.stub();

    //   mock services
    mockBasicColumnCleaner = {
      cleanColumnName: sandbox.stub(),
    };
    mockStream = {
      done: sandbox.stub(),
    };
    mockAws = {
      S3Manager: sandbox.stub(),
    };
    mockS3Manager = {
      inited: true,
      init: sandbox.stub(),
      getObjectStream: sandbox.stub(),
    };

    /******************** ROUTE /api/workspace/team/role ********************/
    // replace handler import resolution
    uploadFile = proxyquire.load('../lib/server/etl/uploadFile', {
      fileingestion: {
        BasicColumnCleaner: mockBasicColumnCleaner,
      },
      core: {
        aws: mockAws,
      },
    }).uploadFile;

    // swap overridden import into handler to be able to call
    uploadFileRouteWrapper = proxyquire('../pages/api/etl/upload', {
      business: {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/etl/uploadFile': {
        uploadFile: uploadFile,
      },
    });

    // for testing routing at api/workspace
    uploadFileRoute = proxyquire('../pages/api/etl/upload', {
      business: {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/etl/uploadFile': {
        uploadFile: uploadFileStub,
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('/api/etl/upload', async function () {
    describe('FILE UPLOAD handler', () => {
      it('should deactivate a user', async function () {
        mockBasicColumnCleaner.cleanColumnName.resolves();
        mockAws.S3Manager.resolves();
        mockS3Manager.init.resolves();
        mockS3Manager.getObjectStream.returns(mockStream);
        mockStream.done.resolves();

        await testApiHandler({
          handler: uploadFileRouteWrapper,
          url: '/api/etl/upload',
          test: async ({ fetch }) => {
            const config = wrapConfig(
              _uploadFile(MOCK_ACCEPTED_FILE, MOCK_KEY, MOCK_WORKSPACE._id.toString(), MOCK_PROJECT._id.toString())
            );
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
          handler: uploadFileRoute,
          url: '/api/etl/upload',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(uploadFileStub.calledOnce);
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
          handler: uploadFileRoute,
          url: '/api/etl/upload',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(uploadFileStub.calledOnce);
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
          handler: uploadFileRoute,
          url: '/api/etl/upload',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(uploadFileStub.calledOnce);
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
          handler: uploadFileRoute,
          url: '/api/etl/upload',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(uploadFileStub.calledOnce);
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
