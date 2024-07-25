import 'mocha';
import { assert } from 'chai';
import { createSandbox } from 'sinon';
import proxyquire from 'proxyquire';
import { projectService, s3Connection, stateService } from 'business';
import { databaseTypes } from 'types';
import mongoose from 'mongoose';

describe('#etl/signDataUrls', () => {
  let sandbox;
  const mockUser = {
    name: 'James Graham',
    email: 'james@glyphx.co',
    image: 'https://lh3.googleusercontent.com/a/AGNmyxa1Uz7q5ojNKT4xGcnlVY3owT9cF0KFEfq4xT8S=s96-c',
    emailVerified: '2023-11-16T23:00:50.985Z',
    updatedAt: '2023-10-02T12:31:26.117Z',
    userCode: 'ce907057fb3a4a9a9f805d8080f4576d',
    customerPayment: [],
    accounts: [],
    createdAt: '2023-05-09T19:38:55.249Z',
    createdWorkspaces: [],
    invitedMembers: [],
    isVerified: false,
    membership: [],
    projects: [],
    sessions: [],
    webhooks: [],
    id: '645aa1458d6a87808abf59db',
    username: 'james',
  };
  const mockProject: databaseTypes.IProject = {
    id: new mongoose.Types.ObjectId().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'testProject',
    description: 'this is a test project',
    sdtPath: 'testsdtpath',
    slug: 'test slug',
    isTemplate: false,
    stateHistory: [
      {
        id: new mongoose.Types.ObjectId().toString(),
        camera: { id: new mongoose.Types.ObjectId().toString() },
        payloadHash: 'payloadHashTest',
      },
    ] as unknown as databaseTypes.IState,
    members: [],
    files: [],
    owner: {
      id: new mongoose.Types.ObjectId().toString(),
      name: 'test user',
    } as unknown as databaseTypes.IUser,
    workspace: {
      id: new mongoose.Types.ObjectId().toString(),
      name: 'test workspace',
      __v: 1,
    } as unknown as databaseTypes.IWorkspace,
    template: {
      id: new mongoose.Types.ObjectId().toString(),
      name: 'test workspace',
    } as unknown as databaseTypes.IProjectTemplate,
    state: {
      id: new mongoose.Types.ObjectId().toString(),
      version: 1,
    } as unknown as databaseTypes.IState,
    viewName: 'test View name',
  } as unknown as databaseTypes.IProject;

  let signDataUrls;
  let hashFileSystemStub;
  let hashPayloadStub;
  let oldHashFunctionStub;
  let revalidatePathStub;
  let redirectStub;
  let mockSessionStub;

  beforeEach(() => {
    sandbox = createSandbox();
    hashFileSystemStub = sandbox.stub().returns('');
    hashPayloadStub = sandbox.stub().returns('');
    oldHashFunctionStub = sandbox.stub().returns('');
    revalidatePathStub = sandbox.stub().resolves();
    redirectStub = sandbox.stub().resolves();
    mockSessionStub = sandbox.stub();

    signDataUrls = proxyquire('../../etl/signDataUrls', {
      'next/cache': { revalidatePath: revalidatePathStub },
      'next/navigation': { redirect: redirectStub },
      'next-auth': { getServerSession: mockSessionStub },
      'business/src/util/hashFunctions': {
        hashFiles: hashFileSystemStub,
        hashPayload: hashPayloadStub,
        oldHashFunction: oldHashFunctionStub,
      },
    }).signDataUrls;
  });

  afterEach(() => {
    sandbox.restore();
  });

  context.only('signDataUrls', () => {
    context('auth', () => {
      it('should return (and not throw) an error if not authorized', async () => {
        try {
          mockSessionStub.resolves(null);
          const retval = await signDataUrls('', true);
          assert.isNotNull(retval.error);
          assert.isTrue(mockSessionStub.calledOnce);
        } catch (err) {
          assert.fail();
        }
      });
    });

    context('pull data from last state', () => {
      // state happy path
      it('should retreive the state when it does exist', async () => {
        try {
          mockSessionStub.resolves({
            user: mockUser,
          });
          const fileExists = true;
          const baseUrl = `client/${mockProject.workspace.id}/${mockProject.id}/output/${mockProject.stateHistory[0].payloadHash}`;
          const getProjectStub = sandbox.stub().resolves(mockProject);
          sandbox.replace(projectService, 'getProject', getProjectStub);

          const getStateStub = sandbox.stub().resolves(mockProject.stateHistory[0]);
          sandbox.replace(stateService, 'getState', getStateStub);

          const s3Stub = sandbox.stub().resolves();
          sandbox.replace(s3Connection, 'init', s3Stub);

          const fileExistStub = sandbox.stub();
          // contorl the retval one level down
          const promiseStub = sandbox
            .stub()
            .onFirstCall()
            .resolves(`${baseUrl}.sdt`)
            .onSecondCall()
            .resolves(`${baseUrl}.sgc`)
            .onThirdCall()
            .resolves(`${baseUrl}.sgn`);

          const s3ManagerStub = {
            fileExists: fileExistStub.resolves(fileExists),
            getSignedDataUrlPromise: promiseStub,
          };

          sandbox.replaceGetter(s3Connection, 's3Manager', () => s3ManagerStub as any);
          const retval = await signDataUrls(mockProject.id, mockProject.stateHistory[0].id);

          assert.isTrue(getProjectStub.calledOnce);
          assert.isTrue(getStateStub.calledOnce);
          assert.isTrue(s3Stub.calledOnce);
          assert.isTrue(fileExistStub.calledOnce);
          assert.isTrue(promiseStub.calledThrice);

          assert.isUndefined(retval.error);
          assert.strictEqual(retval.sdtUrl, `${baseUrl}.sdt`);
          assert.strictEqual(retval.sgcUrl, `${baseUrl}.sgc`);
          assert.strictEqual(retval.sgnUrl, `${baseUrl}.sgn`);
        } catch (error) {
          assert.fail();
        }
      });
      // state not found path
      it('should throw an error when the state does not exist', async () => {
        try {
          try {
            mockSessionStub.resolves({
              user: mockUser,
            });
            const fileExists = false;
            const baseUrl = `client/${mockProject.workspace.id}/${mockProject.id}/output/${mockProject.stateHistory[0].payloadHash}`;
            const getProjectStub = sandbox.stub().resolves(mockProject);
            sandbox.replace(projectService, 'getProject', getProjectStub);

            const getStateStub = sandbox.stub().resolves(false);
            sandbox.replace(stateService, 'getState', getStateStub);

            const s3Stub = sandbox.stub().resolves();
            sandbox.replace(s3Connection, 'init', s3Stub);

            const fileExistStub = sandbox.stub();
            // contorl the retval one level down
            const promiseStub = sandbox
              .stub()
              .onFirstCall()
              .resolves(`${baseUrl}.sdt`)
              .onSecondCall()
              .resolves(`${baseUrl}.sgc`)
              .onThirdCall()
              .resolves(`${baseUrl}.sgn`);
            const s3ManagerStub = {
              fileExists: fileExistStub.resolves(fileExists),
              getSignedDataUrlPromise: promiseStub,
            };

            sandbox.replaceGetter(s3Connection, 's3Manager', () => s3ManagerStub as any);
            const retval = await signDataUrls(mockProject.id, 'invalidStateId');

            assert.isTrue(getProjectStub.calledOnce);
            assert.isTrue(getStateStub.calledOnce);
            assert.isTrue(s3Stub.calledOnce);
            assert.isTrue(fileExistStub.calledOnce);
            assert.isTrue(promiseStub.notCalled);

            assert.isNotNull(retval.error);
            assert.strictEqual(retval.error, 'No file found for state');
          } catch (error) {
            assert.fail();
          }
        } catch (error) { }
      });
      // state error path
      it('should throw an error when the state does not exist', async () => {
        try {
          try {
            mockSessionStub.resolves({
              user: mockUser,
            });
            const fileExists = false;
            const baseUrl = `client/${mockProject.workspace.id}/${mockProject.id}/output/${mockProject.stateHistory[0].payloadHash}`;
            const getProjectStub = sandbox.stub().resolves(mockProject);
            sandbox.replace(projectService, 'getProject', getProjectStub);

            const getStateStub = sandbox.stub().rejects();
            sandbox.replace(stateService, 'getState', getStateStub);

            const s3Stub = sandbox.stub().resolves();
            sandbox.replace(s3Connection, 'init', s3Stub);

            const fileExistStub = sandbox.stub();
            // contorl the retval one level down
            const promiseStub = sandbox
              .stub()
              .onFirstCall()
              .resolves(`${baseUrl}.sdt`)
              .onSecondCall()
              .resolves(`${baseUrl}.sgc`)
              .onThirdCall()
              .resolves(`${baseUrl}.sgn`);
            const s3ManagerStub = {
              fileExists: fileExistStub.resolves(fileExists),
              getSignedDataUrlPromise: promiseStub,
            };

            sandbox.replaceGetter(s3Connection, 's3Manager', () => s3ManagerStub as any);
            const retval = await signDataUrls(mockProject.id, 'invalidStateId');

            assert.isTrue(getProjectStub.calledOnce);
            assert.isTrue(getStateStub.calledOnce);
            assert.isTrue(s3Stub.calledOnce);
            assert.isTrue(fileExistStub.calledOnce);
            assert.isTrue(promiseStub.notCalled);

            assert.isNotNull(retval.error);
            assert.strictEqual(retval.error, 'No state found for stateId');
          } catch (error) {
            assert.fail();
          }
        } catch (error) { }
      });
    });

    context('pull data by calculated hash', () => {
      // new hash happy path
      it('should retrieve the file at the new hash if it exists', async () => {
        try {
          mockSessionStub.resolves({
            user: mockUser,
          });
          const fileExists = true;
          const filesystemHash = 'filesystemHashTest';
          const payloadHash = 'payloadHashTest';
          const baseUrl = `client/${mockProject.workspace.id}/${mockProject.id}/output/${payloadHash}`;

          hashFileSystemStub.returns(filesystemHash);
          hashPayloadStub.returns(payloadHash);

          const getProjectStub = sandbox.stub().resolves(mockProject);
          sandbox.replace(projectService, 'getProject', getProjectStub);

          const s3Stub = sandbox.stub().resolves();
          sandbox.replace(s3Connection, 'init', s3Stub);

          const fileExistStub = sandbox.stub();
          // contorl the retval one level down
          const promiseStub = sandbox
            .stub()
            .onFirstCall()
            .resolves(`${baseUrl}.sdt`)
            .onSecondCall()
            .resolves(`${baseUrl}.sgc`)
            .onThirdCall()
            .resolves(`${baseUrl}.sgn`);
          const s3ManagerStub = {
            fileExists: fileExistStub.resolves(fileExists),
            getSignedDataUrlPromise: promiseStub,
          };

          sandbox.replaceGetter(s3Connection, 's3Manager', () => s3ManagerStub as any);
          const retval = await signDataUrls(mockProject.id);

          assert.isTrue(getProjectStub.calledOnce);
          assert.isTrue(s3Stub.calledOnce);
          assert.isTrue(fileExistStub.calledOnce);
          assert.isTrue(promiseStub.calledThrice);
          assert.isTrue(hashFileSystemStub.calledOnce);
          assert.isTrue(hashPayloadStub.calledOnce);

          assert.isUndefined(retval.error);
          assert.strictEqual(retval.sdtUrl, `${baseUrl}.sdt`);
          assert.strictEqual(retval.sgcUrl, `${baseUrl}.sgc`);
          assert.strictEqual(retval.sgnUrl, `${baseUrl}.sgn`);
        } catch (error) {
          assert.fail();
        }
      });
      // fallback to old path
      it('should get the urls under the old hashing function', async () => {
        try {
          mockSessionStub.resolves({
            user: mockUser,
          });
          const newFileExists = false; // returned both times it is called here
          const oldFileExists = true; // returned both times it is called here
          const filesystemHash = 'filesystemHashTest';
          const payloadHash = 'payloadHashTest';
          const oldPayloadHash = 'oldPayloadHash';
          const baseUrl = `client/${mockProject.workspace.id}/${mockProject.id}/output/${oldPayloadHash}`;

          hashFileSystemStub.returns(filesystemHash);
          hashPayloadStub.returns(payloadHash);
          oldHashFunctionStub.returns(oldPayloadHash);

          const getProjectStub = sandbox.stub().resolves(mockProject);
          sandbox.replace(projectService, 'getProject', getProjectStub);

          const s3Stub = sandbox.stub().resolves();
          sandbox.replace(s3Connection, 'init', s3Stub);

          const fileExistsStub = sandbox.stub();
          // contorl the retval one level down
          const promiseStub = sandbox
            .stub()
            .onFirstCall()
            .resolves(`${baseUrl}.sdt`)
            .onSecondCall()
            .resolves(`${baseUrl}.sgc`)
            .onThirdCall()
            .resolves(`${baseUrl}.sgn`);
          const s3ManagerStub = {
            fileExists: fileExistsStub.onFirstCall().resolves(newFileExists).onSecondCall().resolves(oldFileExists), // can't find either file
            getSignedDataUrlPromise: promiseStub,
          };

          sandbox.replaceGetter(s3Connection, 's3Manager', () => s3ManagerStub as any);
          const retval = await signDataUrls(mockProject.id);

          assert.isTrue(getProjectStub.calledOnce);
          assert.isTrue(s3Stub.calledOnce);
          assert.isTrue(fileExistsStub.calledTwice);
          assert.isTrue(promiseStub.calledThrice);
          assert.isTrue(hashFileSystemStub.calledTwice);
          assert.isTrue(hashPayloadStub.calledOnce);

          assert.isUndefined(retval.error);
          assert.strictEqual(retval.sdtUrl, `${baseUrl}.sdt`);
          assert.strictEqual(retval.sgcUrl, `${baseUrl}.sgc`);
          assert.strictEqual(retval.sgnUrl, `${baseUrl}.sgn`);
        } catch (error) {
          assert.fail();
        }
      });
      // no hash found (error path)
      it('should throw an error if neither new/old hash exists', async () => {
        try {
          mockSessionStub.resolves({
            user: mockUser,
          });
          const fileExists = false; // returned both times it is called here
          const isLastState = false;
          const filesystemHash = 'filesystemHashTest';
          const payloadHash = 'payloadHashTest';
          const oldPayloadHash = 'oldPayloadHash';
          const baseUrl = `client/${mockProject.workspace.id}/${mockProject.id}/output/${payloadHash}`;

          hashFileSystemStub.returns(filesystemHash);
          hashPayloadStub.returns(payloadHash);
          oldHashFunctionStub.returns(oldPayloadHash);

          const getProjectStub = sandbox.stub().resolves(mockProject);
          sandbox.replace(projectService, 'getProject', getProjectStub);

          const s3Stub = sandbox.stub().resolves();
          sandbox.replace(s3Connection, 'init', s3Stub);

          const fileExistStub = sandbox.stub();
          // contorl the retval one level down
          const promiseStub = sandbox
            .stub()
            .onFirstCall()
            .resolves(`${baseUrl}.sdt`)
            .onSecondCall()
            .resolves(`${baseUrl}.sgc`)
            .onThirdCall()
            .resolves(`${baseUrl}.sgn`);
          const s3ManagerStub = {
            fileExists: fileExistStub.resolves(fileExists), // can't find either file
            getSignedDataUrlPromise: promiseStub,
          };

          sandbox.replaceGetter(s3Connection, 's3Manager', () => s3ManagerStub as any);
          const retval = await signDataUrls(mockProject.id, isLastState);

          assert.isTrue(getProjectStub.calledOnce);
          assert.isTrue(s3Stub.calledOnce);

          // these are called once for the new hash, once for the old hash
          assert.isTrue(fileExistStub.calledTwice);
          assert.isTrue(hashFileSystemStub.calledTwice);

          // called once each, first to check new hash, next to check fallback
          assert.isTrue(hashPayloadStub.calledOnce);
          assert.isTrue(oldHashFunctionStub.calledOnce);

          // we never sign urls because none are found
          assert.isTrue(promiseStub.notCalled);

          assert.isNotNull(retval.error);
          assert.strictEqual(retval.error, 'An unexpected error occurred running sign data urls');
        } catch (error) {
          assert.fail();
        }
      });
    });
  });

  context('signUploadUrls', () => {
    it('should sign the upoad urlss', async () => {
      try {
        mockSessionStub.resolves({
          user: mockUser,
        });
        const fileExists = true;
        const isLastState = false;
        const payloadHash = 'payloadHashTest';
        const baseUrl = `client/${mockProject.workspace.id}/${mockProject.id}/output/${payloadHash}`;

        const s3Stub = sandbox.stub().resolves();
        sandbox.replace(s3Connection, 'init', s3Stub);

        // contorl the retval one level down
        const promiseStub = sandbox
          .stub()
          .onFirstCall()
          .resolves(`${baseUrl}.sdt`)
          .onSecondCall()
          .resolves(`${baseUrl}.sgc`)
          .onThirdCall()
          .resolves(`${baseUrl}.sgn`);

        const s3ManagerStub = {
          fileExists: sandbox.stub().resolves(fileExists),
          getSignedDataUrlPromise: promiseStub,
        };

        sandbox.replaceGetter(s3Connection, 's3Manager', () => s3ManagerStub as any);
        const retval = await signDataUrls(mockProject.id, isLastState);

        assert.isUndefined(retval.error);
        assert.strictEqual(retval.sdtUrl, `${baseUrl}.sdt`);
        assert.strictEqual(retval.sgcUrl, `${baseUrl}.sgc`);
        assert.strictEqual(retval.sgnUrl, `${baseUrl}.sgn`);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an error when S3Manager fails', () => { });
  });
});
