// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IWebhookDocument extends Omit<databaseTypes.IWebhook, 'user'> {
  user: mongooseTypes.ObjectId;
}