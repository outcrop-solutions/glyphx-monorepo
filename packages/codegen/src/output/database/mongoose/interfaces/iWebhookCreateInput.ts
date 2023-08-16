// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IWebhookCreateInput
  extends Omit<
    databaseTypes.IWebhook,
    '_id' | 'createdAt' | 'updatedAt' | 'user'
  > {
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
}