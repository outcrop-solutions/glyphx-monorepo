import 'mocha';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import proxyquire from 'proxyquire';
import {ActionError} from 'core/src/error';
import {dbConnection, Initializer, projectService, stateService, workspaceService} from 'business';
import {databaseTypes, fileIngestionTypes, glyphEngineTypes} from 'types';

describe('#integrationTests/project', () => {
  const sandbox = createSandbox();
  let projectActions;
  let workspace;
  let project;
  let projectId;
  let workspaceId;

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
    workspaceId = workspace.id;

    project = await projectService.createProject(name, workspaceId, mockUser?.id, mockUser?.email);

    projectId = project.id;

    projectActions = proxyquire('../project', {
      'next/cache': {revalidatePath: revalidatePathStub},
      'next/navigation': {redirect: redirectStub},
      'next-auth': {getServerSession: mockSessionStub},
    });
  });

  after(async () => {
    const w = await workspaceService.getSiteWorkspace(workspaceId);
    await workspaceService.deleteWorkspace(mockUser.id, mockUser.email as string, workspaceId as string);

    if (w) {
      for (const p of w.projects) {
        // we don't have a service method for this
        await dbConnection.models.ProjectModel.deleteProjectById(p.id as string);
      }
    }
  });

  context('#createProject', () => {
    it('should create a new project', async () => {
      try {
        const name = 'newProject';
        const description = '';
        const docId = 'XLHjumPyb6ZoZewQ7iP0U';

        await projectActions.createProject(name, workspaceId, description, docId);

        const newWorkspace = await workspaceService.getSiteWorkspace(workspaceId);

        // the workspace should have 2 projects, the initial bootstrapped in the before hook, the other created within this test
        assert.isOk(newWorkspace);
        assert.strictEqual(newWorkspace?.projects.length, 2);

        if (newWorkspace) {
          const newProject = newWorkspace.projects[1];
          assert.strictEqual(newProject.docId, docId);
          assert.strictEqual(newProject.workspace, workspaceId);
          assert.strictEqual(newProject.name, name);
        }
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await projectActions.createProject(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#updateProjectName', () => {
    it('should update a project name', async () => {
      try {
        const name = 'newProject';
        await projectActions.updateProjectName(projectId, name);
        const proj = await projectActions.getProject(projectId);
        assert.strictEqual(proj.name, name);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await projectActions.updateProjectName(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#getProject', () => {
    it('should get a project by id', async () => {
      try {
        const retval = await projectActions.getProject(projectId);
        assert.isOk(retval);
        assert.strictEqual(retval.id, projectId);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await projectActions.getProject(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#updateProjectState', () => {
    it('should update a project state properties', async () => {
      try {
        const newColKey = 'newDateColumn';
        const newDataType = fileIngestionTypes.constants.FIELD_TYPE.DATE;
        const newDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
        // simulates a date dropped on X, which updates project state
        const newState: databaseTypes.IProject['state'] = {
          ...project.state,
          properties: {
            ...project.state.properties,
            X: {
              ...project.state.properties['X'],
              key: newColKey,
              dataType: newDataType,
              dateGrouping: newDateGrouping,
            },
          },
        };

        await projectActions.updateProjectState(projectId, newState);
        const updatedProject = await projectActions.getProject(projectId);
        assert.isOk(updatedProject);
        assert.strictEqual(updatedProject.state.properties['X'].key, newColKey);
        assert.strictEqual(updatedProject.state.properties['X'].dataType, newDataType);
        assert.strictEqual(updatedProject.state.properties['X'].dateGrouping, newDateGrouping);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await projectActions.updateProjectState(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
  context('#deactivateProject', () => {
    it('should deactivate a project by adding .deletedAt', async () => {
      try {
        await projectActions.deactivateProject(projectId);
        const deactivatedProject = await projectActions.getProject(projectId);
        assert.isOk(deactivatedProject);
        assert.isOk(deactivatedProject.deletedAt);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an ActionError when provided invalid inputs', async () => {
      try {
        await projectActions.deactivateProject(undefined);
      } catch (error) {
        assert.instanceOf(error, ActionError);
      }
    });
  });
});
