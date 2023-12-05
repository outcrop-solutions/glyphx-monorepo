// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IAccountCreateInput extends Omit<databaseTypes.IAccount, '_id' | 'createdAt' | 'updatedAt' | 'user'> {
  user: string | databaseTypes.IUser;
}
