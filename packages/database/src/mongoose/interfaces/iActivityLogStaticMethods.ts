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
}
