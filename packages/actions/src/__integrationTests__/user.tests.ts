import 'mocha';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import proxyquire from 'proxyquire';
import {ActionError} from 'core/src/error';

describe('#integrationTests/user', () => {
  const sandbox = createSandbox();
  let userActions;

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

    userActions = proxyquire('../user', {
      'next/cache': {revalidatePath: revalidatePathStub},
      'next/navigation': {redirect: redirectStub},
      'next-auth': {getServerSession: mockSessionStub},
    });
  });
  context('#updateUserName', () => {
    it('should create a new project', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await userActions.updateUserName(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await userActions.updateUserName(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#updateUserEmail', () => {
    it('should create a new project', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await userActions.updateUserEmail(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await userActions.updateUserEmail(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#deacivateUser', () => {
    it('should create a new project', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await userActions.deacivateUser(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await userActions.deacivateUser(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
});
