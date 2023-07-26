import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { IActivityLogMethods } from './iActivityLogMethods';
import { IActivityLogCreateInput } from './iActivityLogCreateInput';

export interface IActivityLogStaticMethods extends Model<databaseTypes.IActivityLog, {}, IActivityLogMethods> {
  activitylogIdExists(activitylogId: mongooseTypes.ObjectId): Promise<boolean>;
  allActivityLogIdsExist(activitylogIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createActivityLog(input: IActivityLogCreateInput): Promise<databaseTypes.IActivityLog>;
  getActivityLogById(activitylogId: mongooseTypes.ObjectId): Promise<databaseTypes.IActivityLog>;
  queryActivityLogs(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IActivityLog>>;
  updateActivityLogWithFilter(
    filter: Record<string, unknown>,
    activitylog: Omit<Partial<databaseTypes.IActivityLog>, '_id'>
  ): Promise<databaseTypes.IActivityLog>;
  updateActivityLogById(
    activitylogId: mongooseTypes.ObjectId,
    activitylog: Omit<Partial<databaseTypes.IActivityLog>, '_id'>
  ): Promise<databaseTypes.IActivityLog>;
  deleteActivityLogById(activitylogId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(activitylog: Omit<Partial<databaseTypes.IActivityLog>, '_id'>): Promise<void>;
  addUsers(
    activitylogId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog>;
  removeUsers(
    activitylogId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog>;
  validateUsers(users: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;

  addUserAgents(
    activitylogId: mongooseTypes.ObjectId,
    useragents: (databaseTypes.IUserAgent | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog>;
  removeUserAgents(
    activitylogId: mongooseTypes.ObjectId,
    useragents: (databaseTypes.IUserAgent | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IActivityLog>;
  validateUserAgents(
    useragents: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
}
