import 'mocha';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import proxyquire from 'proxyquire';
import {ActionError} from 'core/src/error';
import {Initializer, dbConnection, projectService, stateService, workspaceService} from 'business';
import {imageHash} from './constants/imageHash';

describe('#integrationTests/state', () => {
  const sandbox = createSandbox();
  let stateActions;
  let stateId;
  let workspace;
  let project;
  let state;

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

    await Initializer.init();
    workspace = await workspaceService.createWorkspace(
      mockUser?.id,
      mockUser.email as string,
      'Default Workspace',
      'default-workspace'
    );
    if (!workspace) {
      assert.fail();
    }

    // create the project
    const name = 'newProject';
    const workspaceId = workspace.id;

    project = await projectService.createProject(name, workspaceId, mockUser?.id, mockUser?.email);
    if (!project) {
      assert.fail();
    }

    // create a state
    state = await stateService.createState(
      'stateName',
      {
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
      project,
      mockUser?.id,
      {height: 400, width: 400},
      [] as unknown as string[], // rowIds
      imageHash
    );
    if (!state) {
      assert.fail();
    }

    stateActions = proxyquire('../state', {
      'next/cache': {revalidatePath: revalidatePathStub},
      'next/navigation': {redirect: redirectStub},
      'next-auth': {getServerSession: mockSessionStub},
    });
  });

  after(async () => {
    await workspaceService.deleteWorkspace(mockUser.id, mockUser.email as string, workspace.id as string);
    // we don't have a service method for this
    await dbConnection.models.ProjectModel.deleteProjectById(project.id);
    await dbConnection.models.StateModel.deleteStateById(state.id);
  });

  context('#createState', () => {
    it('should create a new state', async () => {
      try {
        const name = 'newProject';
        const camera = {};
        const imageHash = '';
        const aspectRatio = {};
        const rowIds = [];

        const state = await stateActions.createState(name, camera, project, imageHash, aspectRatio, rowIds);
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
  context('#getState', () => {
    it('should get a state', async () => {
      try {
        const state = await stateActions.getState(stateId);
        assert.isOk(state);
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
  context('#updateState', () => {
    it('should update a state', async () => {
      try {
        const name = 'newStateName';
        await stateActions.updateState(stateId, name);
        const state = stateActions.getState(stateId);
        assert.strictEqual(state.name, name);
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
    it('should delete a state', async () => {
      try {
        await stateActions.deleteState(stateId);
        const state = stateActions.getState(stateId);
        assert.isNull(state);
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
