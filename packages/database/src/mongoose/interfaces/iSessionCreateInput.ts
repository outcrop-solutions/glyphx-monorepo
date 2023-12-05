// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface ISessionCreateInput extends Omit<databaseTypes.ISession, '_id' | 'createdAt' | 'updatedAt' | 'user'> {
  user: string | databaseTypes.IUser;
}
