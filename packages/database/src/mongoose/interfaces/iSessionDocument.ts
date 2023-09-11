import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface ISessionDocument extends Omit<databaseTypes.ISession, 'user'> {
  user: mongooseTypes.ObjectId;
}
