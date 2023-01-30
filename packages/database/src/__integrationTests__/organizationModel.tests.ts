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
  role: databaseTypes.constants.ROLE.USER,
};

const INPUT_MEMBER2 = {
  name: 'testMember2' + UNIQUE_KEY,
  username: 'testMemberName2' + UNIQUE_KEY,
  gh_username: 'testGhMemberName2' + UNIQUE_KEY,
  email: 'testMember2' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  apiKey: 'testApiKey2' + UNIQUE_KEY,
  role: databaseTypes.constants.ROLE.USER,
};

const INPUT_USER = {
  name: 'testUser' + UNIQUE_KEY,
  username: 'testUserName' + UNIQUE_KEY,
  gh_username: 'testGhUserName' + UNIQUE_KEY,
  email: 'testEmail' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  apiKey: 'testApiKey' + UNIQUE_KEY,
  role: databaseTypes.constants.ROLE.USER,
};

const INPUT_DATA = {
  name: 'testOrganization' + UNIQUE_KEY,
  description: 'testorganization' + UNIQUE_KEY,
  owner: {},
  members: [],
  projects: [],
};

describe('#OrganizationModel', () => {
  context('test the crud functions of the organization model', () => {
    const mongoConnection = new MongoDbConnection();
    const organizationModel = mongoConnection.models.OrganizationModel;
    let organizationId: ObjectId;
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

      if (organizationId) {
        await organizationModel.findByIdAndDelete(organizationId);
      }
    });

    it('add a new organization ', async () => {
      const organizationInput = JSON.parse(JSON.stringify(INPUT_DATA));
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

    it('add a project to the organization', async () => {
      assert.isOk(organizationId);
      const updatedOrganizationDocument = await organizationModel.addProjects(
        organizationId,
        [projectId2]
      );
      assert.strictEqual(updatedOrganizationDocument.projects.length, 2);
      assert.strictEqual(
        updatedOrganizationDocument.projects[1]?._id?.toString(),
        projectId2.toString()
      );
    });

    it('remove a project from the organization', async () => {
      assert.isOk(organizationId);
      const updatedOrganizationDocument =
        await organizationModel.removeProjects(organizationId, [projectId2]);
      assert.strictEqual(updatedOrganizationDocument.projects.length, 1);
      assert.strictEqual(
        updatedOrganizationDocument.projects[0]?._id?.toString(),
        projectId.toString()
      );
    });

    it('add a member to the organization', async () => {
      assert.isOk(organizationId);
      const updatedOrganizationDocument = await organizationModel.addMembers(
        organizationId,
        [memberId2]
      );
      assert.strictEqual(updatedOrganizationDocument.members.length, 2);
      assert.strictEqual(
        updatedOrganizationDocument.members[1]?._id?.toString(),
        memberId2.toString()
      );
    });

    it('remove a member from the organization', async () => {
      assert.isOk(organizationId);
      const updatedOrganizationDocument = await organizationModel.removeMembers(
        organizationId,
        [memberId2]
      );
      assert.strictEqual(updatedOrganizationDocument.members.length, 1);
      assert.strictEqual(
        updatedOrganizationDocument.members[0]?._id?.toString(),
        memberId.toString()
      );
    });

    it('remove an organization', async () => {
      assert.isOk(organizationId);
      await organizationModel.deleteOrganizationById(organizationId);
      let errored = false;
      try {
        await organizationModel.getOrganizationById(organizationId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      organizationId = null as unknown as ObjectId;
    });
  });
});
