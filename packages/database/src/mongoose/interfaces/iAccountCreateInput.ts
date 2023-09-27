import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IAccountCreateInput extends Omit<databaseTypes.IAccount, '_id' | 'user'> {
  user: string | databaseTypes.IUser;
}
