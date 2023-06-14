import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');
const INPUT_PROJECT = {
  name: 'testProject' + UNIQUE_KEY,
  template: new mongooseTypes.ObjectId(),
  owner: new mongooseTypes.ObjectId(),
  files: [],
};

const INPUT_PROJECT2 = {
  name: 'testProject2' + UNIQUE_KEY,
  template: new mongooseTypes.ObjectId(),
  owner: new mongooseTypes.ObjectId(),
  files: [],
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

const INPUT_USER2 = {
  name: 'testUser2' + UNIQUE_KEY,
  userCode: 'testUserCode2' + UNIQUE_KEY,
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
  version: 1,
  static: false,
  fileSystemHash: UNIQUE_KEY,
  fileSystem: [],
  camera: {
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
  aspectRatio: {
    height: 100,
    width: 100,
  },
  properties: [],
  project: {},
  createdBy: {},
};

const INPUT_DATA2 = {
  version: 1,
  static: false,
  fileSystemHash: 'hash2' + UNIQUE_KEY,
  fileSystem: [],
  camera: {
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
  aspectRatio: {
    height: 100,
    width: 100,
  },
  properties: [],
  project: {},
  createdBy: {},
};

describe('#StateModel', () => {
  context('test the crud functions of the state model', () => {
    const mongoConnection = new MongoDbConnection();
    const stateModel = mongoConnection.models.StateModel;
    let stateId: ObjectId;
    let stateId2: ObjectId;
    let userId: ObjectId;
    let userId2: ObjectId;
    let projectId: ObjectId;
    let projectDocument: any;
    let userDocument: any;
    let projectId2: ObjectId;
    before(async () => {
      await mongoConnection.init();
      const projectModel = mongoConnection.models.ProjectModel;

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

      const userModel = mongoConnection.models.UserModel;

      await userModel.create([INPUT_USER], {validateBeforeSave: false});
      const savedUserDocument = await userModel
        .findOne({name: INPUT_USER.name})
        .lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;

      assert.isOk(userId);

      await userModel.create([INPUT_USER2], {validateBeforeSave: false});
      const savedUserDocument2 = await userModel
        .findOne({name: INPUT_USER2.name})
        .lean();
      userId2 = savedUserDocument2?._id as mongooseTypes.ObjectId;

      assert.isOk(userId2);
    });

    after(async () => {
      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);
      await projectModel.findByIdAndDelete(projectId2);

      if (stateId) {
        await stateModel.findByIdAndDelete(stateId);
      }

      if (stateId2) {
        await stateModel.findByIdAndDelete(stateId2);
      }
    });

    it('add a new state ', async () => {
      const stateInput = JSON.parse(JSON.stringify(INPUT_DATA));
      stateInput.project = projectDocument;
      stateInput.createdBy = userDocument;
      const stateDocument = await stateModel.createState(stateInput);

      assert.isOk(stateDocument);
      assert.strictEqual(
        stateDocument.fileSystemHash,
        stateInput.fileSystemHash
      );
      assert.strictEqual(stateDocument.project.name, projectDocument.name);
      assert.strictEqual(stateDocument.createdBy.name, userDocument.name);

      stateId = stateDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a state ', async () => {
      assert.isOk(stateId);
      const state = await stateModel.getStateById(stateId);

      assert.isOk(state);
      assert.strictEqual(state._id?.toString(), stateId.toString());
    });

    it('Get multiple states without a filter', async () => {
      assert.isOk(stateId);
      const stateInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      stateInput.project = projectDocument;
      stateInput.createdBy = userDocument;
      const stateDocument = await stateModel.createState(stateInput);

      assert.isOk(stateDocument);
      stateId2 = stateDocument._id as mongooseTypes.ObjectId;

      const states = await stateModel.queryStates();
      assert.isArray(states.results);
      assert.isAtLeast(states.numberOfItems, 2);
      const expectedDocumentCount =
        states.numberOfItems <= states.itemsPerPage
          ? states.numberOfItems
          : states.itemsPerPage;
      assert.strictEqual(states.results.length, expectedDocumentCount);
    });

    it('Get multiple states with a filter', async () => {
      assert.isOk(stateId2);
      const results = await stateModel.queryStates({
        fileSystemHash: INPUT_DATA.fileSystemHash,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(
        results.results[0]?.fileSystemHash,
        INPUT_DATA.fileSystemHash
      );
    });

    it('page states', async () => {
      assert.isOk(stateId2);
      const results = await stateModel.queryStates({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await stateModel.queryStates({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('modify a state', async () => {
      assert.isOk(stateId);
      const input = {fileSystemHash: 'a modified hash'};
      const updatedDocument = await stateModel.updateStateById(stateId, input);
      assert.strictEqual(updatedDocument.fileSystemHash, input.fileSystemHash);
    });

    it('remove a state', async () => {
      assert.isOk(stateId);
      await stateModel.deleteStateById(stateId);
      let errored = false;
      try {
        await stateModel.getStateById(stateId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      stateId = null as unknown as ObjectId;
    });
  });
});
