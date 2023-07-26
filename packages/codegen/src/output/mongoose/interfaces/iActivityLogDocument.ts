import { database as databaseTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';

export interface IActivityLogCreateInput extends Omit<databaseTypes.IActivityLog, 'user' | 'useragent'> {
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
  useragent: mongooseTypes.ObjectId | databaseTypes.IUserAgent;
}
