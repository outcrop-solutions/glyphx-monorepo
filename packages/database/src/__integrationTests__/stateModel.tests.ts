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

const inputData = {
  version: 1,
  static: false,
  fileSystemHash: uniqueKey,
  projects: [],
  fileSystem: [],
};

describe('#StateModel', () => {
  context('test the crud functions of the state model', () => {
    const mongoConnection = new mongoDbConnection();
    const stateModel = mongoConnection.models.StateModel;
    let stateId: ObjectId;
    let projectId: ObjectId;
    let projectDocument: any;
    before(async () => {
      await mongoConnection.init();
      const projectModel = mongoConnection.models.ProjectModel;

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

      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);

      if (stateId) {
        await stateModel.findByIdAndDelete(stateId);
      }
    });

    it('add a new state ', async () => {
      const stateInput = JSON.parse(JSON.stringify(inputData));
      stateInput.projects.push(projectDocument);
      const stateDocument = await stateModel.createState(stateInput);

      assert.isOk(stateDocument);
      assert.strictEqual(
        stateDocument.fileSystemHash,
        stateInput.fileSystemHash
      );
      assert.strictEqual(stateDocument.projects[0].name, projectDocument.name);

      stateId = stateDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a state ', async () => {
      assert.isOk(stateId);
      const state = await stateModel.getStateById(stateId);

      assert.isOk(state);
      assert.strictEqual(state._id?.toString(), stateId.toString());
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
        const document = await stateModel.getStateById(stateId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      stateId = null as unknown as ObjectId;
    });
  });
});
