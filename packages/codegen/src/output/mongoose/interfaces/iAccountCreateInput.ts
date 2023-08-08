import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IAccountCreateInput
  extends Omit<databaseTypes.IAccount, '_id' | 'createdAt' | 'updatedAt'  | 'user'> {
            user: mongooseTypes.ObjectId | databaseTypes.IUser;
}
