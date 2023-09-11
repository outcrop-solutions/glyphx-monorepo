// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#StateModel', () => {
  context('test the crud functions of the state model', () => {
    const mongoConnection = new MongoDbConnection();
    const stateModel = mongoConnection.models.StateModel;
    let stateDocId: ObjectId;
    let stateDocId2: ObjectId;
    let createdById: ObjectId;
    let createdByDocument: any;
    let projectId: ObjectId;
    let projectDocument: any;
    let workspaceId: ObjectId;
    let workspaceDocument: any;

    before(async () => {
      await mongoConnection.init();
      const createdByModel = mongoConnection.models.UserModel;
      const savedCreatedByDocument = await createdByModel.create(
        [mocks.MOCK_USER],
        {
          validateBeforeSave: false,
        }
      );
      createdById = savedCreatedByDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(createdById);
      const projectModel = mongoConnection.models.ProjectModel;
      const savedProjectDocument = await projectModel.create(
        [mocks.MOCK_PROJECT],
        {
          validateBeforeSave: false,
        }
      );
      projectId = savedProjectDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(projectId);
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const savedWorkspaceDocument = await workspaceModel.create(
        [mocks.MOCK_WORKSPACE],
        {
          validateBeforeSave: false,
        }
      );
      workspaceId = savedWorkspaceDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(workspaceId);
    });

    after(async () => {
      if (stateDocId) {
        await stateModel.findByIdAndDelete(stateDocId);
      }

      if (stateDocId2) {
        await stateModel.findByIdAndDelete(stateDocId2);
      }
      const createdByModel = mongoConnection.models.UserModel;
      await createdByModel.findByIdAndDelete(createdById);
      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);
    });

    it('add a new state ', async () => {
      const stateInput = JSON.parse(JSON.stringify(mocks.MOCK_STATE));

      stateInput.createdBy = createdByDocument;
      stateInput.project = projectDocument;
      stateInput.workspace = workspaceDocument;

      const stateDocument = await stateModel.createState(stateInput);

      assert.isOk(stateDocument);
      assert.strictEqual(
        Object.keys(stateDocument)[1],
        Object.keys(stateInput)[1]
      );

      stateDocId = stateDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a state', async () => {
      assert.isOk(stateDocId);
      const state = await stateModel.getStateById(stateDocId);

      assert.isOk(state);
      assert.strictEqual(state._id?.toString(), stateDocId.toString());
    });

    it('modify a state', async () => {
      assert.isOk(stateDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await stateModel.updateStateById(
        stateDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple states without a filter', async () => {
      assert.isOk(stateDocId);
      const stateInput = JSON.parse(JSON.stringify(mocks.MOCK_STATE));

      const stateDocument = await stateModel.createState(stateInput);

      assert.isOk(stateDocument);

      stateDocId2 = stateDocument._id as mongooseTypes.ObjectId;

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
      assert.isOk(stateDocId2);
      const results = await stateModel.queryStates({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(stateDocId2);
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

    it('remove a state', async () => {
      assert.isOk(stateDocId);
      await stateModel.deleteStateById(stateDocId);
      let errored = false;
      try {
        await stateModel.getStateById(stateDocId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      stateDocId = null as unknown as ObjectId;
    });
  });
});
