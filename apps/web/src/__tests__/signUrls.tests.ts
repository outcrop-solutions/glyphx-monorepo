import 'mocha';
import { assert } from 'chai';

import { createSandbox } from 'sinon';
// where the magic happens
import * as proxyquireType from 'proxyquire';
const proxyquire = proxyquireType.noCallThru();
import { testApiHandler } from 'next-test-api-route-handler';
import { _createModel, _ingestFiles, _getSignedDataUrls, _uploadFile } from 'lib/client/mutations/core';
import { wrapConfig } from './utilities/wrapConfig';
import { genericDelete, genericGet, genericPost, genericPut } from './utilities/genericReqs';
import { Types as mongooseTypes } from 'mongoose';
import { databaseTypes } from 'types';

const MOCK_SESSION = {
  user: {
    userId: '645aa1458d6a87808abf59db',
    name: 'James Graham',
    email: 'james@glyphx.co',
  },
  expires: new Date().toISOString(),
} as unknown as Session;

const MOCK_WORKSPACE = {
  _id: new mongooseTypes.ObjectId(),
};

const MOCK_PROJECT = {
  _id: new mongooseTypes.ObjectId(),
};

const MOCK_PAYLOAD_HASH = '2d6518de3ae5b3dc477e44759a64a22c';

describe('SIGN URLS ROUTES', () => {
  const sandbox = createSandbox();

  // sign data url stubs
  let signDataUrlsRoute;
  let signDataUrlsRouteWrapper;
  let signDataUrls;
  let signDataUrlsStub;

  // route stubs
  let validateSessionStub;
  let initializerStub;
  let mockAws;
  let mockS3Manager;

  beforeEach(() => {
    // route stubs
    validateSessionStub = sandbox.stub();
    validateSessionStub.resolves(MOCK_SESSION);
    initializerStub = { init: sandbox.stub(), initedField: false };
    initializerStub.init.resolves();

    //   handler stubs
    signDataUrlsStub = sandbox.stub();
    mockAws = {
      S3Manager: sandbox.stub(),
    };
    mockS3Manager = {
      inited: true,
      init: sandbox.stub(),
      getSignedDataUrlPromise: sandbox.stub(),
    };
    /******************** ROUTE /api/workspace/team/role ********************/
    // replace handler import resolution
    signDataUrls = proxyquire.load('../lib/server/etl/signDataUrls', {
      core: {
        aws: mockAws,
      },
    }).signDataUrls;

    // swap overridden import into handler to be able to call
    signDataUrlsRouteWrapper = proxyquire('../pages/api/etl/sign-data-urls', {
      business: {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/etl/signDataUrls': {
        signDataUrls: signDataUrls,
      },
    });

    // for testing routing at api/workspace
    signDataUrlsRoute = proxyquire('../pages/api/etl/sign-data-urls', {
      business: {
        validateSession: validateSessionStub,
        Initializer: initializerStub,
      },
      'lib/server/etl/signDataUrls': {
        signDataUrls: signDataUrlsStub,
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('/api/etl/sign-data-urls', async function () {
    describe('FILE UPLOAD handler', () => {
      it('should upload an accepted file user', async function () {
        await testApiHandler({
          handler: signDataUrlsRouteWrapper,
          url: '/api/etl/sign-data-urls',
          test: async ({ fetch }) => {
            const config = wrapConfig(
              _getSignedDataUrls(MOCK_WORKSPACE._id.toString(), MOCK_PROJECT._id.toString(), MOCK_PAYLOAD_HASH)
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
          handler: signDataUrlsRoute,
          url: '/api/etl/sign-data-urls',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(signDataUrlsStub.calledOnce);
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
          handler: signDataUrlsRoute,
          url: '/api/etl/sign-data-urls',
          test: async ({ fetch }) => {
            const res = await fetch(genericGet);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(signDataUrlsStub.calledOnce);
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
          handler: signDataUrlsRoute,
          url: '/api/etl/sign-data-urls',
          test: async ({ fetch }) => {
            const res = await fetch(genericPut);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(signDataUrlsStub.calledOnce);
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
          handler: signDataUrlsRoute,
          url: '/api/etl/sign-data-urls',
          test: async ({ fetch }) => {
            const res = await fetch(genericDelete);
            assert.isTrue(initializerStub.init.calledOnce);
            assert.isTrue(validateSessionStub.calledOnce);
            assert.isFalse(signDataUrlsStub.calledOnce);
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
