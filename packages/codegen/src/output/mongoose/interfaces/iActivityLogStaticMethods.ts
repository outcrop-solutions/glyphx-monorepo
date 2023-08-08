import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IActivityLogMethods} from './iActivityLogMethods';
import {IActivityLogCreateInput} from './iActivityLogCreateInput';

export interface IActivityLogStaticMethods
  extends Model<databaseTypes.IActivityLog, {}, IActivityLogMethods> {
  activity_logIdExists(activity_logId: mongooseTypes.ObjectId): Promise<boolean>;
  allActivityLogIdsExist(activity_logIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createActivityLog(input: IActivityLogCreateInput): Promise<databaseTypes.IActivityLog>;
  getActivityLogById(activity_logId: mongooseTypes.ObjectId): Promise<databaseTypes.IActivityLog>;
  queryActivityLogs(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IActivityLog>>;
  updateActivityLogWithFilter(filter: Record<string, unknown>, activity_log: Omit<Partial<databaseTypes.IActivityLog>, '_id'>): Promise<databaseTypes.IActivityLog>;
  updateActivityLogById(activity_logId: mongooseTypes.ObjectId, activity_log: Omit<Partial<databaseTypes.IActivityLog>, '_id'>): Promise<databaseTypes.IActivityLog>;
  deleteActivityLogById(activity_logId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(activity_log: Omit<Partial<databaseTypes.IActivityLog>, '_id'>): Promise<void>;
      addActor(
        activitylogId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IActivityLog>;
      removeActor(
        activitylogId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IActivityLog>;
      validateActor(
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
          addUserAgent(
        activitylogId: mongooseTypes.ObjectId, 
        userAgent: databaseTypes.IUserAgent | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IActivityLog>;
      removeUserAgent(
        activitylogId: mongooseTypes.ObjectId, 
        userAgent: databaseTypes.IUserAgent | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IActivityLog>;
      validateUserAgent(
        userAgent: databaseTypes.IUserAgent | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
    }
