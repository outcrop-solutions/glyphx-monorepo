// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IActivityLogDocument
  extends Omit<databaseTypes.IActivityLog, 'actor' | 'userAgent'> {
  actor: mongooseTypes.ObjectId;
  userAgent: mongooseTypes.ObjectId;
}
