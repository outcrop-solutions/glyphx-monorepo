// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IActivityLogCreateInput
  extends Omit<
    databaseTypes.IActivityLog,
    '_id' | 'createdAt' | 'updatedAt' | 'actor' | 'userAgent'
  > {
  actor: mongooseTypes.ObjectId | databaseTypes.IUser;
  userAgent: mongooseTypes.ObjectId | databaseTypes.IUserAgent;
}
