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

describe('#WorkspaceModel', () => {
  context('test the crud functions of the workspace model', () => {
    const mongoConnection = new MongoDbConnection();
    const workspaceModel = mongoConnection.models.WorkspaceModel;
    let workspaceId: ObjectId;
    let memberId: ObjectId;
    let workspaceId2: ObjectId;
    let workspaceId: ObjectId;
    let workspaceTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let workspaceTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const workspaceTemplateModel =
        mongoConnection.models.WorkspaceTemplateModel;

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

      await workspaceTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedWorkspaceTemplateDocument = await workspaceTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      workspaceTemplateId =
        savedWorkspaceTemplateDocument?._id as mongooseTypes.ObjectId;

      workspaceTemplateDocument = savedWorkspaceTemplateDocument;

      assert.isOk(workspaceTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const workspaceTemplateModel =
        mongoConnection.models.WorkspaceTemplateModel;
      await workspaceTemplateModel.findByIdAndDelete(workspaceTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }

      if (workspaceId2) {
        await workspaceModel.findByIdAndDelete(workspaceId2);
      }
    });

    it('add a new workspace ', async () => {
      const workspaceInput = JSON.parse(JSON.stringify(INPUT_DATA));
      workspaceInput.workspace = workspaceDocument;
      workspaceInput.template = workspaceTemplateDocument;

      const workspaceDocument = await workspaceModel.createWorkspace(
        workspaceInput
      );

      assert.isOk(workspaceDocument);
      assert.strictEqual(workspaceDocument.name, workspaceInput.name);
      assert.strictEqual(
        workspaceDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      workspaceId = workspaceDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a workspace', async () => {
      assert.isOk(workspaceId);
      const workspace = await workspaceModel.getWorkspaceById(workspaceId);

      assert.isOk(workspace);
      assert.strictEqual(workspace._id?.toString(), workspaceId.toString());
    });

    it('modify a workspace', async () => {
      assert.isOk(workspaceId);
      const input = {description: 'a modified description'};
      const updatedDocument = await workspaceModel.updateWorkspaceById(
        workspaceId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple workspaces without a filter', async () => {
      assert.isOk(workspaceId);
      const workspaceInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      workspaceInput.workspace = workspaceDocument;
      workspaceInput.type = workspaceTemplateDocument;

      const workspaceDocument = await workspaceModel.createWorkspace(
        workspaceInput
      );

      assert.isOk(workspaceDocument);

      workspaceId2 = workspaceDocument._id as mongooseTypes.ObjectId;

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
      assert.isOk(workspaceId2);
      const results = await workspaceModel.queryWorkspaces({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(workspaceId2);
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
      assert.isOk(workspaceId);
      await workspaceModel.deleteWorkspaceById(workspaceId);
      let errored = false;
      try {
        await workspaceModel.getWorkspaceById(workspaceId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      workspaceId = null as unknown as ObjectId;
    });
  });
});
