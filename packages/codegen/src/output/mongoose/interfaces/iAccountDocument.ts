import { database as databaseTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';

export interface IAccountCreateInput extends Omit<databaseTypes.IAccount, 'user'> {
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
}
