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

describe('#ActivityLogModel', () => {
  context('test the crud functions of the activityLog model', () => {
    const mongoConnection = new MongoDbConnection();
    const activityLogModel = mongoConnection.models.ActivityLogModel;
    let activityLogId: ObjectId;
    let memberId: ObjectId;
    let activityLogId2: ObjectId;
    let workspaceId: ObjectId;
    let activityLogTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let activityLogTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const activityLogTemplateModel =
        mongoConnection.models.ActivityLogTemplateModel;

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

      await activityLogTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedActivityLogTemplateDocument = await activityLogTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      activityLogTemplateId =
        savedActivityLogTemplateDocument?._id as mongooseTypes.ObjectId;

      activityLogTemplateDocument = savedActivityLogTemplateDocument;

      assert.isOk(activityLogTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const activityLogTemplateModel =
        mongoConnection.models.ActivityLogTemplateModel;
      await activityLogTemplateModel.findByIdAndDelete(activityLogTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (activityLogId) {
        await activityLogModel.findByIdAndDelete(activityLogId);
      }

      if (activityLogId2) {
        await activityLogModel.findByIdAndDelete(activityLogId2);
      }
    });

    it('add a new activityLog ', async () => {
      const activityLogInput = JSON.parse(JSON.stringify(INPUT_DATA));
      activityLogInput.workspace = workspaceDocument;
      activityLogInput.template = activityLogTemplateDocument;

      const activityLogDocument = await activityLogModel.createActivityLog(
        activityLogInput
      );

      assert.isOk(activityLogDocument);
      assert.strictEqual(activityLogDocument.name, activityLogInput.name);
      assert.strictEqual(
        activityLogDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      activityLogId = activityLogDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a activityLog', async () => {
      assert.isOk(activityLogId);
      const activityLog = await activityLogModel.getActivityLogById(
        activityLogId
      );

      assert.isOk(activityLog);
      assert.strictEqual(activityLog._id?.toString(), activityLogId.toString());
    });

    it('modify a activityLog', async () => {
      assert.isOk(activityLogId);
      const input = {description: 'a modified description'};
      const updatedDocument = await activityLogModel.updateActivityLogById(
        activityLogId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple activityLogs without a filter', async () => {
      assert.isOk(activityLogId);
      const activityLogInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      activityLogInput.workspace = workspaceDocument;
      activityLogInput.type = activityLogTemplateDocument;

      const activityLogDocument = await activityLogModel.createActivityLog(
        activityLogInput
      );

      assert.isOk(activityLogDocument);

      activityLogId2 = activityLogDocument._id as mongooseTypes.ObjectId;

      const activityLogs = await activityLogModel.queryActivityLogs();
      assert.isArray(activityLogs.results);
      assert.isAtLeast(activityLogs.numberOfItems, 2);
      const expectedDocumentCount =
        activityLogs.numberOfItems <= activityLogs.itemsPerPage
          ? activityLogs.numberOfItems
          : activityLogs.itemsPerPage;
      assert.strictEqual(activityLogs.results.length, expectedDocumentCount);
    });

    it('Get multiple activityLogs with a filter', async () => {
      assert.isOk(activityLogId2);
      const results = await activityLogModel.queryActivityLogs({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(activityLogId2);
      const results = await activityLogModel.queryActivityLogs({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await activityLogModel.queryActivityLogs({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a activityLog', async () => {
      assert.isOk(activityLogId);
      await activityLogModel.deleteActivityLogById(activityLogId);
      let errored = false;
      try {
        await activityLogModel.getActivityLogById(activityLogId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      activityLogId = null as unknown as ObjectId;
    });
  });
});
