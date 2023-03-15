import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface ISessionCreateInput
  extends Omit<databaseTypes.ISession, 'user' | '_id'> {
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
}
