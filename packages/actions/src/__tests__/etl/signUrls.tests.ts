import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import proxyquire from 'proxyquire';
import {projectService, s3Connection} from 'business';
import {databaseTypes} from 'types';
import mongoose from 'mongoose';

describe('#etl/signUrls', () => {
  context('signDataUrls', () => {
    const sandbox = createSandbox();
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
          camera: {id: new mongoose.Types.ObjectId().toString()},
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
    let hashFileSystemStub = sandbox.stub().returns('');
    let hashPayloadStub = sandbox.stub().returns('');
    let oldHashFunctionStub = sandbox.stub().returns('');
    let revalidatePathStub = sandbox.stub().resolves();
    let redirectStub = sandbox.stub().resolves();
    let mockSessionStub = sandbox.stub();

    beforeEach(() => {
      signDataUrls = proxyquire('../../etl/signDataUrls', {
        'next/cache': {revalidatePath: revalidatePathStub},
        'next/navigation': {redirect: redirectStub},
        'next-auth': {getServerSession: mockSessionStub},
        'business/src/util/hashFunctions': {
          hashFileSystem: hashFileSystemStub,
          hashPayload: hashPayloadStub,
          oldHashFunction: oldHashFunctionStub,
        },
      }).signDataUrls;
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('auth', () => {
      it('should return (and not throw) an error if not authorized', async () => {
        try {
          mockSessionStub.resolves(null);
          const retval = await signDataUrls('', true);
          assert.isNotNull(retval.error);
        } catch (err) {
          assert.fail();
        }
      });
    });

    context('lastState', () => {
      it('should retreive the lastState when it does exist', async () => {
        try {
          mockSessionStub.resolves({
            user: mockUser,
          });
          const fileExists = true;
          const isLastState = true;
          const baseUrl = `client/${mockProject.workspace.id}/${mockProject.id}/output/${mockProject.stateHistory[0].payloadHash}`;
          const getProjectStub = sandbox.stub().resolves(mockProject);
          sandbox.replace(projectService, 'getProject', getProjectStub);

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
      it('should throw an error when the lastState does not exist', async () => {
        try {
          try {
            mockSessionStub.resolves({
              user: mockUser,
            });
            const fileExists = false;
            const isLastState = true;
            const baseUrl = `client/${mockProject.workspace.id}/${mockProject.id}/output/${mockProject.stateHistory[0].payloadHash}`;
            const getProjectStub = sandbox.stub().resolves(mockProject);
            sandbox.replace(projectService, 'getProject', getProjectStub);

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
            assert.isNotNull(retval.error);
            assert.strictEqual(retval.error, 'No file found for last state');
          } catch (error) {
            assert.fail();
          }
        } catch (error) {}
      });
    });

    context('newHashFunction', () => {
      it('should retrieve the file at the new hash if it exists', async () => {
        try {
          mockSessionStub.resolves({
            user: mockUser,
          });
          const fileExists = true;
          const isLastState = false;
          const filesystemHash = 'filesystemHashTest';
          const payloadHash = 'payloadHashTest';
          const baseUrl = `client/${mockProject.workspace.id}/${mockProject.id}/output/${payloadHash}`;

          hashFileSystemStub.returns(filesystemHash);
          hashPayloadStub.returns(payloadHash);

          const getProjectStub = sandbox.stub().resolves(mockProject);
          sandbox.replace(projectService, 'getProject', getProjectStub);

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
      it('should throw an error if the new hash does not exist and old hash does not exist', async () => {
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
            fileExists: sandbox.stub().resolves(fileExists), // can't find either file
            getSignedDataUrlPromise: promiseStub,
          };

          sandbox.replaceGetter(s3Connection, 's3Manager', () => s3ManagerStub as any);
          const retval = await signDataUrls(mockProject.id, isLastState);

          assert.isNotNull(retval.error);
          assert.strictEqual(retval.error, 'An unexpected error occurred running sign data urls');
        } catch (error) {
          assert.fail();
        }
      });
    });

    context('oldHashFunction', () => {
      it('should get the urls under the old hashing function if the new one does not exist', async () => {
        try {
          mockSessionStub.resolves({
            user: mockUser,
          });
          const newFileExists = false; // returned both times it is called here
          const oldFileExists = true; // returned both times it is called here
          const isLastState = false;
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
            fileExists: sandbox.stub().onFirstCall().resolves(newFileExists).onSecondCall().resolves(oldFileExists), // can't find either file
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
    });

    context('signUrls', () => {
      it('should return the correct retval shape', async () => {
        try {
        } catch (error) {}
      });
      it('should throw an error if s3Manager fials', async () => {
        try {
        } catch (error) {}
      });
    });

    context('signUploadUrls', () => {
      it('should throw an error when not authorized', async () => {
        try {
          mockSessionStub.resolves({
            user: mockUser,
          });
          const fileExists = true;
          const isLastState = false;
          const filesystemHash = 'filesystemHashTest';
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
      it('should throw an error when S3Manager fails', () => {});
    });
  });
});
