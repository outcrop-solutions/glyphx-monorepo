// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {databaseTypes} from 'types';
import {IQueryResult} from 'types';
import {IModelConfigMethods} from './iModelConfigMethods';
import {IModelConfigCreateInput} from './iModelConfigCreateInput';

export interface IModelConfigStaticMethods extends Model<databaseTypes.IModelConfig, {}, IModelConfigMethods> {
  modelConfigIdExists(modelConfigId: mongooseTypes.ObjectId): Promise<boolean>;
  allModelConfigIdsExist(modelConfigIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createModelConfig(input: IModelConfigCreateInput): Promise<databaseTypes.IModelConfig>;
  getModelConfigById(modelConfigId: string): Promise<databaseTypes.IModelConfig>;
  queryModelConfigs(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IModelConfig>>;
  updateModelConfigWithFilter(
    filter: Record<string, unknown>,
    modelConfig: Omit<Partial<databaseTypes.IModelConfig>, '_id'>
  ): Promise<databaseTypes.IModelConfig>;
  updateModelConfigById(
    modelConfigId: string,
    modelConfig: Omit<Partial<databaseTypes.IModelConfig>, '_id'>
  ): Promise<databaseTypes.IModelConfig>;
  deleteModelConfigById(modelConfigId: string): Promise<void>;
  validateUpdateObject(modelConfig: Omit<Partial<databaseTypes.IModelConfig>, '_id'>): Promise<void>;
}
