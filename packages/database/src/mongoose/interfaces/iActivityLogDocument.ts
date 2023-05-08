import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IActivityLogDocument
  extends Omit<databaseTypes.IActivityLog, 'actor' | 'resource'> {
  actor: mongooseTypes.ObjectId;
  resource: mongooseTypes.ObjectId;
}
