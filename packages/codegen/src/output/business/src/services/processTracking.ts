// THIS CODE WAS AUTOMATICALLY GENERATED
import { databaseTypes } from '../../../../database';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class ProcessTrackingService {
  public static async getProcessTracking(
    processTrackingId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IProcessTracking | null> {
    try {
      const id =
        processTrackingId instanceof mongooseTypes.ObjectId
          ? processTrackingId
          : new mongooseTypes.ObjectId(processTrackingId);
      const processTracking =
        await mongoDbConnection.models.ProcessTrackingModel.getProcessTrackingById(id);
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
      const processTrackings =
        await mongoDbConnection.models.ProcessTrackingModel.queryProcessTrackings(filter);
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
    data: Partial<databaseTypes.IProcessTracking>,
  ): Promise<databaseTypes.IProcessTracking> {
    try {
      // create processTracking
      const processTracking = await mongoDbConnection.models.ProcessTrackingModel.createProcessTracking(
        data
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
    processTrackingId: mongooseTypes.ObjectId | string,
    data: Partial<Omit<
      databaseTypes.IProcessTracking,
      | '_id'
      | 'createdAt'
      | 'updatedAt'
    >>
  ): Promise<databaseTypes.IProcessTracking> {
    try {
      const id =
        processTrackingId instanceof mongooseTypes.ObjectId
          ? processTrackingId
          : new mongooseTypes.ObjectId(processTrackingId);
      const processTracking =
        await mongoDbConnection.models.ProcessTrackingModel.updateProcessTrackingById(id, {
          ...data
        });
      return processTracking;
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
          'updateProcessTracking',
          { processTrackingId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteProcessTracking(
    processTrackingId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IProcessTracking> {
    try {
      const id =
        processTrackingId instanceof mongooseTypes.ObjectId
          ? processTrackingId
          : new mongooseTypes.ObjectId(processTrackingId);
      const processTracking =
        await mongoDbConnection.models.ProcessTrackingModel.updateProcessTrackingById(id, {
          deletedAt: new Date(),
        });
      return processTracking;
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
          'updateProcessTracking',
          { processTrackingId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}