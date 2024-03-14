import 'mocha';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import proxyquire from 'proxyquire';
import {ActionError} from 'core/src/error';
import {membershipService, workspaceService} from 'business';
import {databaseTypes} from 'types';

describe('#integrationTests/annotation', () => {
  const sandbox = createSandbox();
  let annotationAction;
  let members;
  let workspace;
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

  before(async () => {
    let revalidatePathStub = sandbox.stub().resolves();
    let redirectStub = sandbox.stub().resolves();
    let mockSessionStub = sandbox.stub().resolves({
      user: mockUser,
    });

    const newMembers = [{email: 'integrationtest@gmail.com', teamRole: databaseTypes.constants.ROLE.MEMBER}];

    workspace = await workspaceService.createWorkspace(
      mockUser?.id,
      mockUser.email as string,
      'Default Workspace',
      'default-workspace'
    );
    await workspaceService.inviteUsers(mockUser.id, mockUser.email, newMembers, workspace.id);

    annotationAction = proxyquire('../annotation', {
      'next/cache': {revalidatePath: revalidatePathStub},
      'next/navigation': {redirect: redirectStub},
      'next-auth': {getServerSession: mockSessionStub},
    });
  });

  after(async () => {
    for (const member of members) {
      await membershipService.remove(member.id);
    }
  });

  context('#getSuggestedMembers', () => {
    it('should get the suggested members for the mentions dropdown', async () => {
      try {
        const projectId = '';
        const query = '';

        await annotationAction.getSuggestedMembers(projectId, query);
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
        const projectId = '';
        const annotations = await annotationAction.getProjectAnnotations(projectId);
        assert.isOk(annotations);
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
        const stateId = '';
        const annotations = await annotationAction.getStateAnnotations(stateId);
        assert.isOk(annotations);
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
        const projectId = '';
        const value = '';

        await annotationAction.createProjectAnnotation(projectId, value);
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
        const stateId = '';
        const value = '';

        await annotationAction.createStateAnnotation(stateId, value);
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
