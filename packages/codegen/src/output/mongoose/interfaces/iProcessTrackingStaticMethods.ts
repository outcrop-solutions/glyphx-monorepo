import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { IProcessTrackingMethods } from './iProcessTrackingMethods';
import { IProcessTrackingCreateInput } from './iProcessTrackingCreateInput';

export interface IProcessTrackingStaticMethods
  extends Model<databaseTypes.IProcessTracking, {}, IProcessTrackingMethods> {
  processtrackingIdExists(processtrackingId: mongooseTypes.ObjectId): Promise<boolean>;
  allProcessTrackingIdsExist(processtrackingIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProcessTracking(input: IProcessTrackingCreateInput): Promise<databaseTypes.IProcessTracking>;
  getProcessTrackingById(processtrackingId: mongooseTypes.ObjectId): Promise<databaseTypes.IProcessTracking>;
  queryProcessTrackings(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IProcessTracking>>;
  updateProcessTrackingWithFilter(
    filter: Record<string, unknown>,
    processtracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<databaseTypes.IProcessTracking>;
  updateProcessTrackingById(
    processtrackingId: mongooseTypes.ObjectId,
    processtracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<databaseTypes.IProcessTracking>;
  deleteProcessTrackingById(processtrackingId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(processtracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>): Promise<void>;
}
