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

describe('#WorkspaceModel', () => {
  context('test the crud functions of the workspace model', () => {
    const mongoConnection = new MongoDbConnection();
    const workspaceModel = mongoConnection.models.WorkspaceModel;
    let workspaceDocId: ObjectId;
    let workspaceDocId2: ObjectId;
    let creatorId: ObjectId;
    let creatorDocument: any;

    before(async () => {
      await mongoConnection.init();
      const creatorModel = mongoConnection.models.UserModel;
      const savedCreatorDocument = await creatorModel.create(
        [mocks.MOCK_USER],
        {
          validateBeforeSave: false,
        }
      );
      creatorId = savedCreatorDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(creatorId);
    });

    after(async () => {
      if (workspaceDocId) {
        await workspaceModel.findByIdAndDelete(workspaceDocId);
      }

      if (workspaceDocId2) {
        await workspaceModel.findByIdAndDelete(workspaceDocId2);
      }
      const creatorModel = mongoConnection.models.UserModel;
      await creatorModel.findByIdAndDelete(creatorId);
    });

    it('add a new workspace ', async () => {
      const workspaceInput = JSON.parse(JSON.stringify(mocks.MOCK_WORKSPACE));

      workspaceInput.creator = creatorDocument;

      const workspaceDocument =
        await workspaceModel.createWorkspace(workspaceInput);

      assert.isOk(workspaceDocument);
      assert.strictEqual(
        Object.keys(workspaceDocument)[1],
        Object.keys(workspaceInput)[1]
      );

      workspaceDocId = workspaceDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a workspace', async () => {
      assert.isOk(workspaceDocId);
      const workspace = await workspaceModel.getWorkspaceById(workspaceDocId);

      assert.isOk(workspace);
      assert.strictEqual(workspace._id?.toString(), workspaceDocId.toString());
    });

    it('modify a workspace', async () => {
      assert.isOk(workspaceDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await workspaceModel.updateWorkspaceById(
        workspaceDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple workspaces without a filter', async () => {
      assert.isOk(workspaceDocId);
      const workspaceInput = JSON.parse(JSON.stringify(mocks.MOCK_WORKSPACE));

      const workspaceDocument =
        await workspaceModel.createWorkspace(workspaceInput);

      assert.isOk(workspaceDocument);

      workspaceDocId2 = workspaceDocument._id as mongooseTypes.ObjectId;

      const workspaces = await workspaceModel.queryWorkspaces();
      assert.isArray(workspaces.results);
      assert.isAtLeast(workspaces.numberOfItems, 2);
      const expectedDocumentCount =
        workspaces.numberOfItems <= workspaces.itemsPerPage
          ? workspaces.numberOfItems
          : workspaces.itemsPerPage;
      assert.strictEqual(workspaces.results.length, expectedDocumentCount);
    });

    it('Get multiple workspaces with a filter', async () => {
      assert.isOk(workspaceDocId2);
      const results = await workspaceModel.queryWorkspaces({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(workspaceDocId2);
      const results = await workspaceModel.queryWorkspaces({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await workspaceModel.queryWorkspaces({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a workspace', async () => {
      assert.isOk(workspaceDocId);
      await workspaceModel.deleteWorkspaceById(workspaceDocId);
      let errored = false;
      try {
        await workspaceModel.getWorkspaceById(workspaceDocId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      workspaceDocId = null as unknown as ObjectId;
    });
  });
});
