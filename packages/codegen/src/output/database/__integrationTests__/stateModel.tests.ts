// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#StateModel', () => {
  context('test the crud functions of the state model', () => {
    const mongoConnection = new MongoDbConnection();
    const stateModel = mongoConnection.models.StateModel;
    let stateId: ObjectId;
    let memberId: ObjectId;
    let stateId2: ObjectId;
    let workspaceId: ObjectId;
    let stateTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let stateTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const stateTemplateModel = mongoConnection.models.StateTemplateModel;

      await workspaceModel.create([INPUT_WORKSPACE], {
        validateBeforeSave: false,
      });
      const savedWorkspaceDocument = await workspaceModel
        .findOne({name: INPUT_WORKSPACE.name})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;
      workspaceDocument = savedWorkspaceDocument;
      assert.isOk(workspaceId);

      await memberModel.create([INPUT_MEMBER], {
        validateBeforeSave: false,
      });
      const savedMemberDocument = await memberModel
        .findOne({email: INPUT_MEMBER.email})
        .lean();
      memberId = savedMemberDocument?._id as mongooseTypes.ObjectId;
      memberDocument = savedMemberDocument;
      assert.isOk(memberId);

      await stateTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedStateTemplateDocument = await stateTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      stateTemplateId =
        savedStateTemplateDocument?._id as mongooseTypes.ObjectId;

      stateTemplateDocument = savedStateTemplateDocument;

      assert.isOk(stateTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const stateTemplateModel = mongoConnection.models.StateTemplateModel;
      await stateTemplateModel.findByIdAndDelete(stateTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (stateId) {
        await stateModel.findByIdAndDelete(stateId);
      }

      if (stateId2) {
        await stateModel.findByIdAndDelete(stateId2);
      }
    });

    it('add a new state ', async () => {
      const stateInput = JSON.parse(JSON.stringify(INPUT_DATA));
      stateInput.workspace = workspaceDocument;
      stateInput.template = stateTemplateDocument;

      const stateDocument = await stateModel.createState(stateInput);

      assert.isOk(stateDocument);
      assert.strictEqual(stateDocument.name, stateInput.name);
      assert.strictEqual(
        stateDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      stateId = stateDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a state', async () => {
      assert.isOk(stateId);
      const state = await stateModel.getStateById(stateId);

      assert.isOk(state);
      assert.strictEqual(state._id?.toString(), stateId.toString());
    });

    it('modify a state', async () => {
      assert.isOk(stateId);
      const input = {description: 'a modified description'};
      const updatedDocument = await stateModel.updateStateById(stateId, input);
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple states without a filter', async () => {
      assert.isOk(stateId);
      const stateInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      stateInput.workspace = workspaceDocument;
      stateInput.type = stateTemplateDocument;

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
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
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
