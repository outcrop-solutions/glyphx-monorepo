import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface ISessionDocument
  extends Omit<databaseTypes.ISession,  | 'user'> {
            user: mongooseTypes.ObjectId;
}
