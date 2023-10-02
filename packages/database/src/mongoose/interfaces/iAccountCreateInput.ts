import {databaseTypes} from 'types';

export interface IAccountCreateInput extends Omit<databaseTypes.IAccount, '_id' | 'user'> {
  user: string | databaseTypes.IUser;
}
