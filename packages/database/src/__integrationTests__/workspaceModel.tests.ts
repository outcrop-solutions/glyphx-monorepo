import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');
const INPUT_PROJECT = {
  name: 'testProject' + UNIQUE_KEY,
  isTemplate: false,
  type: new mongooseTypes.ObjectId(),
  owner: new mongooseTypes.ObjectId(),
  files: [],
};

const INPUT_PROJECT2 = {
  name: 'testProject2' + UNIQUE_KEY,
  isTemplate: false,
  type: new mongooseTypes.ObjectId(),
  owner: new mongooseTypes.ObjectId(),
  files: [],
};

const INPUT_MEMBER = {
  name: 'testMember' + UNIQUE_KEY,
  username: 'testMemberName' + UNIQUE_KEY,
  gh_username: 'testGhMemberName' + UNIQUE_KEY,
  email: 'testMember' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  apiKey: 'testApiKey' + UNIQUE_KEY,
  role: databaseTypes.constants.ROLE.MEMBER,
};

const INPUT_MEMBER2 = {
  name: 'testMember2' + UNIQUE_KEY,
  username: 'testMemberName2' + UNIQUE_KEY,
  gh_username: 'testGhMemberName2' + UNIQUE_KEY,
  email: 'testMember2' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  apiKey: 'testApiKey2' + UNIQUE_KEY,
  role: databaseTypes.constants.ROLE.MEMBER,
};

const INPUT_USER = {
  name: 'testUser' + UNIQUE_KEY,
  username: 'testUserName' + UNIQUE_KEY,
  gh_username: 'testGhUserName' + UNIQUE_KEY,
  email: 'testEmail' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  apiKey: 'testApiKey' + UNIQUE_KEY,
  role: databaseTypes.constants.ROLE.MEMBER,
};

const INPUT_DATA = {
  name: 'testWorkspace' + UNIQUE_KEY,
  description: 'testworkspace' + UNIQUE_KEY,
  owner: {},
  members: [],
  projects: [],
};

describe('#WorkspaceModel', () => {
  context('test the crud functions of the workspace model', () => {
    const mongoConnection = new MongoDbConnection();
    const workspaceModel = mongoConnection.models.WorkspaceModel;
    let workspaceId: ObjectId;
    let userId: ObjectId;
    let memberId: ObjectId;
    let memberId2: ObjectId;
    let projectId: ObjectId;
    let projectId2: ObjectId;
    let userDocument: any;
    let memberDocument: any;
    let projectDocument: any;
    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const projectModel = mongoConnection.models.ProjectModel;

      await userModel.createUser(INPUT_USER as databaseTypes.IUser);

      const savedUserDocument = await userModel
        .findOne({name: INPUT_USER.name})
        .lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;

      assert.isOk(userId);

      await userModel.createUser(INPUT_MEMBER as databaseTypes.IUser);

      const savedMemberDocument = await userModel
        .findOne({name: INPUT_MEMBER.name})
        .lean();
      memberId = savedMemberDocument?._id as mongooseTypes.ObjectId;

      memberDocument = savedMemberDocument;

      assert.isOk(memberId);

      await userModel.createUser(INPUT_MEMBER2 as databaseTypes.IUser);

      const savedMemberDocument2 = await userModel
        .findOne({name: INPUT_MEMBER2.name})
        .lean();

      memberId2 = savedMemberDocument2?._id as mongooseTypes.ObjectId;

      assert.isOk(memberId2);
      await projectModel.create([INPUT_PROJECT], {validateBeforeSave: false});
      const savedProjectDocument = await projectModel
        .findOne({name: INPUT_PROJECT.name})
        .lean();
      projectId = savedProjectDocument?._id as mongooseTypes.ObjectId;

      projectDocument = savedProjectDocument;

      assert.isOk(projectId);

      await projectModel.create([INPUT_PROJECT2], {validateBeforeSave: false});
      const savedProjectDocument2 = await projectModel
        .findOne({name: INPUT_PROJECT2.name})
        .lean();
      projectId2 = savedProjectDocument2?._id as mongooseTypes.ObjectId;

      assert.isOk(projectId2);
    });

    after(async () => {
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);
      await userModel.findByIdAndDelete(memberId);
      await userModel.findByIdAndDelete(memberId2);

      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);
      await projectModel.findByIdAndDelete(projectId2);

      if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }
    });

    it('add a new workspace ', async () => {
      const workspaceInput = JSON.parse(JSON.stringify(INPUT_DATA));
      workspaceInput.owner = userDocument;
      workspaceInput.members.push(memberDocument);
      workspaceInput.projects.push(projectDocument);
      const workspaceDocument = await workspaceModel.createWorkspace(
        workspaceInput
      );

      assert.isOk(workspaceDocument);
      assert.strictEqual(workspaceDocument.name, workspaceInput.name);
      assert.strictEqual(
        workspaceDocument.owner._id?.toString(),
        userId.toString()
      );

      assert.strictEqual(
        workspaceDocument.members[0].name,
        memberDocument.name
      );
      assert.strictEqual(
        workspaceDocument.projects[0].name,
        projectDocument.name
      );

      workspaceId = workspaceDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive an workspace ', async () => {
      assert.isOk(workspaceId);
      const workspace = await workspaceModel.getWorkspaceById(
        workspaceId
      );

      assert.isOk(workspace);
      assert.strictEqual(
        workspace._id?.toString(),
        workspaceId.toString()
      );
    });

    it('modify an workspace', async () => {
      assert.isOk(workspaceId);
      const input = {description: 'a modified description'};
      const updatedDocument = await workspaceModel.updateWorkspaceById(
        workspaceId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('add a project to the workspace', async () => {
      assert.isOk(workspaceId);
      const updatedWorkspaceDocument = await workspaceModel.addProjects(
        workspaceId,
        [projectId2]
      );
      assert.strictEqual(updatedWorkspaceDocument.projects.length, 2);
      assert.strictEqual(
        updatedWorkspaceDocument.projects[1]?._id?.toString(),
        projectId2.toString()
      );
    });

    it('remove a project from the workspace', async () => {
      assert.isOk(workspaceId);
      const updatedWorkspaceDocument =
        await workspaceModel.removeProjects(workspaceId, [projectId2]);
      assert.strictEqual(updatedWorkspaceDocument.projects.length, 1);
      assert.strictEqual(
        updatedWorkspaceDocument.projects[0]?._id?.toString(),
        projectId.toString()
      );
    });

    it('add a member to the workspace', async () => {
      assert.isOk(workspaceId);
      const updatedWorkspaceDocument = await workspaceModel.addMembers(
        workspaceId,
        [memberId2]
      );
      assert.strictEqual(updatedWorkspaceDocument.members.length, 2);
      assert.strictEqual(
        updatedWorkspaceDocument.members[1]?._id?.toString(),
        memberId2.toString()
      );
    });

    it('remove a member from the workspace', async () => {
      assert.isOk(workspaceId);
      const updatedWorkspaceDocument = await workspaceModel.removeMembers(
        workspaceId,
        [memberId2]
      );
      assert.strictEqual(updatedWorkspaceDocument.members.length, 1);
      assert.strictEqual(
        updatedWorkspaceDocument.members[0]?._id?.toString(),
        memberId.toString()
      );
    });

    it('remove an workspace', async () => {
      assert.isOk(workspaceId);
      await workspaceModel.deleteWorkspaceById(workspaceId);
      let errored = false;
      try {
        await workspaceModel.getWorkspaceById(workspaceId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      workspaceId = null as unknown as ObjectId;
    });
  });
});
