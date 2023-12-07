// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IPresenceCreateInput} from 'database/src/mongoose/interfaces';

export class PresenceService {
  public static async getPresence(presenceId: string): Promise<databaseTypes.IPresence | null> {
    try {
      const presence = await mongoDbConnection.models.PresenceModel.getPresenceById(presenceId);
      return presence;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the presence. See the inner error for additional details',
          'presence',
          'getPresence',
          {id: presenceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getPresences(filter?: Record<string, unknown>): Promise<databaseTypes.IPresence[] | null> {
    try {
      const presences = await mongoDbConnection.models.PresenceModel.queryPresences(filter);
      return presences?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting presences. See the inner error for additional details',
          'presences',
          'getPresences',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createPresence(data: Partial<databaseTypes.IPresence>): Promise<databaseTypes.IPresence> {
    try {
      // create presence
      const presence = await mongoDbConnection.models.PresenceModel.createPresence(data as IPresenceCreateInput);

      return presence;
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
          'An unexpected error occurred while creating the presence. See the inner error for additional details',
          'presence',
          'createPresence',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updatePresence(
    presenceId: string,
    data: Partial<Omit<databaseTypes.IPresence, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IPresence> {
    try {
      const presence = await mongoDbConnection.models.PresenceModel.updatePresenceById(presenceId, {
        ...data,
      });
      return presence;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updatePresence',
          {presenceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deletePresence(presenceId: string): Promise<databaseTypes.IPresence> {
    try {
      const presence = await mongoDbConnection.models.PresenceModel.updatePresenceById(presenceId, {
        deletedAt: new Date(),
      });
      return presence;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updatePresence',
          {presenceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addConfig(
    presenceId: string,
    modelConfig: databaseTypes.IModelConfig | string
  ): Promise<databaseTypes.IPresence> {
    try {
      const updatedPresence = await mongoDbConnection.models.PresenceModel.addConfig(presenceId, modelConfig);

      return updatedPresence;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding modelConfig to the presence. See the inner error for additional details',
          'presence',
          'addConfig',
          {id: presenceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeConfig(
    presenceId: string,
    modelConfig: databaseTypes.IModelConfig | string
  ): Promise<databaseTypes.IPresence> {
    try {
      const updatedPresence = await mongoDbConnection.models.PresenceModel.removeConfig(presenceId, modelConfig);

      return updatedPresence;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  modelConfig from the presence. See the inner error for additional details',
          'presence',
          'removeConfig',
          {id: presenceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
