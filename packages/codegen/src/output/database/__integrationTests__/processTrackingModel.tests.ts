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

describe('#ProcessTrackingModel', () => {
  context('test the crud functions of the processTracking model', () => {
    const mongoConnection = new MongoDbConnection();
    const processTrackingModel = mongoConnection.models.ProcessTrackingModel;
    let processTrackingId: ObjectId;
    let memberId: ObjectId;
    let processTrackingId2: ObjectId;
    let workspaceId: ObjectId;
    let processTrackingTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let processTrackingTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const processTrackingTemplateModel =
        mongoConnection.models.ProcessTrackingTemplateModel;

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

      await processTrackingTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedProcessTrackingTemplateDocument =
        await processTrackingTemplateModel
          .findOne({name: INPUT_PROJECT_TYPE.name})
          .lean();
      processTrackingTemplateId =
        savedProcessTrackingTemplateDocument?._id as mongooseTypes.ObjectId;

      processTrackingTemplateDocument = savedProcessTrackingTemplateDocument;

      assert.isOk(processTrackingTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const processTrackingTemplateModel =
        mongoConnection.models.ProcessTrackingTemplateModel;
      await processTrackingTemplateModel.findByIdAndDelete(
        processTrackingTemplateId
      );

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (processTrackingId) {
        await processTrackingModel.findByIdAndDelete(processTrackingId);
      }

      if (processTrackingId2) {
        await processTrackingModel.findByIdAndDelete(processTrackingId2);
      }
    });

    it('add a new processTracking ', async () => {
      const processTrackingInput = JSON.parse(JSON.stringify(INPUT_DATA));
      processTrackingInput.workspace = workspaceDocument;
      processTrackingInput.template = processTrackingTemplateDocument;

      const processTrackingDocument =
        await processTrackingModel.createProcessTracking(processTrackingInput);

      assert.isOk(processTrackingDocument);
      assert.strictEqual(
        processTrackingDocument.name,
        processTrackingInput.name
      );
      assert.strictEqual(
        processTrackingDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      processTrackingId = processTrackingDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a processTracking', async () => {
      assert.isOk(processTrackingId);
      const processTracking = await processTrackingModel.getProcessTrackingById(
        processTrackingId
      );

      assert.isOk(processTracking);
      assert.strictEqual(
        processTracking._id?.toString(),
        processTrackingId.toString()
      );
    });

    it('modify a processTracking', async () => {
      assert.isOk(processTrackingId);
      const input = {description: 'a modified description'};
      const updatedDocument =
        await processTrackingModel.updateProcessTrackingById(
          processTrackingId,
          input
        );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple processTrackings without a filter', async () => {
      assert.isOk(processTrackingId);
      const processTrackingInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      processTrackingInput.workspace = workspaceDocument;
      processTrackingInput.type = processTrackingTemplateDocument;

      const processTrackingDocument =
        await processTrackingModel.createProcessTracking(processTrackingInput);

      assert.isOk(processTrackingDocument);

      processTrackingId2 =
        processTrackingDocument._id as mongooseTypes.ObjectId;

      const processTrackings =
        await processTrackingModel.queryProcessTrackings();
      assert.isArray(processTrackings.results);
      assert.isAtLeast(processTrackings.numberOfItems, 2);
      const expectedDocumentCount =
        processTrackings.numberOfItems <= processTrackings.itemsPerPage
          ? processTrackings.numberOfItems
          : processTrackings.itemsPerPage;
      assert.strictEqual(
        processTrackings.results.length,
        expectedDocumentCount
      );
    });

    it('Get multiple processTrackings with a filter', async () => {
      assert.isOk(processTrackingId2);
      const results = await processTrackingModel.queryProcessTrackings({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(processTrackingId2);
      const results = await processTrackingModel.queryProcessTrackings(
        {},
        0,
        1
      );
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await processTrackingModel.queryProcessTrackings(
        {},
        1,
        1
      );
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a processTracking', async () => {
      assert.isOk(processTrackingId);
      await processTrackingModel.deleteProcessTrackingById(processTrackingId);
      let errored = false;
      try {
        await processTrackingModel.getProcessTrackingById(processTrackingId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      processTrackingId = null as unknown as ObjectId;
    });
  });
});
