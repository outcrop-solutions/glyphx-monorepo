import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IAccountDocument
  extends Omit<databaseTypes.IAccount,  | 'user'> {
            user: mongooseTypes.ObjectId;
}
