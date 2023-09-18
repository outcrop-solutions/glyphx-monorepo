// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface ISessionDocument extends Omit<databaseTypes.ISession, 'user'> {
  user: mongooseTypes.ObjectId;
}
