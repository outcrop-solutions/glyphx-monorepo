// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IProcessTrackingMethods} from './iProcessTrackingMethods';
import {IProcessTrackingCreateInput} from './iProcessTrackingCreateInput';

export interface IProcessTrackingStaticMethods
  extends Model<databaseTypes.IProcessTracking, {}, IProcessTrackingMethods> {
  processTrackingIdExists(processTrackingId: mongooseTypes.ObjectId): Promise<boolean>;
  allProcessTrackingIdsExist(processTrackingIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProcessTracking(input: IProcessTrackingCreateInput): Promise<databaseTypes.IProcessTracking>;
  getProcessTrackingById(processTrackingId: string): Promise<databaseTypes.IProcessTracking>;
  queryProcessTrackings(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IProcessTracking>>;
  updateProcessTrackingWithFilter(
    filter: Record<string, unknown>,
    processTracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<databaseTypes.IProcessTracking>;
  updateProcessTrackingById(
    processTrackingId: string,
    processTracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<databaseTypes.IProcessTracking>;
  deleteProcessTrackingById(processTrackingId: string): Promise<void>;
  validateUpdateObject(processTracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>): Promise<void>;
  addProcessMessages(processTrackingId: string, processMessages: string[]): Promise<databaseTypes.IProcessTracking>;
  removeProcessMessages(processTrackingId: string, processMessages: string[]): Promise<databaseTypes.IProcessTracking>;
  validateProcessMessages(processMessages: string[]): Promise<mongooseTypes.ObjectId[]>;
  addProcessErrors(
    processTrackingId: mongooseTypes.ObjectId,
    processErrors: Record<string, unknown>[]
  ): Promise<databaseTypes.IProcessTracking>;
  removeProcessErrors(
    processTrackingId: mongooseTypes.ObjectId,
    processErrors: Record<string, unknown>[][]
  ): Promise<databaseTypes.IProcessTracking>;
  validateProcessErrors(processErrors: Record<string, unknown>[][]): Promise<mongooseTypes.ObjectId[]>;
}
