import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {
  database as databaseTypes,
  fileIngestion as fileIngestionTypes,
} from '@glyphx/types';
import {projectService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');
const INPUT_VIEW_NAME = 'updatedView' + UNIQUE_KEY;
const INPUT_PROJECT_NAME = 'updatedProjectName' + UNIQUE_KEY;

const INPUT_FILE_STATS: fileIngestionTypes.IFileStats[] = [
  {
    fileName: 'testFile' + UNIQUE_KEY,
    tableName: 'testTable' + UNIQUE_KEY,
    numberOfRows: 10,
    numberOfColumns: 5,
    columns: [],
    fileSize: 1000,
  },
];

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
  name: 'testUser' + UNIQUE_KEY,
  userCode: 'testUserCode' + UNIQUE_KEY,
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

const INPUT_STATE = {
  version: 1,
  static: true,
  fileSystemHash: 'testFileSystemHash' + UNIQUE_KEY,
  projects: [],
  fileSystem: [],
};

const INPUT_DATA = {
  name: 'testProject' + UNIQUE_KEY,
  sdtPath: 'testsdtPath' + UNIQUE_KEY,
  organization: {},
  slug: 'testSlug' + UNIQUE_KEY,
  isTemplate: false,
  type: {},
  owner: {},
  state: {},
  files: [],
  viewName: 'testProjectView' + UNIQUE_KEY,
  workspace: {},
};

const INPUT_PROJECT_TYPE = {
  name: 'testProjectType' + UNIQUE_KEY,
  projects: [],
  shape: {field1: {type: 'string', required: true}},
};

describe('#ProjectService', () => {
  context('test the functions of the project service', () => {
    const mongoConnection = new MongoDbConnection();
    const projectModel = mongoConnection.models.ProjectModel;
    let projectId: ObjectId;
    let userId: ObjectId;
    let stateId: ObjectId;
    let projectTypeId: ObjectId;
    let workspaceId: ObjectId;
    let userDocument: any;
    let stateDocument: any;
    let projectTypeDocument: any;
    let workspaceDocument: any;

    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const stateModel = mongoConnection.models.StateModel;
      const projectTypeModel = mongoConnection.models.ProjectTypeModel;
      const workspaceModel = mongoConnection.models.WorkspaceModel;

      await userModel.createUser(INPUT_USER as databaseTypes.IUser);

      const savedUserDocument = await userModel
        .findOne({name: INPUT_USER.name})
        .lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;

      assert.isOk(userId);

      await projectTypeModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedProjectTypeDocument = await projectTypeModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      projectTypeId = savedProjectTypeDocument?._id as mongooseTypes.ObjectId;

      projectTypeDocument = savedProjectTypeDocument;

      assert.isOk(projectTypeId);

      await stateModel.create([INPUT_STATE], {validateBeforeSave: false});
      const savedStateDocument = await stateModel
        .findOne({fileSystemHash: INPUT_STATE.fileSystemHash})
        .lean();
      stateId = savedStateDocument?._id as mongooseTypes.ObjectId;

      stateDocument = savedStateDocument;

      assert.isOk(stateId);

      await workspaceModel.create([INPUT_WORKSPACE], {
        validateBeforeSave: false,
      });
      const savedWorkspaceDocument = await workspaceModel
        .findOne({name: INPUT_WORKSPACE.name})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;

      workspaceDocument = savedWorkspaceDocument;

      assert.isOk(workspaceId);
      INPUT_DATA.owner = userDocument;
      INPUT_DATA.type = projectTypeDocument;
      INPUT_DATA.state = stateDocument;
      INPUT_DATA.workspace = workspaceDocument;

      const projectDocument = await projectModel.createProject(
        INPUT_DATA as unknown as databaseTypes.IProject
      );

      projectId = projectDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);

      const projectTypeModel = mongoConnection.models.ProjectTypeModel;
      await projectTypeModel.findByIdAndDelete(projectTypeId);

      const stateModel = mongoConnection.models.StateModel;
      await stateModel.findByIdAndDelete(stateId);

      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      if (projectId) {
        await projectModel.findByIdAndDelete(projectId);
      }
    });

    it('will retreive our project from the database', async () => {
      const project = await projectService.getProject(projectId);
      assert.isOk(project);

      assert.strictEqual(project?.name, INPUT_DATA.name);
    });
    it('will update the file stats on our project', async () => {
      assert.isOk(projectId);
      const updatedProject = await projectService.updateProjectFileStats(
        projectId,
        INPUT_FILE_STATS
      );
      assert.strictEqual(
        updatedProject.files[0].fileName,
        INPUT_FILE_STATS[0].fileName
      );
    });

    it('will retreive our file stats', async () => {
      assert.isOk(projectId);
      const stats = await projectService.getProjectFileStats(projectId);
      assert.isArray(stats);
      assert.strictEqual(stats.length, 1);

      assert.strictEqual(stats[0].fileName, INPUT_FILE_STATS[0].fileName);
    });

    it('will update the view name on our project', async () => {
      assert.isOk(projectId);
      const updatedProject = await projectService.updateProjectView(
        projectId,
        INPUT_VIEW_NAME
      );
      assert.strictEqual(updatedProject.viewName, INPUT_VIEW_NAME);
    });

    it('will retreive our viewName', async () => {
      assert.isOk(projectId);
      const viewName = await projectService.getProjectViewName(projectId);
      assert.isNotEmpty(viewName);
      assert.strictEqual(viewName, INPUT_VIEW_NAME);
    });
    it('will update our poroject', async () => {
      assert.isOk(projectId);
      const updatedProject = await projectService.updateProject(projectId, {
        name: INPUT_PROJECT_NAME,
      });
      assert.strictEqual(updatedProject.name, INPUT_PROJECT_NAME);

      const savedProject = await projectService.getProject(projectId);

      assert.strictEqual(savedProject?.name, INPUT_PROJECT_NAME);
    });
  });
});
