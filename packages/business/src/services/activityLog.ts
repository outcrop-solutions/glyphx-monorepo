import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from '../lib/databaseConnection';

export class ActivityLogService {
  public static async getLog(logId: string): Promise<databaseTypes.IActivityLog | null> {
    try {
      const log = await mongoDbConnection.models.ActivityLogModel.getActivityLogById(logId);
      return log;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the log. See the inner error for additional details',
          'log',
          'getLog',
          {logId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getLogs(
    resourceId: string | undefined,
    type: typeof databaseTypes.RESOURCE_MODEL.PROJECT | typeof databaseTypes.RESOURCE_MODEL.WORKSPACE
  ): Promise<databaseTypes.IActivityLog[] | null> {
    try {
      let logs;
      if (type === databaseTypes.RESOURCE_MODEL.PROJECT) {
        logs = await mongoDbConnection.models.ActivityLogModel.queryActivityLogs({
          projectId: resourceId,
          onModel: {$ne: 'processTracking'},
        });
      } else {
        logs = await mongoDbConnection.models.ActivityLogModel.queryActivityLogs({
          workspaceId: resourceId,
          onModel: {$ne: 'processTracking'},
        });
      }
      return logs?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while querying the logs. See the inner error for additional details',
          'log',
          'getLogs',
          {resourceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createLog({
    actorId,
    resourceId,
    workspaceId,
    projectId,
    location,
    userAgent,
    onModel,
    action,
  }: {
    actorId: string;
    resourceId: string;
    location: string;
    userAgent: databaseTypes.IUserAgent;
    onModel: databaseTypes.RESOURCE_MODEL;
    action: databaseTypes.ACTION_TYPE;
    workspaceId?: string;
    projectId?: string;
  }): Promise<databaseTypes.IActivityLog | null> {
    try {
      const input = {
        actor: actorId,
        location,
        userAgent: {...userAgent},
        onModel: onModel,
        action: action,
        resource: resourceId,
        workspaceId: workspaceId,
        projectId: projectId,
      };

      const log = await mongoDbConnection.models.ActivityLogModel.createActivityLog(input);
      return log;
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
          'An unexpected error occurred while creating the activity Log. See the inner error for additional details',
          'activityLog',
          'createActivityLog',
          {actorId, resourceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
