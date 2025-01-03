import 'mocha';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import proxyquire from 'proxyquire';
import {ActionError} from 'core/src/error';
import {Initializer, dbConnection, projectService, stateService, workspaceService} from 'business';
import {imageHash} from './constants/imageHash';
import {buildStateUrl, getToken} from '../utils/blobStore';
import {del} from '@vercel/blob';

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

    const initialProject = await projectService.createProject(name, workspaceId, mockUser?.id, mockUser?.email);

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
      initialProject,
      mockUser?.id,
      {height: 400, width: 400},
      [] as unknown as string[], // rowIds
      imageHash
    );

    stateId = state.id;

    // we do this because stateService.createState has added to stateHistory
    project = await projectService.getProject(state.project.id);
    if (!project) {
      assert.fail();
    }

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
        const name = 'newStateIntegrationTestName';
        const camera = {
          pos: {
            x: 160.984,
            y: -427.69,
            z: -39.3156,
          },
          dir: {
            x: -0.347585,
            y: 0.923439,
            z: 0.162616,
          },
        };
        const imageHash = 'integrationTestImageHash';
        const aspectRatio = {
          height: 400,
          width: 400,
        };
        const rowIds = [];

        //retval is necessary for frontend effect
        const newProject = await stateActions.createState(name, camera, project, imageHash, aspectRatio, rowIds);

        assert.isOk(newProject);
        // initial state in the before hook, + the one we just created
        assert.strictEqual(newProject.stateHistory.length, 2);

        // clean up blob storage
        const proj = await projectService.getProject(project.id);
        if (proj) {
          for (const s of proj?.stateHistory) {
            await del(buildStateUrl(s.id as string), {
              token: getToken(),
            });
          }
        }
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
        const state = await stateActions.getState(stateId);
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
        const state = await stateActions.getState(stateId);
        assert.isOk(state.deletedAt);
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
