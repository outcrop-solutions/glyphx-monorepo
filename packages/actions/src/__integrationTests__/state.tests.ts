import 'mocha';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import proxyquire from 'proxyquire';
import {ActionError} from 'core/src/error';

describe('#integrationTests/state', () => {
  const sandbox = createSandbox();
  let stateActions;

  before(async () => {
    let revalidatePathStub = sandbox.stub().resolves();
    let redirectStub = sandbox.stub().resolves();
    let mockSessionStub = sandbox.stub().resolves({
      user: {
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
      },
    });

    stateActions = proxyquire('../state', {
      'next/cache': {revalidatePath: revalidatePathStub},
      'next/navigation': {redirect: redirectStub},
      'next-auth': {getServerSession: mockSessionStub},
    });
  });
  context('#getState', () => {
    it('should create a new project', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await stateActions.getState(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await stateActions.getState(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#createState', () => {
    it('should create a new project', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await stateActions.createState(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await stateActions.createState(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#updateState', () => {
    it('should create a new project', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await stateActions.updateState(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await stateActions.updateState(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#deleteState', () => {
    it('should create a new project', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await stateActions.deleteState(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await stateActions.deleteState(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
});
