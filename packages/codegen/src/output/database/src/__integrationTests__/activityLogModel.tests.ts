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

describe('#ActivityLogModel', () => {
  context('test the crud functions of the activityLog model', () => {
    const mongoConnection = new MongoDbConnection();
    const activityLogModel = mongoConnection.models.ActivityLogModel;
    let activityLogDocId: ObjectId;
    let activityLogDocId2: ObjectId;
    let actorId: ObjectId;
    let actorDocument: any;
    let workspaceId: ObjectId;
    let workspaceDocument: any;
    let projectId: ObjectId;
    let projectDocument: any;
    let userAgentId: ObjectId;
    let userAgentDocument: any;

    before(async () => {
      await mongoConnection.init();
      const actorModel = mongoConnection.models.UserModel;
      const savedActorDocument = await actorModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      actorId = savedActorDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(actorId);
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const savedWorkspaceDocument = await workspaceModel.create(
        [mocks.MOCK_WORKSPACE],
        {
          validateBeforeSave: false,
        }
      );
      workspaceId = savedWorkspaceDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(workspaceId);
      const projectModel = mongoConnection.models.ProjectModel;
      const savedProjectDocument = await projectModel.create(
        [mocks.MOCK_PROJECT],
        {
          validateBeforeSave: false,
        }
      );
      projectId = savedProjectDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(projectId);
      const userAgentModel = mongoConnection.models.UserAgentModel;
      const savedUserAgentDocument = await userAgentModel.create(
        [mocks.MOCK_USERAGENT],
        {
          validateBeforeSave: false,
        }
      );
      userAgentId = savedUserAgentDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(userAgentId);
    });

    after(async () => {
      if (activityLogDocId) {
        await activityLogModel.findByIdAndDelete(activityLogDocId);
      }

      if (activityLogDocId2) {
        await activityLogModel.findByIdAndDelete(activityLogDocId2);
      }
      const actorModel = mongoConnection.models.UserModel;
      await actorModel.findByIdAndDelete(actorId);
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);
      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);
      const userAgentModel = mongoConnection.models.UserAgentModel;
      await userAgentModel.findByIdAndDelete(userAgentId);
    });

    it('add a new activityLog ', async () => {
      const activityLogInput = JSON.parse(
        JSON.stringify(mocks.MOCK_ACTIVITYLOG)
      );

      activityLogInput.actor = actorDocument;
      activityLogInput.workspace = workspaceDocument;
      activityLogInput.project = projectDocument;
      activityLogInput.userAgent = userAgentDocument;

      const activityLogDocument =
        await activityLogModel.createActivityLog(activityLogInput);

      assert.isOk(activityLogDocument);
      assert.strictEqual(
        Object.keys(activityLogDocument)[1],
        Object.keys(activityLogInput)[1]
      );

      activityLogDocId = activityLogDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a activityLog', async () => {
      assert.isOk(activityLogDocId);
      const activityLog =
        await activityLogModel.getActivityLogById(activityLogDocId);

      assert.isOk(activityLog);
      assert.strictEqual(
        activityLog._id?.toString(),
        activityLogDocId.toString()
      );
    });

    it('modify a activityLog', async () => {
      assert.isOk(activityLogDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await activityLogModel.updateActivityLogById(
        activityLogDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple activityLogs without a filter', async () => {
      assert.isOk(activityLogDocId);
      const activityLogInput = JSON.parse(
        JSON.stringify(mocks.MOCK_ACTIVITYLOG)
      );

      const activityLogDocument =
        await activityLogModel.createActivityLog(activityLogInput);

      assert.isOk(activityLogDocument);

      activityLogDocId2 = activityLogDocument._id as mongooseTypes.ObjectId;

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
      assert.isOk(activityLogDocId2);
      const results = await activityLogModel.queryActivityLogs({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(activityLogDocId2);
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
      assert.isOk(activityLogDocId);
      await activityLogModel.deleteActivityLogById(activityLogDocId);
      let errored = false;
      try {
        await activityLogModel.getActivityLogById(activityLogDocId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      activityLogDocId = null as unknown as ObjectId;
    });
  });
});
