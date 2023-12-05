// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IThresholdMethods} from './iThresholdMethods';
import {IThresholdCreateInput} from './iThresholdCreateInput';

export interface IThresholdStaticMethods extends Model<databaseTypes.IThreshold, {}, IThresholdMethods> {
  thresholdIdExists(thresholdId: mongooseTypes.ObjectId): Promise<boolean>;
  allThresholdIdsExist(thresholdIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createThreshold(input: IThresholdCreateInput): Promise<databaseTypes.IThreshold>;
  getThresholdById(thresholdId: string): Promise<databaseTypes.IThreshold>;
  queryThresholds(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IThreshold>>;
  updateThresholdWithFilter(
    filter: Record<string, unknown>,
    threshold: Omit<Partial<databaseTypes.IThreshold>, '_id'>
  ): Promise<databaseTypes.IThreshold>;
  updateThresholdById(
    thresholdId: string,
    threshold: Omit<Partial<databaseTypes.IThreshold>, '_id'>
  ): Promise<databaseTypes.IThreshold>;
  deleteThresholdById(thresholdId: string): Promise<void>;
  validateUpdateObject(threshold: Omit<Partial<databaseTypes.IThreshold>, '_id'>): Promise<void>;
}
