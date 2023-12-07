// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IThresholdCreateInput} from 'database/src/mongoose/interfaces';

export class ThresholdService {
  public static async getThreshold(thresholdId: string): Promise<databaseTypes.IThreshold | null> {
    try {
      const threshold = await mongoDbConnection.models.ThresholdModel.getThresholdById(thresholdId);
      return threshold;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the threshold. See the inner error for additional details',
          'threshold',
          'getThreshold',
          {id: thresholdId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getThresholds(filter?: Record<string, unknown>): Promise<databaseTypes.IThreshold[] | null> {
    try {
      const thresholds = await mongoDbConnection.models.ThresholdModel.queryThresholds(filter);
      return thresholds?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting thresholds. See the inner error for additional details',
          'thresholds',
          'getThresholds',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createThreshold(data: Partial<databaseTypes.IThreshold>): Promise<databaseTypes.IThreshold> {
    try {
      // create threshold
      const threshold = await mongoDbConnection.models.ThresholdModel.createThreshold(data as IThresholdCreateInput);

      return threshold;
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
          'An unexpected error occurred while creating the threshold. See the inner error for additional details',
          'threshold',
          'createThreshold',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateThreshold(
    thresholdId: string,
    data: Partial<Omit<databaseTypes.IThreshold, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IThreshold> {
    try {
      const threshold = await mongoDbConnection.models.ThresholdModel.updateThresholdById(thresholdId, {
        ...data,
      });
      return threshold;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateThreshold',
          {thresholdId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteThreshold(thresholdId: string): Promise<databaseTypes.IThreshold> {
    try {
      const threshold = await mongoDbConnection.models.ThresholdModel.updateThresholdById(thresholdId, {
        deletedAt: new Date(),
      });
      return threshold;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateThreshold',
          {thresholdId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
