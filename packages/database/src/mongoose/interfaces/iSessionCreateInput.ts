import {databaseTypes} from 'types';

export interface ISessionCreateInput extends Omit<databaseTypes.ISession, 'user' | '_id'> {
  user: string | databaseTypes.IUser;
}
