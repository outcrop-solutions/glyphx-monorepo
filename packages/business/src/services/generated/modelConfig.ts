// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IModelConfigCreateInput} from 'database/src/mongoose/interfaces';

export class ModelConfigService {
  public static async getModelConfig(modelConfigId: string): Promise<databaseTypes.IModelConfig | null> {
    try {
      const modelConfig = await mongoDbConnection.models.ModelConfigModel.getModelConfigById(modelConfigId);
      return modelConfig;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the modelConfig. See the inner error for additional details',
          'modelConfig',
          'getModelConfig',
          {id: modelConfigId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getModelConfigs(filter?: Record<string, unknown>): Promise<databaseTypes.IModelConfig[] | null> {
    try {
      const modelConfigs = await mongoDbConnection.models.ModelConfigModel.queryModelConfigs(filter);
      return modelConfigs?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting modelConfigs. See the inner error for additional details',
          'modelConfigs',
          'getModelConfigs',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createModelConfig(
    data: Partial<databaseTypes.IModelConfig>
  ): Promise<databaseTypes.IModelConfig> {
    try {
      // create modelConfig
      const modelConfig = await mongoDbConnection.models.ModelConfigModel.createModelConfig(
        data as IModelConfigCreateInput
      );

      return modelConfig;
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
          'An unexpected error occurred while creating the modelConfig. See the inner error for additional details',
          'modelConfig',
          'createModelConfig',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateModelConfig(
    modelConfigId: string,
    data: Partial<Omit<databaseTypes.IModelConfig, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IModelConfig> {
    try {
      const modelConfig = await mongoDbConnection.models.ModelConfigModel.updateModelConfigById(modelConfigId, {
        ...data,
      });
      return modelConfig;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateModelConfig',
          {modelConfigId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteModelConfig(modelConfigId: string): Promise<databaseTypes.IModelConfig> {
    try {
      const modelConfig = await mongoDbConnection.models.ModelConfigModel.updateModelConfigById(modelConfigId, {
        deletedAt: new Date(),
      });
      return modelConfig;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateModelConfig',
          {modelConfigId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
