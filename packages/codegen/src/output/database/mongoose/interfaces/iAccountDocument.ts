// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IAccountDocument extends Omit<databaseTypes.IAccount, 'user'> {
  user: mongooseTypes.ObjectId;
}