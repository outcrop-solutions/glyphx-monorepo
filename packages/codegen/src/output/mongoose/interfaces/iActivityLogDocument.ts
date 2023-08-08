import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IActivityLogDocument
  extends Omit<databaseTypes.IActivityLog,  | 'actor' | 'userAgent'> {
            actor: mongooseTypes.ObjectId;
            userAgent: mongooseTypes.ObjectId;
}
