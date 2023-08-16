// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from '../../../../database';
import * as mocks from '../../database/mongoose/mocks';
import {reportService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_REPORT);

describe('#ReportService', () => {
  context('test the functions of the report service', () => {
    const mongoConnection = new MongoDbConnection();
    const reportModel = mongoConnection.models.ReportModel;
    let reportId: ObjectId;

    const authorModel = mongoConnection.models.UserModel;
    let authorId: ObjectId;
    const workspaceModel = mongoConnection.models.WorkspaceModel;
    let workspaceId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const reportDocument = await reportModel.createReport(
        mocks.MOCK_REPORT as unknown as databaseTypes.IReport
      );
      reportId = reportDocument._id as unknown as mongooseTypes.ObjectId;

      const savedAuthorDocument = await authorModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      authorId = savedAuthorDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(authorId);

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
      if (reportId) {
        await reportModel.findByIdAndDelete(reportId);
      }
      if (authorId) {
        await authorModel.findByIdAndDelete(authorId);
      }
      if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }
    });

    it('will retreive our report from the database', async () => {
      const report = await reportService.getReport(reportId);
      assert.isOk(report);
    });

    // updates and deletes
    it('will update our report', async () => {
      assert.isOk(reportId);
      const updatedReport = await reportService.updateReport(reportId, {
        deletedAt: new Date(),
      });
      assert.isOk(updatedReport.deletedAt);

      const savedReport = await reportService.getReport(reportId);

      assert.isOk(savedReport!.deletedAt);
    });
  });
});
