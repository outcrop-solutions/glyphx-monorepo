import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IWebhookDocument
  extends Omit<databaseTypes.IWebhook,  | 'user'> {
            user: mongooseTypes.ObjectId;
}
