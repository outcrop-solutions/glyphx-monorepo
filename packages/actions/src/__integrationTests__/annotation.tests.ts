import 'mocha';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import proxyquire from 'proxyquire';
import {ActionError} from 'core/src/error';
import {Initializer, dbConnection, membershipService, projectService, stateService, workspaceService} from 'business';
import {databaseTypes} from 'types';
import {imageHash} from './constants/imageHash';
import {del, list} from '@vercel/blob';

describe('#integrationTests/annotation', () => {
  const sandbox = createSandbox();
  let annotationAction;
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

    annotationAction = proxyquire('../annotation', {
      'next/cache': {revalidatePath: revalidatePathStub},
      'next/navigation': {redirect: redirectStub},
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

  context('#getSuggestedMembers', () => {
    it('should get the suggested members for the mentions dropdown', async () => {
      try {
        const projectId = project.id;
        const query = 'i';

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
        const projectId = project.id;
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
        const stateId = state.id;
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
    it.only('should create a project annotation', async () => {
      try {
        const value = 'integration test annotation';
        const projectId = project.id;

        const proj = await projectService.getProject(projectId);
        const latestStateId = proj?.stateHistory[0].id;

        await annotationAction.createProjectAnnotation(projectId, value);

        // should create the blob in the correct blob storage
        const retval = await list({prefix: `state/${latestStateId}`, token: process.env.DEV_BLOB_READ_WRITE_TOKEN});
        assert.strictEqual(retval.blobs.length, 1);
        // clean up blob storage
        await del(`https://aqhswtcebhzai9us.public.blob.vercel-storage.com/state/${latestStateId}`, {
          token: process.env.DEV_BLOB_READ_WRITE_TOKEN,
        });

        // should have created project annotation in DB
        const annotations = await annotationAction.getProjectAnnotations(project.id);
        assert.strictEqual(annotations?.length, 1);
        // clean up annotation
        if (annotations && annotations.length > 0) {
          const delVal = await dbConnection.models.AnnotationModel.findOneAndDelete({id: annotations[0].id});
          assert.isOk(delVal);
        } else {
          assert.fail();
        }
        // TODO: test for email being sent via fake smtp server
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
    it.only('should create a state annotation', async () => {
      try {
        const stateId = state.id;
        const value = 'integrationTest state annotation';

        await annotationAction.createStateAnnotation(stateId, value);

        // should create the blob in the correct blob storage
        const retval = await list({prefix: `state/${stateId}`, token: process.env.DEV_BLOB_READ_WRITE_TOKEN});
        assert.strictEqual(retval.blobs.length, 1);
        // clean up blob storage
        await del(`https://aqhswtcebhzai9us.public.blob.vercel-storage.com/state/${stateId}`, {
          token: process.env.DEV_BLOB_READ_WRITE_TOKEN,
        });

        // should have created project annotation in DB
        const annotations = await annotationAction.getStateAnnotations(stateId);
        assert.strictEqual(annotations?.length, 1);
        // clean up annotation
        if (annotations && annotations.length > 0) {
          const delVal = await dbConnection.models.AnnotationModel.findOneAndDelete({id: annotations[0].id});
          assert.isOk(delVal);
        } else {
          assert.fail();
        }
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
