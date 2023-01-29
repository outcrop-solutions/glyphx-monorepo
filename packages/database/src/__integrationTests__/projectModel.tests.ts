import 'mocha';
import {assert} from 'chai';
import {mongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const uniqueKey = v4().replaceAll('-', '');

const inputOrganization = {
  name: 'testOrganization' + uniqueKey,
  description: 'testorganization' + uniqueKey,
  owner: {},
  members: [],
  projects: [],
};

const inputUser = {
  name: 'testUser' + uniqueKey,
  username: 'testUserName' + uniqueKey,
  gh_username: 'testGhUserName' + uniqueKey,
  email: 'testEmail' + uniqueKey + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  apiKey: 'testApiKey' + uniqueKey,
  role: databaseTypes.constants.ROLE.USER,
};

const inputState = {
  version: 1,
  static: true,
  fileSystemHash: 'testFileSystemHash' + uniqueKey,
  projects: [],
  fileSystem: [],
};

const inputData = {
  name: 'testProject' + uniqueKey,
  sdtPath: 'testsdtPath' + uniqueKey,
  organization: {},
  slug: 'testSlug' + uniqueKey,
  isTemplate: false,
  type: {},
  owner: {},
  state: {},
  files: [],
};

const inputProjectType = {
  name: 'testProjectType' + uniqueKey,
  projects: [],
  shape: {field1: {type: 'string', required: true}},
};

describe('#ProjectModel', () => {
  context('test the crud functions of the project model', () => {
    const mongoConnection = new mongoDbConnection();
    const projectModel = mongoConnection.models.ProjectModel;
    let projectId: ObjectId;
    let userId: ObjectId;
    let organizationId: ObjectId;
    let stateId: ObjectId;
    let projectTypeId: ObjectId;
    let organizationDocument: any;
    let userDocument: any;
    let stateDocument: any;
    let projectTypeDocument: any;

    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const organizationModel = mongoConnection.models.OrganizationModel;
      const stateModel = mongoConnection.models.StateModel;
      const projectTypeModel = mongoConnection.models.ProjectTypeModel;

      await userModel.createUser(inputUser as databaseTypes.IUser);

      const savedUserDocument = await userModel
        .findOne({name: inputUser.name})
        .lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;

      assert.isOk(userId);

      await organizationModel.create([inputOrganization], {
        validateBeforeSave: false,
      });
      const savedOrganizationDocument = await organizationModel
        .findOne({name: inputOrganization.name})
        .lean();
      organizationId = savedOrganizationDocument?._id as mongooseTypes.ObjectId;

      organizationDocument = savedOrganizationDocument;

      assert.isOk(organizationId);

      await projectTypeModel.create([inputProjectType], {
        validateBeforeSave: false,
      });
      const savedProjectTypeDocument = await projectTypeModel
        .findOne({name: inputProjectType.name})
        .lean();
      projectTypeId = savedProjectTypeDocument?._id as mongooseTypes.ObjectId;

      projectTypeDocument = savedProjectTypeDocument;

      assert.isOk(projectTypeId);

      await stateModel.create([inputState], {validateBeforeSave: false});
      const savedStateDocument = await stateModel
        .findOne({fileSystemHash: inputState.fileSystemHash})
        .lean();
      stateId = savedStateDocument?._id as mongooseTypes.ObjectId;

      stateDocument = savedStateDocument;

      assert.isOk(stateId);
    });

    after(async () => {
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);

      const organizationModel = mongoConnection.models.OrganizationModel;
      await organizationModel.findByIdAndDelete(organizationId);

      const projectTypeModel = mongoConnection.models.ProjectTypeModel;
      await projectTypeModel.findByIdAndDelete(projectTypeId);

      const stateModel = mongoConnection.models.StateModel;
      await stateModel.findByIdAndDelete(stateId);

      if (projectId) {
        await projectModel.findByIdAndDelete(projectId);
      }
    });

    it('add a new project ', async () => {
      const projectInput = JSON.parse(JSON.stringify(inputData));
      projectInput.owner = userDocument;
      projectInput.organization = organizationDocument;
      projectInput.type = projectTypeDocument;
      projectInput.state = stateDocument;

      const projectDocument = await projectModel.createProject(projectInput);

      assert.isOk(projectDocument);
      assert.strictEqual(projectDocument.name, projectInput.name);
      assert.strictEqual(
        projectDocument.owner._id?.toString(),
        userId.toString()
      );
      assert.strictEqual(
        projectDocument.organization._id?.toString(),
        organizationId.toString()
      );
      assert.strictEqual(
        projectDocument.type._id?.toString(),
        projectTypeId.toString()
      );
      assert.strictEqual(
        projectDocument.state?._id?.toString(),
        stateId.toString()
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

    it('remove a project', async () => {
      assert.isOk(projectId);
      await projectModel.deleteProjectById(projectId);
      let errored = false;
      try {
        const document = await projectModel.getProjectById(projectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      projectId = null as unknown as ObjectId;
    });
  });
});
