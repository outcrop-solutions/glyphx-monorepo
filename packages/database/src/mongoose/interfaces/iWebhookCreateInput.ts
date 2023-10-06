import {databaseTypes} from 'types';

export interface IWebhookCreateInput extends Omit<databaseTypes.IWebhook, '_id' | 'user' | 'createdAt' | 'updatedAt'> {
  user: string | databaseTypes.IUser;
}
