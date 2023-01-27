import 'mocha';
import {assert} from 'chai';
import {mongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const uniqueKey = v4().replaceAll('-', '');
const inputProject = {
  name: 'testProject' + uniqueKey,
  isTemplate: false,
  type: new mongooseTypes.ObjectId(),
  owner: new mongooseTypes.ObjectId(),
  files: [],
};

const inputMember = {
  name: 'testMember' + uniqueKey,
  username: 'testMemberName' + uniqueKey,
  gh_username: 'testGhMemberName' + uniqueKey,
  email: 'testMember' + uniqueKey + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  apiKey: 'testApiKey' + uniqueKey,
  role: databaseTypes.constants.ROLE.USER,
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

const inputData = {
  name: 'testOrganization' + uniqueKey,
  description: 'testorganization' + uniqueKey,
  owner: {},
  members: [],
  projects: [],
};

describe('#OrganizationModel', () => {
  context('test the crud functions of the organization model', () => {
    const mongoConnection = new mongoDbConnection();
    const organizationModel = mongoConnection.models.OrganizationModel;
    let organizationId: ObjectId;
    let userId: ObjectId;
    let memberId: ObjectId;
    let projectId: ObjectId;
    let userDocument: any;
    let memberDocument: any;
    let projectDocument: any;
    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const projectModel = mongoConnection.models.ProjectModel;

      await userModel.createUser(inputUser as databaseTypes.IUser);

      const savedUserDocument = await userModel
        .findOne({name: inputUser.name})
        .lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;

      assert.isOk(userId);

      await userModel.createUser(inputMember as databaseTypes.IUser);

      const savedMemberDocument = await userModel
        .findOne({name: inputMember.name})
        .lean();
      memberId = savedMemberDocument?._id as mongooseTypes.ObjectId;

      memberDocument = savedMemberDocument;

      assert.isOk(memberId);

      await projectModel.create([inputProject], {validateBeforeSave: false});
      const savedProjectDocument = await projectModel
        .findOne({name: inputProject.name})
        .lean();
      projectId = savedProjectDocument?._id as mongooseTypes.ObjectId;

      projectDocument = savedProjectDocument;

      assert.isOk(projectId);
    });

    after(async () => {
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);
      await userModel.findByIdAndDelete(memberId);

      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);

      if (organizationId) {
        await organizationModel.findByIdAndDelete(organizationId);
      }
    });

    it('add a new organization ', async () => {
      const organizationInput = JSON.parse(JSON.stringify(inputData));
      organizationInput.owner = userDocument;
      organizationInput.members.push(memberDocument);
      organizationInput.projects.push(projectDocument);
      const organizationDocument = await organizationModel.createOrganization(
        organizationInput
      );

      assert.isOk(organizationDocument);
      assert.strictEqual(organizationDocument.name, organizationInput.name);
      assert.strictEqual(
        organizationDocument.owner._id?.toString(),
        userId.toString()
      );

      assert.strictEqual(
        organizationDocument.members[0].name,
        memberDocument.name
      );
      assert.strictEqual(
        organizationDocument.projects[0].name,
        projectDocument.name
      );

      organizationId = organizationDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive an organization ', async () => {
      assert.isOk(organizationId);
      const organization = await organizationModel.getOrganizationById(
        organizationId
      );

      assert.isOk(organization);
      assert.strictEqual(
        organization._id?.toString(),
        organizationId.toString()
      );
    });

    it('modify an organization', async () => {
      assert.isOk(organizationId);
      const input = {description: 'a modified description'};
      const updatedDocument = await organizationModel.updateOrganizationById(
        organizationId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('remove an organization', async () => {
      assert.isOk(organizationId);
      await organizationModel.deleteOrganizationById(organizationId);
      let errored = false;
      try {
        const document = await organizationModel.getOrganizationById(
          organizationId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      organizationId = null as unknown as ObjectId;
    });
  });
});
