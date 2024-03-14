import 'mocha';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import proxyquire from 'proxyquire';
import {ActionError} from 'core/src/error';

describe('#integrationTests/annotation', () => {
  const sandbox = createSandbox();
  let annotationAction;

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

    annotationAction = proxyquire('../annotation', {
      'next/cache': {revalidatePath: revalidatePathStub},
      'next/navigation': {redirect: redirectStub},
      'next-auth': {getServerSession: mockSessionStub},
    });
  });
  context('#getSuggestedMembers', () => {
    it('should get the suggested members for the mentions dropdown', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await annotationAction.getSuggestedMembers(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await annotationAction.getSuggestedMembers(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#getProjectAnnotations', () => {
    it('should get the suggested members for the mentions dropdown', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await annotationAction.getProjectAnnotations(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await annotationAction.getProjectAnnotations(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#getStateAnnotations', () => {
    it('should get the suggested members for the mentions dropdown', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await annotationAction.getStateAnnotations(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await annotationAction.getStateAnnotations(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#createProjectAnnotation', () => {
    it('should get the suggested members for the mentions dropdown', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await annotationAction.createProjectAnnotation(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await annotationAction.createProjectAnnotation(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#createStateAnnotation', () => {
    it('should get the suggested members for the mentions dropdown', async () => {
      try {
        const name = 'newProject';
        const workspaceId = '646fa59785272d19babc2af1';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await annotationAction.createStateAnnotation(name, workspaceId, description, docId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await annotationAction.createStateAnnotation(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
});
