// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {ReportModel} from '../../../mongoose/models/report';
import * as mocks from '../../../mongoose/mocks';
import {CommentModel} from '../../../mongoose/models/comment';
import {UserModel} from '../../../mongoose/models/user';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {ProjectModel} from '../../../mongoose/models/project';
import {IQueryResult} from '@glyphx/types';
import {databaseTypes} from '../../../../../../database';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/report', () => {
  context('reportIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the reportId exists', async () => {
      const reportId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: reportId});
      sandbox.replace(ReportModel, 'findById', findByIdStub);

      const result = await ReportModel.reportIdExists(reportId);

      assert.isTrue(result);
    });

    it('should return false if the reportId does not exist', async () => {
      const reportId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ReportModel, 'findById', findByIdStub);

      const result = await ReportModel.reportIdExists(reportId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const reportId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(ReportModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await ReportModel.reportIdExists(reportId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allReportIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the report ids exist', async () => {
      const reportIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedReportIds = reportIds.map(reportId => {
        return {
          _id: reportId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedReportIds);
      sandbox.replace(ReportModel, 'find', findStub);

      assert.isTrue(await ReportModel.allReportIdsExist(reportIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const reportIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedReportIds = [
        {
          _id: reportIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedReportIds);
      sandbox.replace(ReportModel, 'find', findStub);
      let errored = false;
      try {
        await ReportModel.allReportIdsExist(reportIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          reportIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const reportIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(ReportModel, 'find', findStub);
      let errored = false;
      try {
        await ReportModel.allReportIdsExist(reportIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will not throw an error when no unsafe fields are present', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', authorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await ReportModel.validateUpdateObject(
          mocks.MOCK_REPORT as unknown as Omit<
            Partial<databaseTypes.IReport>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', authorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await ReportModel.validateUpdateObject(
          mocks.MOCK_REPORT as unknown as Omit<
            Partial<databaseTypes.IReport>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(authorStub.calledOnce);
      assert.isTrue(workspaceStub.calledOnce);
    });

    it('will fail when the author does not exist.', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', authorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await ReportModel.validateUpdateObject(
          mocks.MOCK_REPORT as unknown as Omit<
            Partial<databaseTypes.IReport>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
    it('will fail when the workspace does not exist.', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', authorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(false);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await ReportModel.validateUpdateObject(
          mocks.MOCK_REPORT as unknown as Omit<
            Partial<databaseTypes.IReport>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', authorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await ReportModel.validateUpdateObject({
          ...mocks.MOCK_REPORT,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IReport>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', authorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await ReportModel.validateUpdateObject({
          ...mocks.MOCK_REPORT,
          createdAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IReport>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', authorStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);

      let errored = false;

      try {
        await ReportModel.validateUpdateObject({
          ...mocks.MOCK_REPORT,
          updatedAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IReport>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createReport', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a report document', async () => {
      sandbox.replace(
        ReportModel,
        'validateComments',
        sandbox.stub().resolves(mocks.MOCK_REPORT.comments)
      );
      sandbox.replace(
        ReportModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_REPORT.author)
      );
      sandbox.replace(
        ReportModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_REPORT.workspace)
      );
      sandbox.replace(
        ReportModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_REPORT.projects)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ReportModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(ReportModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ReportModel, 'getReportById', stub);

      const reportDocument = await ReportModel.createReport(mocks.MOCK_REPORT);

      assert.strictEqual(reportDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when the author validator throws one', async () => {
      sandbox.replace(
        ReportModel,
        'validateComments',
        sandbox.stub().resolves(mocks.MOCK_REPORT.comments)
      );
      sandbox.replace(
        ReportModel,
        'validateAuthor',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The author does not exist',
              'author ',
              {}
            )
          )
      );
      sandbox.replace(
        ReportModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_REPORT.workspace)
      );
      sandbox.replace(
        ReportModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_REPORT.projects)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ReportModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(ReportModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ReportModel, 'getReportById', stub);

      let errored = false;

      try {
        await ReportModel.createReport(mocks.MOCK_REPORT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will rethrow a DataValidationError when the workspace validator throws one', async () => {
      sandbox.replace(
        ReportModel,
        'validateComments',
        sandbox.stub().resolves(mocks.MOCK_REPORT.comments)
      );
      sandbox.replace(
        ReportModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_REPORT.author)
      );
      sandbox.replace(
        ReportModel,
        'validateWorkspace',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The workspace does not exist',
              'workspace ',
              {}
            )
          )
      );
      sandbox.replace(
        ReportModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_REPORT.projects)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ReportModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(ReportModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ReportModel, 'getReportById', stub);

      let errored = false;

      try {
        await ReportModel.createReport(mocks.MOCK_REPORT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        ReportModel,
        'validateComments',
        sandbox.stub().resolves(mocks.MOCK_REPORT.comments)
      );
      sandbox.replace(
        ReportModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_REPORT.author)
      );
      sandbox.replace(
        ReportModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_REPORT.workspace)
      );
      sandbox.replace(
        ReportModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_REPORT.projects)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ReportModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        ReportModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ReportModel, 'getReportById', stub);
      let hasError = false;
      try {
        await ReportModel.createReport(mocks.MOCK_REPORT);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        ReportModel,
        'validateComments',
        sandbox.stub().resolves(mocks.MOCK_REPORT.comments)
      );
      sandbox.replace(
        ReportModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_REPORT.author)
      );
      sandbox.replace(
        ReportModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_REPORT.workspace)
      );
      sandbox.replace(
        ReportModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_REPORT.projects)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(ReportModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ReportModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ReportModel, 'getReportById', stub);

      let hasError = false;
      try {
        await ReportModel.createReport(mocks.MOCK_REPORT);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        ReportModel,
        'validateComments',
        sandbox.stub().resolves(mocks.MOCK_REPORT.comments)
      );
      sandbox.replace(
        ReportModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_REPORT.author)
      );
      sandbox.replace(
        ReportModel,
        'validateWorkspace',
        sandbox.stub().resolves(mocks.MOCK_REPORT.workspace)
      );
      sandbox.replace(
        ReportModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_REPORT.projects)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ReportModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        ReportModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ReportModel, 'getReportById', stub);
      let hasError = false;
      try {
        await ReportModel.createReport(mocks.MOCK_REPORT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getReportById', () => {
    class MockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError = false) {
        this.mockData = input;
        this.throwError = throwError;
      }
      populate() {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a report document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_REPORT));
      sandbox.replace(ReportModel, 'findById', findByIdStub);

      const doc = await ReportModel.getReportById(
        mocks.MOCK_REPORT._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.comments[0] as any)?.__v);
      assert.isUndefined((doc.author as any)?.__v);
      assert.isUndefined((doc.workspace as any)?.__v);
      assert.isUndefined((doc.projects[0] as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_REPORT._id);
    });

    it('will throw a DataNotFoundError when the report does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ReportModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ReportModel.getReportById(
          mocks.MOCK_REPORT._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(
        new MockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(ReportModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ReportModel.getReportById(
          mocks.MOCK_REPORT._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryReports', () => {
    class MockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError = false) {
        this.mockData = input;
        this.throwError = throwError;
      }

      populate() {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const mockReports = [
      {
        ...mocks.MOCK_REPORT,
        _id: new mongoose.Types.ObjectId(),
        comments: [],
        author: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        projects: [],
      } as databaseTypes.IReport,
      {
        ...mocks.MOCK_REPORT,
        _id: new mongoose.Types.ObjectId(),
        comments: [],
        author: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        projects: [],
      } as databaseTypes.IReport,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered reports', async () => {
      sandbox.replace(
        ReportModel,
        'count',
        sandbox.stub().resolves(mockReports.length)
      );

      sandbox.replace(
        ReportModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockReports))
      );

      const results = await ReportModel.queryReports({});

      assert.strictEqual(results.numberOfItems, mockReports.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockReports.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.comments[0] as any)?.__v);
        assert.isUndefined((doc.author as any)?.__v);
        assert.isUndefined((doc.workspace as any)?.__v);
        assert.isUndefined((doc.projects[0] as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(ReportModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        ReportModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockReports))
      );

      let errored = false;
      try {
        await ReportModel.queryReports();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        ReportModel,
        'count',
        sandbox.stub().resolves(mockReports.length)
      );

      sandbox.replace(
        ReportModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockReports))
      );

      let errored = false;
      try {
        await ReportModel.queryReports({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        ReportModel,
        'count',
        sandbox.stub().resolves(mockReports.length)
      );

      sandbox.replace(
        ReportModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await ReportModel.queryReports({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateReportById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a report', async () => {
      const updateReport = {
        ...mocks.MOCK_REPORT,
        deletedAt: new Date(),
        comments: [],
        author: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        projects: [],
      } as unknown as databaseTypes.IReport;

      const reportId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ReportModel, 'updateOne', updateStub);

      const getReportStub = sandbox.stub();
      getReportStub.resolves({_id: reportId});
      sandbox.replace(ReportModel, 'getReportById', getReportStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ReportModel, 'validateUpdateObject', validateStub);

      const result = await ReportModel.updateReportById(reportId, updateReport);

      assert.strictEqual(result._id, reportId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getReportStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a report with references as ObjectIds', async () => {
      const updateReport = {
        ...mocks.MOCK_REPORT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IReport;

      const reportId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ReportModel, 'updateOne', updateStub);

      const getReportStub = sandbox.stub();
      getReportStub.resolves({_id: reportId});
      sandbox.replace(ReportModel, 'getReportById', getReportStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ReportModel, 'validateUpdateObject', validateStub);

      const result = await ReportModel.updateReportById(reportId, updateReport);

      assert.strictEqual(result._id, reportId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getReportStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the report does not exist', async () => {
      const updateReport = {
        ...mocks.MOCK_REPORT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IReport;

      const reportId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(ReportModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(ReportModel, 'validateUpdateObject', validateStub);

      const getReportStub = sandbox.stub();
      getReportStub.resolves({_id: reportId});
      sandbox.replace(ReportModel, 'getReportById', getReportStub);

      let errorred = false;
      try {
        await ReportModel.updateReportById(reportId, updateReport);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateReport = {
        ...mocks.MOCK_REPORT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IReport;

      const reportId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ReportModel, 'updateOne', updateStub);

      const getReportStub = sandbox.stub();
      getReportStub.resolves({_id: reportId});
      sandbox.replace(ReportModel, 'getReportById', getReportStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(ReportModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await ReportModel.updateReportById(reportId, updateReport);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateReport = {
        ...mocks.MOCK_REPORT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IReport;

      const reportId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(ReportModel, 'updateOne', updateStub);

      const getReportStub = sandbox.stub();
      getReportStub.resolves({_id: reportId});
      sandbox.replace(ReportModel, 'getReportById', getReportStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(ReportModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await ReportModel.updateReportById(reportId, updateReport);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a report document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a report', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ReportModel, 'deleteOne', deleteStub);

      const reportId = new mongoose.Types.ObjectId();

      await ReportModel.deleteReportById(reportId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the report does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(ReportModel, 'deleteOne', deleteStub);

      const reportId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ReportModel.deleteReportById(reportId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(ReportModel, 'deleteOne', deleteStub);

      const reportId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ReportModel.deleteReportById(reportId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});
