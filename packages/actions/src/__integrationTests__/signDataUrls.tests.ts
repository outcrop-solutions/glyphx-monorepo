import 'mocha';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import proxyquire from 'proxyquire';
import {Initializer, dbConnection, membershipService, projectService, stateService, workspaceService} from 'business';
import {databaseTypes} from 'types';
import {imageHash} from './constants/imageHash';

describe('#integrationTests/signDataUrls', () => {
  const sandbox = createSandbox();
  let signAction;
  let members = [] as unknown as databaseTypes.IMember[];
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

    // create a project
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
    // we do this because stateService.createState has added to stateHistory
    project = await projectService.getProject(state.project.id);
    if (!project) {
      assert.fail();
    }

    if (!state) {
      assert.fail();
    }

    // set up membership to test suggestions
    const newMembers = [{email: 'integrationtest@gmail.com', teamRole: databaseTypes.constants.ROLE.MEMBER}];
    const retval = await workspaceService.inviteUsers(mockUser.id, mockUser.email, newMembers, workspace.id);
    if (retval?.members) {
      for (const member of retval?.members) {
        if (member.id) {
          const mem = await membershipService.updateStatus(
            member.id,
            databaseTypes.constants.INVITATION_STATUS.ACCEPTED
          );
          if (mem) {
            members.push(mem);
          }
        }
      }
    } else {
      assert.fail();
    }

    signAction = proxyquire('../etl/signDataUrls', {
      'next-auth': {getServerSession: mockSessionStub},
    });
  });

  after(async () => {
    await workspaceService.deleteWorkspace(mockUser.id, mockUser.email as string, workspace.id as string);
    // we don't have a service method for this
    await dbConnection.models.ProjectModel.deleteProjectById(project.id);
    for (const member of members) {
      await dbConnection.models.MemberModel.deleteMemberById(member.id as string);
    }
    await dbConnection.models.StateModel.deleteStateById(state.id);
  });
});
