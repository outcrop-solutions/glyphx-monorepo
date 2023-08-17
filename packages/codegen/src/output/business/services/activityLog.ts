// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../database';
import {error, constants} from '@glyphx/core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class ActivityLogService {
  public static async getActivityLog(
    activityLogId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IActivityLog | null> {
    try {
      const id =
        activityLogId instanceof mongooseTypes.ObjectId
          ? activityLogId
          : new mongooseTypes.ObjectId(activityLogId);
      const activityLog =
        await mongoDbConnection.models.ActivityLogModel.getActivityLogById(id);
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

  public static async getActivityLogs(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IActivityLog[] | null> {
    try {
      const activityLogs =
        await mongoDbConnection.models.ActivityLogModel.queryActivityLogs(
          filter
        );
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
      const activityLog =
        await mongoDbConnection.models.ActivityLogModel.createActivityLog(data);

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
    activityLogId: mongooseTypes.ObjectId | string,
    data: Partial<
      Omit<databaseTypes.IActivityLog, '_id' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const id =
        activityLogId instanceof mongooseTypes.ObjectId
          ? activityLogId
          : new mongooseTypes.ObjectId(activityLogId);
      const activityLog =
        await mongoDbConnection.models.ActivityLogModel.updateActivityLogById(
          id,
          {
            ...data,
          }
        );
      return activityLog;
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
          'updateActivityLog',
          {activityLogId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteActivityLog(
    activityLogId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const id =
        activityLogId instanceof mongooseTypes.ObjectId
          ? activityLogId
          : new mongooseTypes.ObjectId(activityLogId);
      const activityLog =
        await mongoDbConnection.models.ActivityLogModel.updateActivityLogById(
          id,
          {
            deletedAt: new Date(),
          }
        );
      return activityLog;
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
    activityLogId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const id =
        activityLogId instanceof mongooseTypes.ObjectId
          ? activityLogId
          : new mongooseTypes.ObjectId(activityLogId);
      const updatedActivityLog =
        await mongoDbConnection.models.ActivityLogModel.addActor(id, user);

      return updatedActivityLog;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    activityLogId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const id =
        activityLogId instanceof mongooseTypes.ObjectId
          ? activityLogId
          : new mongooseTypes.ObjectId(activityLogId);
      const updatedActivityLog =
        await mongoDbConnection.models.ActorModel.removeActor(id, user);

      return updatedActivityLog;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    activityLogId: mongooseTypes.ObjectId | string,
    workspace: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const id =
        activityLogId instanceof mongooseTypes.ObjectId
          ? activityLogId
          : new mongooseTypes.ObjectId(activityLogId);
      const updatedActivityLog =
        await mongoDbConnection.models.ActivityLogModel.addWorkspace(
          id,
          workspace
        );

      return updatedActivityLog;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    activityLogId: mongooseTypes.ObjectId | string,
    workspace: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const id =
        activityLogId instanceof mongooseTypes.ObjectId
          ? activityLogId
          : new mongooseTypes.ObjectId(activityLogId);
      const updatedActivityLog =
        await mongoDbConnection.models.WorkspaceModel.removeWorkspace(
          id,
          workspace
        );

      return updatedActivityLog;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    activityLogId: mongooseTypes.ObjectId | string,
    project: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const id =
        activityLogId instanceof mongooseTypes.ObjectId
          ? activityLogId
          : new mongooseTypes.ObjectId(activityLogId);
      const updatedActivityLog =
        await mongoDbConnection.models.ActivityLogModel.addProject(id, project);

      return updatedActivityLog;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    activityLogId: mongooseTypes.ObjectId | string,
    project: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const id =
        activityLogId instanceof mongooseTypes.ObjectId
          ? activityLogId
          : new mongooseTypes.ObjectId(activityLogId);
      const updatedActivityLog =
        await mongoDbConnection.models.ProjectModel.removeProject(id, project);

      return updatedActivityLog;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    activityLogId: mongooseTypes.ObjectId | string,
    userAgent: (databaseTypes.IUserAgent | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const id =
        activityLogId instanceof mongooseTypes.ObjectId
          ? activityLogId
          : new mongooseTypes.ObjectId(activityLogId);
      const updatedActivityLog =
        await mongoDbConnection.models.ActivityLogModel.addUserAgent(
          id,
          userAgent
        );

      return updatedActivityLog;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    activityLogId: mongooseTypes.ObjectId | string,
    userAgent: (databaseTypes.IUserAgent | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog> {
    try {
      const id =
        activityLogId instanceof mongooseTypes.ObjectId
          ? activityLogId
          : new mongooseTypes.ObjectId(activityLogId);
      const updatedActivityLog =
        await mongoDbConnection.models.UserAgentModel.removeUserAgent(
          id,
          userAgent
        );

      return updatedActivityLog;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
