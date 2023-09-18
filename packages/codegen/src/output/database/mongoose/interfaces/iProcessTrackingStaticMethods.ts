// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import {IProcessTrackingMethods} from './iProcessTrackingMethods';
import {IProcessTrackingCreateInput} from './iProcessTrackingCreateInput';

export interface IProcessTrackingStaticMethods
  extends Model<databaseTypes.IProcessTracking, {}, IProcessTrackingMethods> {
  processTrackingIdExists(
    processTrackingId: mongooseTypes.ObjectId
  ): Promise<boolean>;
  allProcessTrackingIdsExist(
    processTrackingIds: mongooseTypes.ObjectId[]
  ): Promise<boolean>;
  createProcessTracking(
    input: IProcessTrackingCreateInput
  ): Promise<databaseTypes.IProcessTracking>;
  getProcessTrackingById(
    processTrackingId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProcessTracking>;
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
    processTrackingId: mongooseTypes.ObjectId,
    processTracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<databaseTypes.IProcessTracking>;
  deleteProcessTrackingById(
    processTrackingId: mongooseTypes.ObjectId
  ): Promise<void>;
  validateUpdateObject(
    processTracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<void>;
}
