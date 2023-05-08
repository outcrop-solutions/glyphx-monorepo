import {database as databaseTypes} from '@glyphx/types';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';
import {Types as mongooseTypes} from 'mongoose';

export class ActivityLogService {
  public static async getLog(
    logId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IActivityLog | null> {
    try {
      const id =
        logId instanceof mongooseTypes.ObjectId
          ? logId
          : new mongooseTypes.ObjectId(logId);
      const log =
        await mongoDbConnection.models.ActivityLogModel.getActivityLogById(id);
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
    workspaceId: mongooseTypes.ObjectId | string | undefined
  ): Promise<databaseTypes.IActivityLog[] | null> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const logs =
        await mongoDbConnection.models.ActivityLogModel.queryActivityLogs({
          workspaceId: id,
        });
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
          {workspaceId},
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
    location,
    userAgent,
    onModel,
    action,
  }: {
    actorId: mongooseTypes.ObjectId | string;
    resourceId: mongooseTypes.ObjectId | string;
    location: string;
    userAgent: databaseTypes.IUserAgent;
    onModel: databaseTypes.constants.RESOURCE_MODEL;
    action: databaseTypes.constants.ACTION_TYPE;
    workspaceId?: mongooseTypes.ObjectId | string;
  }): Promise<databaseTypes.IActivityLog | null> {
    try {
      const actorCastId =
        actorId instanceof mongooseTypes.ObjectId
          ? actorId
          : new mongooseTypes.ObjectId(actorId);
      const resourceCastId =
        resourceId instanceof mongooseTypes.ObjectId
          ? resourceId
          : new mongooseTypes.ObjectId(resourceId);

      let spaceCastId;
      if (workspaceId) {
        spaceCastId =
          workspaceId instanceof mongooseTypes.ObjectId
            ? workspaceId
            : new mongooseTypes.ObjectId(workspaceId);
      }

      const input = {
        actor: actorCastId,
        location,
        userAgent: {...userAgent},
        onModel: onModel,
        action: action,
        resource: resourceCastId,
        workspaceId: spaceCastId,
      };

      const log =
        await mongoDbConnection.models.ActivityLogModel.createActivityLog(
          input
        );
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
          'An unexpected error occurred while creating thea activity Log. See the inner error for additional details',
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