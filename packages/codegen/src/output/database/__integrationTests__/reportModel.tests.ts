// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#ReportModel', () => {
  context('test the crud functions of the report model', () => {
    const mongoConnection = new MongoDbConnection();
    const reportModel = mongoConnection.models.ReportModel;
    let reportDocId: ObjectId;
    let reportDocId2: ObjectId;
    let authorId: ObjectId;
    let authorDocument: any;
    let workspaceId: ObjectId;
    let workspaceDocument: any;

    before(async () => {
      await mongoConnection.init();
      const authorModel = mongoConnection.models.UserModel;
      const savedAuthorDocument = await authorModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      authorId = savedAuthorDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(authorId);
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
      if (reportDocId) {
        await reportModel.findByIdAndDelete(reportDocId);
      }

      if (reportDocId2) {
        await reportModel.findByIdAndDelete(reportDocId2);
      }
      const authorModel = mongoConnection.models.UserModel;
      await authorModel.findByIdAndDelete(authorId);
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);
    });

    it('add a new report ', async () => {
      const reportInput = JSON.parse(JSON.stringify(mocks.MOCK_REPORT));

      reportInput.author = authorDocument;
      reportInput.workspace = workspaceDocument;

      const reportDocument = await reportModel.createReport(reportInput);

      assert.isOk(reportDocument);
      assert.strictEqual(
        Object.keys(reportDocument)[1],
        Object.keys(reportInput)[1]
      );

      reportDocId = reportDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a report', async () => {
      assert.isOk(reportDocId);
      const report = await reportModel.getReportById(reportDocId);

      assert.isOk(report);
      assert.strictEqual(report._id?.toString(), reportDocId.toString());
    });

    it('modify a report', async () => {
      assert.isOk(reportDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await reportModel.updateReportById(
        reportDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple reports without a filter', async () => {
      assert.isOk(reportDocId);
      const reportInput = JSON.parse(JSON.stringify(mocks.MOCK_REPORT));

      const reportDocument = await reportModel.createReport(reportInput);

      assert.isOk(reportDocument);

      reportDocId2 = reportDocument._id as mongooseTypes.ObjectId;

      const reports = await reportModel.queryReports();
      assert.isArray(reports.results);
      assert.isAtLeast(reports.numberOfItems, 2);
      const expectedDocumentCount =
        reports.numberOfItems <= reports.itemsPerPage
          ? reports.numberOfItems
          : reports.itemsPerPage;
      assert.strictEqual(reports.results.length, expectedDocumentCount);
    });

    it('Get multiple reports with a filter', async () => {
      assert.isOk(reportDocId2);
      const results = await reportModel.queryReports({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(reportDocId2);
      const results = await reportModel.queryReports({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await reportModel.queryReports({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a report', async () => {
      assert.isOk(reportDocId);
      await reportModel.deleteReportById(reportDocId);
      let errored = false;
      try {
        await reportModel.getReportById(reportDocId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      reportDocId = null as unknown as ObjectId;
    });
  });
});
