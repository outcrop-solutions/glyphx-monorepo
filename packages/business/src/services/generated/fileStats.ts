// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';
import {IFileStatsCreateInput} from 'database/src/mongoose/interfaces';

export class FileStatsService {
  public static async getFileStat(fileStatsId: string): Promise<databaseTypes.IFileStats | null> {
    try {
      const fileStats = await mongoDbConnection.models.FileStatsModel.getFileStatsById(fileStatsId);
      return fileStats;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the fileStats. See the inner error for additional details',
          'fileStats',
          'getFileStats',
          {id: fileStatsId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getFileStats(filter?: Record<string, unknown>): Promise<databaseTypes.IFileStats[] | null> {
    try {
      const fileStats = await mongoDbConnection.models.FileStatsModel.queryFileStats(filter);
      return fileStats?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting fileStats. See the inner error for additional details',
          'fileStats',
          'getFileStatss',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createFileStats(data: Partial<databaseTypes.IFileStats>): Promise<databaseTypes.IFileStats> {
    try {
      // create fileStats
      const fileStats = await mongoDbConnection.models.FileStatsModel.createFileStats(data as IFileStatsCreateInput);

      return fileStats;
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
          'An unexpected error occurred while creating the fileStats. See the inner error for additional details',
          'fileStats',
          'createFileStats',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateFileStats(
    fileStatsId: string,
    data: Partial<Omit<databaseTypes.IFileStats, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IFileStats> {
    try {
      const fileStats = await mongoDbConnection.models.FileStatsModel.updateFileStatsById(fileStatsId, {
        ...data,
      });
      return fileStats;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateFileStats',
          {fileStatsId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteFileStats(fileStatsId: string): Promise<databaseTypes.IFileStats> {
    try {
      const fileStats = await mongoDbConnection.models.FileStatsModel.updateFileStatsById(fileStatsId, {
        deletedAt: new Date(),
      });
      return fileStats;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateFileStats',
          {fileStatsId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
