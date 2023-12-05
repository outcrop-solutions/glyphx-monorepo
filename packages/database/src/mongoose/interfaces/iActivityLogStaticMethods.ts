// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IActivityLogMethods} from './iActivityLogMethods';
import {IActivityLogCreateInput} from './iActivityLogCreateInput';

export interface IActivityLogStaticMethods extends Model<databaseTypes.IActivityLog, {}, IActivityLogMethods> {
  activityLogIdExists(activityLogId: mongooseTypes.ObjectId): Promise<boolean>;
  allActivityLogIdsExist(activityLogIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createActivityLog(input: IActivityLogCreateInput): Promise<databaseTypes.IActivityLog>;
  getActivityLogById(activityLogId: string): Promise<databaseTypes.IActivityLog>;
  queryActivityLogs(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IActivityLog>>;
  updateActivityLogWithFilter(
    filter: Record<string, unknown>,
    activityLog: Omit<Partial<databaseTypes.IActivityLog>, '_id'>
  ): Promise<databaseTypes.IActivityLog>;
  updateActivityLogById(
    activityLogId: string,
    activityLog: Omit<Partial<databaseTypes.IActivityLog>, '_id'>
  ): Promise<databaseTypes.IActivityLog>;
  deleteActivityLogById(activityLogId: string): Promise<void>;
  validateUpdateObject(activityLog: Omit<Partial<databaseTypes.IActivityLog>, '_id'>): Promise<void>;
  addActor(activityLogId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IActivityLog>;
  removeActor(activityLogId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IActivityLog>;
  validateActor(user: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId>;
  addWorkspace(
    activityLogId: string,
    workspace: databaseTypes.IWorkspace | string
  ): Promise<databaseTypes.IActivityLog>;
  removeWorkspace(
    activityLogId: string,
    workspace: databaseTypes.IWorkspace | string
  ): Promise<databaseTypes.IActivityLog>;
  validateWorkspace(workspace: databaseTypes.IWorkspace | string): Promise<mongooseTypes.ObjectId>;
  addProject(activityLogId: string, project: databaseTypes.IProject | string): Promise<databaseTypes.IActivityLog>;
  removeProject(activityLogId: string, project: databaseTypes.IProject | string): Promise<databaseTypes.IActivityLog>;
  validateProject(project: databaseTypes.IProject | string): Promise<mongooseTypes.ObjectId>;
  addUserAgent(
    activityLogId: string,
    userAgent: databaseTypes.IUserAgent | string
  ): Promise<databaseTypes.IActivityLog>;
  removeUserAgent(
    activityLogId: string,
    userAgent: databaseTypes.IUserAgent | string
  ): Promise<databaseTypes.IActivityLog>;
  validateUserAgent(userAgent: databaseTypes.IUserAgent | string): Promise<mongooseTypes.ObjectId>;
}
