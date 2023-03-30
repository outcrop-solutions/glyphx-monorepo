import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IWebhookCreateInput
  extends Omit<
    databaseTypes.IWebhook,
    '_id' | 'user' | 'createdAt' | 'updatedAt'
  > {
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
}
