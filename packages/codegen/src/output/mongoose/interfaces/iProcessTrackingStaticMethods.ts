import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IProcessTrackingMethods} from './iProcessTrackingMethods';
import {IProcessTrackingCreateInput} from './iProcessTrackingCreateInput';

export interface IProcessTrackingStaticMethods
  extends Model<databaseTypes.IProcessTracking, {}, IProcessTrackingMethods> {
  process_trackingIdExists(process_trackingId: mongooseTypes.ObjectId): Promise<boolean>;
  allProcessTrackingIdsExist(process_trackingIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProcessTracking(input: IProcessTrackingCreateInput): Promise<databaseTypes.IProcessTracking>;
  getProcessTrackingById(process_trackingId: mongooseTypes.ObjectId): Promise<databaseTypes.IProcessTracking>;
  queryProcessTrackings(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IProcessTracking>>;
  updateProcessTrackingWithFilter(filter: Record<string, unknown>, process_tracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>): Promise<databaseTypes.IProcessTracking>;
  updateProcessTrackingById(process_trackingId: mongooseTypes.ObjectId, process_tracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>): Promise<databaseTypes.IProcessTracking>;
  deleteProcessTrackingById(process_trackingId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(process_tracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>): Promise<void>;
      addProcessMessages(
        processtrackingId: mongooseTypes.ObjectId, 
        : (databaseTypes.I | mongooseTypes.ObjectId)[]
      ): Promise<databaseTypes.IProcessTracking>;
      removeProcessMessages(
        processtrackingId: mongooseTypes.ObjectId, 
        : (databaseTypes.I | mongooseTypes.ObjectId)[]
      ): Promise<databaseTypes.IProcessTracking>;
      validateProcessMessages(
        : (databaseTypes.I | mongooseTypes.ObjectId)[]
      ): Promise<mongooseTypes.ObjectId[]>;
}
