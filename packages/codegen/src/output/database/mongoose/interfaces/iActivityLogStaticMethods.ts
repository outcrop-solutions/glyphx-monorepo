// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import {IActivityLogMethods} from './iActivityLogMethods';
import {IActivityLogCreateInput} from './iActivityLogCreateInput';

export interface IActivityLogStaticMethods
  extends Model<databaseTypes.IActivityLog, {}, IActivityLogMethods> {
  activityLogIdExists(activityLogId: mongooseTypes.ObjectId): Promise<boolean>;
  allActivityLogIdsExist(
    activityLogIds: mongooseTypes.ObjectId[]
  ): Promise<boolean>;
  createActivityLog(
    input: IActivityLogCreateInput
  ): Promise<databaseTypes.IActivityLog>;
  getActivityLogById(
    activityLogId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog>;
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
    activityLogId: mongooseTypes.ObjectId,
    activityLog: Omit<Partial<databaseTypes.IActivityLog>, '_id'>
  ): Promise<databaseTypes.IActivityLog>;
  deleteActivityLogById(activityLogId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    activityLog: Omit<Partial<databaseTypes.IActivityLog>, '_id'>
  ): Promise<void>;
  addActor(
    activityLogId: mongooseTypes.ObjectId,
    user: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog>;
  removeActor(
    activityLogId: mongooseTypes.ObjectId,
    user: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog>;
  validateActor(
    user: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  addWorkspace(
    activityLogId: mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog>;
  removeWorkspace(
    activityLogId: mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog>;
  validateWorkspace(
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  addProject(
    activityLogId: mongooseTypes.ObjectId,
    project: databaseTypes.IProject | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog>;
  removeProject(
    activityLogId: mongooseTypes.ObjectId,
    project: databaseTypes.IProject | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog>;
  validateProject(
    project: databaseTypes.IProject | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  addUserAgent(
    activityLogId: mongooseTypes.ObjectId,
    userAgent: databaseTypes.IUserAgent | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog>;
  removeUserAgent(
    activityLogId: mongooseTypes.ObjectId,
    userAgent: databaseTypes.IUserAgent | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog>;
  validateUserAgent(
    userAgent: databaseTypes.IUserAgent | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
}
