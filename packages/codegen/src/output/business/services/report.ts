// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../database';
import {error, constants} from '@glyphx/core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class ReportService {
  public static async getReport(
    reportId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IReport | null> {
    try {
      const id =
        reportId instanceof mongooseTypes.ObjectId
          ? reportId
          : new mongooseTypes.ObjectId(reportId);
      const report = await mongoDbConnection.models.ReportModel.getReportById(
        id
      );
      return report;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the report. See the inner error for additional details',
          'report',
          'getReport',
          {id: reportId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getReports(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IReport[] | null> {
    try {
      const reports = await mongoDbConnection.models.ReportModel.queryReports(
        filter
      );
      return reports?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting reports. See the inner error for additional details',
          'reports',
          'getReports',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createReport(
    data: Partial<databaseTypes.IReport>
  ): Promise<databaseTypes.IReport> {
    try {
      // create report
      const report = await mongoDbConnection.models.ReportModel.createReport(
        data
      );

      return report;
    } catch (err: any) {
      if (
        err instanceof error.InvalidOperationError ||
        err instanceof error.InvalidArgumentError ||
        err instanceof error.DataValidationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while creating the report. See the inner error for additional details',
          'report',
          'createReport',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateReport(
    reportId: mongooseTypes.ObjectId | string,
    data: Partial<
      Omit<databaseTypes.IReport, '_id' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<databaseTypes.IReport> {
    try {
      const id =
        reportId instanceof mongooseTypes.ObjectId
          ? reportId
          : new mongooseTypes.ObjectId(reportId);
      const report =
        await mongoDbConnection.models.ReportModel.updateReportById(id, {
          ...data,
        });
      return report;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateReport',
          {reportId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteReport(
    reportId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IReport> {
    try {
      const id =
        reportId instanceof mongooseTypes.ObjectId
          ? reportId
          : new mongooseTypes.ObjectId(reportId);
      const report =
        await mongoDbConnection.models.ReportModel.updateReportById(id, {
          deletedAt: new Date(),
        });
      return report;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateReport',
          {reportId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addComments(
    reportId: mongooseTypes.ObjectId | string,
    comments: (databaseTypes.IComment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> {
    try {
      const id =
        reportId instanceof mongooseTypes.ObjectId
          ? reportId
          : new mongooseTypes.ObjectId(reportId);
      const updatedReport =
        await mongoDbConnection.models.ReportModel.addComments(id, comments);

      return updatedReport;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding comments to the report. See the inner error for additional details',
          'report',
          'addComments',
          {id: reportId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeComments(
    reportId: mongooseTypes.ObjectId | string,
    comments: (databaseTypes.IComment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> {
    try {
      const id =
        reportId instanceof mongooseTypes.ObjectId
          ? reportId
          : new mongooseTypes.ObjectId(reportId);
      const updatedReport =
        await mongoDbConnection.models.CommentsModel.removeComments(
          id,
          comments
        );

      return updatedReport;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  comments from the report. See the inner error for additional details',
          'report',
          'removeComments',
          {id: reportId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addAuthor(
    reportId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> {
    try {
      const id =
        reportId instanceof mongooseTypes.ObjectId
          ? reportId
          : new mongooseTypes.ObjectId(reportId);
      const updatedReport =
        await mongoDbConnection.models.ReportModel.addAuthor(id, user);

      return updatedReport;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the report. See the inner error for additional details',
          'report',
          'addAuthor',
          {id: reportId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeAuthor(
    reportId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> {
    try {
      const id =
        reportId instanceof mongooseTypes.ObjectId
          ? reportId
          : new mongooseTypes.ObjectId(reportId);
      const updatedReport =
        await mongoDbConnection.models.AuthorModel.removeAuthor(id, user);

      return updatedReport;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the report. See the inner error for additional details',
          'report',
          'removeAuthor',
          {id: reportId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addWorkspace(
    reportId: mongooseTypes.ObjectId | string,
    workspace: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> {
    try {
      const id =
        reportId instanceof mongooseTypes.ObjectId
          ? reportId
          : new mongooseTypes.ObjectId(reportId);
      const updatedReport =
        await mongoDbConnection.models.ReportModel.addWorkspace(id, workspace);

      return updatedReport;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding workspace to the report. See the inner error for additional details',
          'report',
          'addWorkspace',
          {id: reportId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeWorkspace(
    reportId: mongooseTypes.ObjectId | string,
    workspace: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> {
    try {
      const id =
        reportId instanceof mongooseTypes.ObjectId
          ? reportId
          : new mongooseTypes.ObjectId(reportId);
      const updatedReport =
        await mongoDbConnection.models.WorkspaceModel.removeWorkspace(
          id,
          workspace
        );

      return updatedReport;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  workspace from the report. See the inner error for additional details',
          'report',
          'removeWorkspace',
          {id: reportId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addProjects(
    reportId: mongooseTypes.ObjectId | string,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> {
    try {
      const id =
        reportId instanceof mongooseTypes.ObjectId
          ? reportId
          : new mongooseTypes.ObjectId(reportId);
      const updatedReport =
        await mongoDbConnection.models.ReportModel.addProjects(id, projects);

      return updatedReport;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding projects to the report. See the inner error for additional details',
          'report',
          'addProjects',
          {id: reportId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeProjects(
    reportId: mongooseTypes.ObjectId | string,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> {
    try {
      const id =
        reportId instanceof mongooseTypes.ObjectId
          ? reportId
          : new mongooseTypes.ObjectId(reportId);
      const updatedReport =
        await mongoDbConnection.models.ProjectsModel.removeProjects(
          id,
          projects
        );

      return updatedReport;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  projects from the report. See the inner error for additional details',
          'report',
          'removeProjects',
          {id: reportId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
