import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {error} from 'core';
import {DBFormatter} from '../lib/format';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');
const INPUT_PROJECT = {
  name: 'testProject' + UNIQUE_KEY,

  template:
    // @ts-ignore
    new mongooseTypes.ObjectId(),

  owner:
    // @ts-ignore
    new mongooseTypes.ObjectId(),
  files: [],
};

const INPUT_PROJECT2 = {
  name: 'testProject2' + UNIQUE_KEY,

  template:
    // @ts-ignore
    new mongooseTypes.ObjectId(),

  owner:
    // @ts-ignore
    new mongooseTypes.ObjectId(),
  files: [],
};

const INPUT_MEMBER = {
  email: 'testMember1' + UNIQUE_KEY,
  inviter: 'testMember1',
  invitedAt: new Date(),
  joinedAt: new Date(),
  updatedAt: new Date(),
  createdAt: new Date(),
  status: databaseTypes.constants.INVITATION_STATUS.PENDING,
  teamRole: databaseTypes.constants.ROLE.MEMBER,
  member: {},
  invitedBy: {},
  workspace: {},
};

const INPUT_MEMBER2 = {
  email: 'testMember2' + UNIQUE_KEY,
  inviter: 'testMember2',
  invitedAt: new Date(),
  joinedAt: new Date(),
  updatedAt: new Date(),
  createdAt: new Date(),
  status: databaseTypes.constants.INVITATION_STATUS.PENDING,
  teamRole: databaseTypes.constants.ROLE.MEMBER,
  member: {},
  invitedBy: {},
  workspace: {},
};

const INPUT_USER = {
  userCode: 'testUserCode' + UNIQUE_KEY,
  name: 'testUser' + UNIQUE_KEY,
  username: 'testUserName' + UNIQUE_KEY,
  email: 'testEmail' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [],
  sessions: [],
  membership: [],
  invitedMembers: [],
  createdWorkspaces: [],
  projects: [],
  webhooks: [],
};

const INPUT_USER2 = {
  userCode: 'testUserCode2' + UNIQUE_KEY,
  name: 'testUser2' + UNIQUE_KEY,
  username: 'testUserName2' + UNIQUE_KEY,
  email: 'testEmail2' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [],
  sessions: [],
  membership: [],
  invitedMembers: [],
  createdWorkspaces: [],
  projects: [],
  webhooks: [],
};
const INPUT_DATA = {
  workspaceCode: 'testWorkspace' + UNIQUE_KEY,
  inviteCode: 'testWorkspace' + UNIQUE_KEY,
  name: 'testName' + UNIQUE_KEY,
  slug: 'testSlug' + UNIQUE_KEY,
  updatedAt: new Date(),
  createdAt: new Date(),
  description: 'testDescription',
  creator: {},
  projects: [],
  members: [],
};

const INPUT_DATA2 = {
  workspaceCode: 'testWorkspace2' + UNIQUE_KEY,
  inviteCode: 'testWorkspace2' + UNIQUE_KEY,
  name: 'testName2' + UNIQUE_KEY,
  slug: 'testSlug2' + UNIQUE_KEY,
  updatedAt: new Date(),
  createdAt: new Date(),
  description: 'testDescription2',
  creator: {},
  projects: [],
  members: [],
};

describe('#WorkspaceModel', () => {
  context('test the crud functions of the workspace model', () => {
    const mongoConnection = new MongoDbConnection();
    const format = new DBFormatter();
    const workspaceModel = mongoConnection.models.WorkspaceModel;
    let workspaceId: string;
    let workspaceId2: string;
    let userId: ObjectId;
    let userId2: ObjectId;
    let memberId: ObjectId;
    let memberId2: ObjectId;
    let projectId: ObjectId;
    let projectId2: ObjectId;
    let userDocument: any;
    let userDocument2: any;
    let projectDocument: any;
    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const projectModel = mongoConnection.models.ProjectModel;

      await userModel.createUser(INPUT_USER as databaseTypes.IUser);

      const savedUserDocument = await userModel.findOne({name: INPUT_USER.name}).lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;

      assert.isOk(userId);

      await userModel.createUser(INPUT_USER2 as databaseTypes.IUser);

      const savedUserDocument2 = await userModel.findOne({name: INPUT_USER2.name}).lean();
      userId2 = savedUserDocument2?._id as mongooseTypes.ObjectId;

      userDocument2 = savedUserDocument2;

      assert.isOk(userId2);

      await projectModel.create([INPUT_PROJECT], {validateBeforeSave: false});
      const savedProjectDocument = await projectModel.findOne({name: INPUT_PROJECT.name}).lean();
      projectId = savedProjectDocument?._id as mongooseTypes.ObjectId;

      projectDocument = savedProjectDocument;

      assert.isOk(projectId);

      await projectModel.create([INPUT_PROJECT2], {validateBeforeSave: false});
      const savedProjectDocument2 = await projectModel.findOne({name: INPUT_PROJECT2.name}).lean();
      projectId2 = savedProjectDocument2?._id as mongooseTypes.ObjectId;

      assert.isOk(projectId2);
    });

    after(async () => {
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);
      await userModel.findByIdAndDelete(userId2);

      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);
      await projectModel.findByIdAndDelete(projectId2);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);
      if (memberId2) await memberModel.findByIdAndDelete(memberId2);

      if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }

      if (workspaceId2) {
        await workspaceModel.findByIdAndDelete(workspaceId2);
      }
    });

    it('add a new workspace ', async () => {
      const workspaceInput = JSON.parse(JSON.stringify(INPUT_DATA));
      workspaceInput.creator = userDocument;
      workspaceInput.projects.push(projectDocument);
      const workspaceDocument = await workspaceModel.createWorkspace(format.toJS(workspaceInput));

      assert.isOk(workspaceDocument);
      assert.strictEqual(workspaceDocument.name, workspaceInput.name);
      assert.strictEqual(workspaceDocument.creator.id, userId.toString());
      assert.strictEqual(workspaceDocument.projects[0].name, projectDocument.name);

      //members require a workspace so we need to add them here after our workspace has been created.
      const inputMember = JSON.parse(JSON.stringify(INPUT_MEMBER)) as databaseTypes.IMember;
      inputMember.member = userDocument as databaseTypes.IUser;
      inputMember.invitedBy = userDocument as databaseTypes.IUser;
      inputMember.workspace = workspaceDocument;
      inputMember.email = userDocument.email;

      const memberModel = mongoConnection.models.MemberModel;
      await memberModel.createWorkspaceMember(format.toJS(inputMember));

      const savedMemberDocument = await memberModel.findOne({email: inputMember.email}).lean();
      memberId = savedMemberDocument?._id as mongooseTypes.ObjectId;

      assert.isOk(memberId);

      const inputMember2 = JSON.parse(JSON.stringify(INPUT_MEMBER2)) as databaseTypes.IMember;
      inputMember2.member = userDocument2 as databaseTypes.IUser;
      inputMember2.invitedBy = userDocument2 as databaseTypes.IUser;
      inputMember2.workspace = workspaceDocument;
      inputMember2.email = userDocument2.email;
      await memberModel.createWorkspaceMember(format.toJS(inputMember2));

      const savedMemberDocument2 = await memberModel.findOne({email: inputMember2.email}).lean();

      memberId2 = savedMemberDocument2?._id as mongooseTypes.ObjectId;
      assert.isOk(memberId2);

      await workspaceModel.addMembers(workspaceDocument.id!, [memberId.toString()]);
      workspaceId = workspaceDocument.id!;
    });

    it('retreive an workspace ', async () => {
      assert.isOk(workspaceId);
      const workspace = await workspaceModel.getWorkspaceById(workspaceId.toString());

      assert.isOk(workspace);
      assert.strictEqual(workspace.id, workspaceId.toString());
    });

    it('Get multiple workspaces without a filter', async () => {
      assert.isOk(workspaceId);
      const workspaceInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      workspaceInput.creator = userDocument;
      workspaceInput.projects.push(projectDocument);
      const workspaceDocument = await workspaceModel.createWorkspace(format.toJS(workspaceInput));

      assert.isOk(workspaceDocument);
      workspaceId2 = workspaceDocument.id!;

      const workspaces = await workspaceModel.queryWorkspaces();
      assert.isArray(workspaces.results);
      assert.isAtLeast(workspaces.numberOfItems, 2);
      const expectedDocumentCount =
        workspaces.numberOfItems <= workspaces.itemsPerPage ? workspaces.numberOfItems : workspaces.itemsPerPage;
      assert.strictEqual(workspaces.results.length, expectedDocumentCount);
    });

    it('Get multiple workspaces with a filter', async () => {
      assert.isOk(workspaceId2);
      const results = await workspaceModel.queryWorkspaces({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page workspaces', async () => {
      assert.isOk(workspaceId2);
      const results = await workspaceModel.queryWorkspaces({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?.id;

      const results2 = await workspaceModel.queryWorkspaces({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?.id, lastId?.toString());
    });

    it('modify a workspace', async () => {
      assert.isOk(workspaceId);
      const input = {description: 'a modified description'};
      const updatedDocument = await workspaceModel.updateWorkspaceById(workspaceId.toString(), input);
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('add a project to the workspace', async () => {
      assert.isOk(workspaceId);
      const updatedWorkspaceDocument = await workspaceModel.addProjects(workspaceId.toString(), [
        projectId2.toString(),
      ]);
      assert.strictEqual(updatedWorkspaceDocument.projects.length, 2);
      assert.strictEqual(updatedWorkspaceDocument.projects[1]?.id, projectId2.toString());
    });

    it('remove a project from the workspace', async () => {
      assert.isOk(workspaceId);
      const updatedWorkspaceDocument = await workspaceModel.removeProjects(workspaceId.toString(), [
        projectId2.toString(),
      ]);
      assert.strictEqual(updatedWorkspaceDocument.projects.length, 1);
      assert.strictEqual(updatedWorkspaceDocument.projects[0]?.id, projectId.toString());
    });

    it('add a member to the workspace', async () => {
      assert.isOk(workspaceId);
      const updatedWorkspaceDocument = await workspaceModel.addMembers(workspaceId.toString(), [memberId2.toString()]);
      assert.strictEqual(updatedWorkspaceDocument.members.length, 2);
      assert.strictEqual(updatedWorkspaceDocument.members[1]?.id, memberId2.toString());
    });

    it('remove a member from the workspace', async () => {
      assert.isOk(workspaceId);
      const updatedWorkspaceDocument = await workspaceModel.removeMembers(workspaceId.toString(), [
        memberId2.toString(),
      ]);
      assert.strictEqual(updatedWorkspaceDocument.members.length, 1);
      assert.strictEqual(updatedWorkspaceDocument.members[0]?.id, memberId.toString());
    });

    it('remove an workspace', async () => {
      assert.isOk(workspaceId);
      await workspaceModel.deleteWorkspaceById(workspaceId.toString());
      let errored = false;
      try {
        await workspaceModel.getWorkspaceById(workspaceId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      workspaceId = null as unknown as string;
    });
  });
});
