// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IProcessTrackingCreateInput} from 'database/src/mongoose/interfaces';

export class ProcessTrackingService {
  public static async getProcessTracking(processTrackingId: string): Promise<databaseTypes.IProcessTracking | null> {
    try {
      const processTracking =
        await mongoDbConnection.models.ProcessTrackingModel.getProcessTrackingById(processTrackingId);
      return processTracking;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the processTracking. See the inner error for additional details',
          'processTracking',
          'getProcessTracking',
          {id: processTrackingId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getProcessTrackings(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IProcessTracking[] | null> {
    try {
      const processTrackings = await mongoDbConnection.models.ProcessTrackingModel.queryProcessTrackings(filter);
      return processTrackings?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting processTrackings. See the inner error for additional details',
          'processTrackings',
          'getProcessTrackings',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createProcessTracking(
    data: Partial<databaseTypes.IProcessTracking>
  ): Promise<databaseTypes.IProcessTracking> {
    try {
      // create processTracking
      const processTracking = await mongoDbConnection.models.ProcessTrackingModel.createProcessTracking(
        data as IProcessTrackingCreateInput
      );

      return processTracking;
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
          'An unexpected error occurred while creating the processTracking. See the inner error for additional details',
          'processTracking',
          'createProcessTracking',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateProcessTracking(
    processTrackingId: string,
    data: Partial<Omit<databaseTypes.IProcessTracking, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IProcessTracking> {
    try {
      const processTracking = await mongoDbConnection.models.ProcessTrackingModel.updateProcessTrackingById(
        processTrackingId,
        {
          ...data,
        }
      );
      return processTracking;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateProcessTracking',
          {processTrackingId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteProcessTracking(processTrackingId: string): Promise<databaseTypes.IProcessTracking> {
    try {
      const processTracking = await mongoDbConnection.models.ProcessTrackingModel.updateProcessTrackingById(
        processTrackingId,
        {
          deletedAt: new Date(),
        }
      );
      return processTracking;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateProcessTracking',
          {processTrackingId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
