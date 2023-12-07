// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IActivityLogCreateInput} from 'database/src/mongoose/interfaces';

export class ActivityLogService {
  public static async getActivityLog(activityLogId: string): Promise<databaseTypes.IActivityLog | null> {
    try {
      const activityLog = await mongoDbConnection.models.ActivityLogModel.getActivityLogById(activityLogId);
      return activityLog;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the activityLog. See the inner error for additional details',
          'activityLog',
          'getActivityLog',
          {id: activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getActivityLogs(filter?: Record<string, unknown>): Promise<databaseTypes.IActivityLog[] | null> {
    try {
      const activityLogs = await mongoDbConnection.models.ActivityLogModel.queryActivityLogs(filter);
      return activityLogs?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting activityLogs. See the inner error for additional details',
          'activityLogs',
          'getActivityLogs',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createActivityLog(
    data: Partial<databaseTypes.IActivityLog>
  ): Promise<databaseTypes.IActivityLog> {
    try {
      // create activityLog
      const activityLog = await mongoDbConnection.models.ActivityLogModel.createActivityLog(
        data as IActivityLogCreateInput
      );

      return activityLog;
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
          'An unexpected error occurred while creating the activityLog. See the inner error for additional details',
          'activityLog',
          'createActivityLog',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateActivityLog(
    activityLogId: string,
    data: Partial<Omit<databaseTypes.IActivityLog, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const activityLog = await mongoDbConnection.models.ActivityLogModel.updateActivityLogById(activityLogId, {
        ...data,
      });
      return activityLog;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateActivityLog',
          {activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteActivityLog(activityLogId: string): Promise<databaseTypes.IActivityLog> {
    try {
      const activityLog = await mongoDbConnection.models.ActivityLogModel.updateActivityLogById(activityLogId, {
        deletedAt: new Date(),
      });
      return activityLog;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateActivityLog',
          {activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addActor(
    activityLogId: string,
    user: databaseTypes.IUser | string
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const updatedActivityLog = await mongoDbConnection.models.ActivityLogModel.addActor(activityLogId, user);

      return updatedActivityLog;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the activityLog. See the inner error for additional details',
          'activityLog',
          'addActor',
          {id: activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeActor(
    activityLogId: string,
    user: databaseTypes.IUser | string
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const updatedActivityLog = await mongoDbConnection.models.ActivityLogModel.removeActor(activityLogId, user);

      return updatedActivityLog;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the activityLog. See the inner error for additional details',
          'activityLog',
          'removeActor',
          {id: activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addWorkspace(
    activityLogId: string,
    workspace: databaseTypes.IWorkspace | string
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const updatedActivityLog = await mongoDbConnection.models.ActivityLogModel.addWorkspace(activityLogId, workspace);

      return updatedActivityLog;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding workspace to the activityLog. See the inner error for additional details',
          'activityLog',
          'addWorkspace',
          {id: activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeWorkspace(
    activityLogId: string,
    workspace: databaseTypes.IWorkspace | string
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const updatedActivityLog = await mongoDbConnection.models.ActivityLogModel.removeWorkspace(
        activityLogId,
        workspace
      );

      return updatedActivityLog;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  workspace from the activityLog. See the inner error for additional details',
          'activityLog',
          'removeWorkspace',
          {id: activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addProject(
    activityLogId: string,
    project: databaseTypes.IProject | string
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const updatedActivityLog = await mongoDbConnection.models.ActivityLogModel.addProject(activityLogId, project);

      return updatedActivityLog;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding project to the activityLog. See the inner error for additional details',
          'activityLog',
          'addProject',
          {id: activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeProject(
    activityLogId: string,
    project: databaseTypes.IProject | string
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const updatedActivityLog = await mongoDbConnection.models.ActivityLogModel.removeProject(activityLogId, project);

      return updatedActivityLog;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  project from the activityLog. See the inner error for additional details',
          'activityLog',
          'removeProject',
          {id: activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addUserAgent(
    activityLogId: string,
    userAgent: databaseTypes.IUserAgent | string
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const updatedActivityLog = await mongoDbConnection.models.ActivityLogModel.addUserAgent(activityLogId, userAgent);

      return updatedActivityLog;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding userAgent to the activityLog. See the inner error for additional details',
          'activityLog',
          'addUserAgent',
          {id: activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeUserAgent(
    activityLogId: string,
    userAgent: databaseTypes.IUserAgent | string
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const updatedActivityLog = await mongoDbConnection.models.ActivityLogModel.removeUserAgent(
        activityLogId,
        userAgent
      );

      return updatedActivityLog;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  userAgent from the activityLog. See the inner error for additional details',
          'activityLog',
          'removeUserAgent',
          {id: activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
