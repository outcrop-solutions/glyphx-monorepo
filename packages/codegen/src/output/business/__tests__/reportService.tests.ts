// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from '../../../../database';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from '@glyphx/database';
import {error} from '@glyphx/core';
import {reportService} from '../services';
import * as mocks from '../../database/mongoose/mocks';

describe('#services/report', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createReport', () => {
    it('will create a Report', async () => {
      const reportId = new mongooseTypes.ObjectId();
      const createdAtId = new mongooseTypes.ObjectId();
      const commentsId = new mongooseTypes.ObjectId();
      const authorId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const projectsId = new mongooseTypes.ObjectId();

      // createReport
      const createReportFromModelStub = sandbox.stub();
      createReportFromModelStub.resolves({
        ...mocks.MOCK_REPORT,
        _id: new mongooseTypes.ObjectId(),
        comments: [],
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        projects: [],
      } as unknown as databaseTypes.IReport);

      sandbox.replace(
        dbConnection.models.ReportModel,
        'createReport',
        createReportFromModelStub
      );

      const doc = await reportService.createReport({
        ...mocks.MOCK_REPORT,
        _id: new mongooseTypes.ObjectId(),
        comments: [],
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        projects: [],
      } as unknown as databaseTypes.IReport);

      assert.isTrue(createReportFromModelStub.calledOnce);
    });
    // report model fails
    it('will publish and rethrow an InvalidArgumentError when report model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createReport
      const createReportFromModelStub = sandbox.stub();
      createReportFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ReportModel,
        'createReport',
        createReportFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await reportService.createReport({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when report model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createReport
      const createReportFromModelStub = sandbox.stub();
      createReportFromModelStub.rejects(err);

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await reportService.createReport({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when report model throws it', async () => {
      const createReportFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createReportFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ReportModel,
        'createReport',
        createReportFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataValidationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await reportService.createReport({});
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when report model throws a DataOperationError', async () => {
      const createReportFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createReportFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ReportModel,
        'createReport',
        createReportFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await reportService.createReport({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when report model throws a UnexpectedError', async () => {
      const createReportFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(errMessage, 'mongodDb');

      createReportFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.ReportModel,
        'createReport',
        createReportFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.UnexpectedError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await reportService.createReport({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getReport', () => {
    it('should get a report by id', async () => {
      const reportId = new mongooseTypes.ObjectId();

      const getReportFromModelStub = sandbox.stub();
      getReportFromModelStub.resolves({
        _id: reportId,
      } as unknown as databaseTypes.IReport);
      sandbox.replace(
        dbConnection.models.ReportModel,
        'getReportById',
        getReportFromModelStub
      );

      const report = await reportService.getReport(reportId);
      assert.isOk(report);
      assert.strictEqual(report?._id?.toString(), reportId.toString());

      assert.isTrue(getReportFromModelStub.calledOnce);
    });
    it('should get a report by id when id is a string', async () => {
      const reportId = new mongooseTypes.ObjectId();

      const getReportFromModelStub = sandbox.stub();
      getReportFromModelStub.resolves({
        _id: reportId,
      } as unknown as databaseTypes.IReport);
      sandbox.replace(
        dbConnection.models.ReportModel,
        'getReportById',
        getReportFromModelStub
      );

      const report = await reportService.getReport(reportId.toString());
      assert.isOk(report);
      assert.strictEqual(report?._id?.toString(), reportId.toString());

      assert.isTrue(getReportFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the report cannot be found', async () => {
      const reportId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(errMessage, 'reportId', reportId);
      const getReportFromModelStub = sandbox.stub();
      getReportFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ReportModel,
        'getReportById',
        getReportFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const report = await reportService.getReport(reportId);
      assert.notOk(report);

      assert.isTrue(getReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const reportId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getReportById'
      );
      const getReportFromModelStub = sandbox.stub();
      getReportFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ReportModel,
        'getReportById',
        getReportFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await reportService.getReport(reportId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getReports', () => {
    it('should get reports by filter', async () => {
      const reportId = new mongooseTypes.ObjectId();
      const reportId2 = new mongooseTypes.ObjectId();
      const reportFilter = {_id: reportId};

      const queryReportsFromModelStub = sandbox.stub();
      queryReportsFromModelStub.resolves({
        results: [
          {
            ...mocks.MOCK_REPORT,
            _id: reportId,
            comments: [],
            author: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            workspace: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IWorkspace,
            projects: [],
          } as unknown as databaseTypes.IReport,
          {
            ...mocks.MOCK_REPORT,
            _id: reportId2,
            comments: [],
            author: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            workspace: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IWorkspace,
            projects: [],
          } as unknown as databaseTypes.IReport,
        ],
      } as unknown as databaseTypes.IReport[]);

      sandbox.replace(
        dbConnection.models.ReportModel,
        'queryReports',
        queryReportsFromModelStub
      );

      const reports = await reportService.getReports(reportFilter);
      assert.isOk(reports![0]);
      assert.strictEqual(reports![0]._id?.toString(), reportId.toString());
      assert.isTrue(queryReportsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the reports cannot be found', async () => {
      const reportName = 'reportName1';
      const reportFilter = {name: reportName};
      const errMessage = 'Cannot find the report';
      const err = new error.DataNotFoundError(errMessage, 'name', reportFilter);
      const getReportFromModelStub = sandbox.stub();
      getReportFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ReportModel,
        'queryReports',
        getReportFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const report = await reportService.getReports(reportFilter);
      assert.notOk(report);

      assert.isTrue(getReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const reportName = 'reportName1';
      const reportFilter = {name: reportName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getReportByEmail'
      );
      const getReportFromModelStub = sandbox.stub();
      getReportFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ReportModel,
        'queryReports',
        getReportFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await reportService.getReports(reportFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateReport', () => {
    it('will update a report', async () => {
      const reportId = new mongooseTypes.ObjectId();
      const updateReportFromModelStub = sandbox.stub();
      updateReportFromModelStub.resolves({
        ...mocks.MOCK_REPORT,
        _id: new mongooseTypes.ObjectId(),
        comments: [],
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        projects: [],
      } as unknown as databaseTypes.IReport);
      sandbox.replace(
        dbConnection.models.ReportModel,
        'updateReportById',
        updateReportFromModelStub
      );

      const report = await reportService.updateReport(reportId, {
        deletedAt: new Date(),
      });
      assert.isOk(report);
      assert.strictEqual(report._id, reportId);
      assert.isOk(report.deletedAt);
      assert.isTrue(updateReportFromModelStub.calledOnce);
    });
    it('will update a report when the id is a string', async () => {
      const reportId = new mongooseTypes.ObjectId();
      const updateReportFromModelStub = sandbox.stub();
      updateReportFromModelStub.resolves({
        ...mocks.MOCK_REPORT,
        _id: new mongooseTypes.ObjectId(),
        comments: [],
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        projects: [],
      } as unknown as databaseTypes.IReport);
      sandbox.replace(
        dbConnection.models.ReportModel,
        'updateReportById',
        updateReportFromModelStub
      );

      const report = await reportService.updateReport(reportId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(report);
      assert.strictEqual(report._id, reportId);
      assert.isOk(report.deletedAt);
      assert.isTrue(updateReportFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when report model throws it ', async () => {
      const reportId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateReportFromModelStub = sandbox.stub();
      updateReportFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ReportModel,
        'updateReportById',
        updateReportFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await reportService.updateReport(reportId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when report model throws it ', async () => {
      const reportId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateReportFromModelStub = sandbox.stub();
      updateReportFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ReportModel,
        'updateReportById',
        updateReportFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await reportService.updateReport(reportId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when report model throws a DataOperationError ', async () => {
      const reportId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateReportById'
      );
      const updateReportFromModelStub = sandbox.stub();
      updateReportFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.ReportModel,
        'updateReportById',
        updateReportFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await reportService.updateReport(reportId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateReportFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});
