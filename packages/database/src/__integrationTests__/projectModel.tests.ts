import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

const INPUT_WORKSPACE = {
  workspaceCode: 'testWorkspace' + UNIQUE_KEY,
  inviteCode: 'testWorkspace' + UNIQUE_KEY,
  name: 'testName' + UNIQUE_KEY,
  slug: 'testSlug' + UNIQUE_KEY,
  updatedAt: new Date(),
  createdAt: new Date(),
  description: 'testDescription',
  creator: {},
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

const INPUT_DATA = {
  name: 'testProject' + UNIQUE_KEY,
  sdtPath: 'testsdtPath' + UNIQUE_KEY,
  workspace: {},
  slug: 'testSlug' + UNIQUE_KEY,
  isTemplate: false,
  type: {},
  owner: {},
  state: {},
  files: [],
  viewName: 'testViewName' + UNIQUE_KEY,
};

const INPUT_DATA2 = {
  name: 'testProject2' + UNIQUE_KEY,
  sdtPath: 'testsdtPath2' + UNIQUE_KEY,
  workspace: {},
  slug: 'testSlug2' + UNIQUE_KEY,
  isTemplate: false,
  type: {},
  owner: {},
  state: {},
  files: [],
  viewName: 'testViewName2' + UNIQUE_KEY,
};

const INPUT_PROJECT_TYPE = {
  name: 'testProjectType' + UNIQUE_KEY,
  projects: [],
  shape: {field1: {type: 'string', required: true}},
};

describe('#ProjectModel', () => {
  context('test the crud functions of the project model', () => {
    const mongoConnection = new MongoDbConnection();
    const projectModel = mongoConnection.models.ProjectModel;
    let projectId: ObjectId;
    let projectId2: ObjectId;
    let userId: ObjectId;
    let workspaceId: ObjectId;
    let projectTypeId: ObjectId;
    let workspaceDocument: any;
    let userDocument: any;
    let projectTypeDocument: any;

    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const projectTypeModel = mongoConnection.models.ProjectTypeModel;

      await userModel.createUser(INPUT_USER as databaseTypes.IUser);

      const savedUserDocument = await userModel
        .findOne({name: INPUT_USER.name})
        .lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;

      assert.isOk(userId);

      await workspaceModel.create([INPUT_WORKSPACE], {
        validateBeforeSave: false,
      });
      const savedWorkspaceDocument = await workspaceModel
        .findOne({name: INPUT_WORKSPACE.name})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;

      workspaceDocument = savedWorkspaceDocument;

      assert.isOk(workspaceId);

      await projectTypeModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedProjectTypeDocument = await projectTypeModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      projectTypeId = savedProjectTypeDocument?._id as mongooseTypes.ObjectId;

      projectTypeDocument = savedProjectTypeDocument;

      assert.isOk(projectTypeId);
    });

    after(async () => {
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);

      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const projectTypeModel = mongoConnection.models.ProjectTypeModel;
      await projectTypeModel.findByIdAndDelete(projectTypeId);

      if (projectId) {
        await projectModel.findByIdAndDelete(projectId);
      }

      if (projectId2) {
        await projectModel.findByIdAndDelete(projectId2);
      }
    });

    it('add a new project ', async () => {
      const projectInput = JSON.parse(JSON.stringify(INPUT_DATA));
      projectInput.owner = userDocument;
      projectInput.workspace = workspaceDocument;
      projectInput.type = projectTypeDocument;

      const projectDocument = await projectModel.createProject(projectInput);

      assert.isOk(projectDocument);
      assert.strictEqual(projectDocument.name, projectInput.name);
      assert.strictEqual(
        projectDocument.owner._id?.toString(),
        userId.toString()
      );
      assert.strictEqual(
        projectDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      projectId = projectDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a project', async () => {
      assert.isOk(projectId);
      const project = await projectModel.getProjectById(projectId);

      assert.isOk(project);
      assert.strictEqual(project._id?.toString(), projectId.toString());
    });

    it('modify a project', async () => {
      assert.isOk(projectId);
      const input = {description: 'a modified description'};
      const updatedDocument = await projectModel.updateProjectById(
        projectId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple projects without a filter', async () => {
      assert.isOk(projectId);
      const projectInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      projectInput.owner = userDocument;
      projectInput.workspace = workspaceDocument;
      projectInput.type = projectTypeDocument;

      const projectDocument = await projectModel.createProject(projectInput);

      assert.isOk(projectDocument);

      projectId2 = projectDocument._id as mongooseTypes.ObjectId;

      const projects = await projectModel.queryProjects();
      assert.isArray(projects.results);
      assert.isAtLeast(projects.numberOfItems, 2);
      const expectedDocumentCount =
        projects.numberOfItems <= projects.itemsPerPage
          ? projects.numberOfItems
          : projects.itemsPerPage;
      assert.strictEqual(projects.results.length, expectedDocumentCount);
    });

    it('Get multiple projects with a filter', async () => {
      assert.isOk(projectId2);
      const results = await projectModel.queryProjects({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(projectId2);
      const results = await projectModel.queryProjects({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await projectModel.queryProjects({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a project', async () => {
      assert.isOk(projectId);
      await projectModel.deleteProjectById(projectId);
      let errored = false;
      try {
        await projectModel.getProjectById(projectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      projectId = null as unknown as ObjectId;
    });
  });
});
