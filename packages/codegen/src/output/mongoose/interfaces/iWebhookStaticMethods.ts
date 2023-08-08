import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IWebhookMethods} from './iWebhookMethods';
import {IWebhookCreateInput} from './iWebhookCreateInput';

export interface IWebhookStaticMethods
  extends Model<databaseTypes.IWebhook, {}, IWebhookMethods> {
  webhookIdExists(webhookId: mongooseTypes.ObjectId): Promise<boolean>;
  allWebhookIdsExist(webhookIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createWebhook(input: IWebhookCreateInput): Promise<databaseTypes.IWebhook>;
  getWebhookById(webhookId: mongooseTypes.ObjectId): Promise<databaseTypes.IWebhook>;
  queryWebhooks(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IWebhook>>;
  updateWebhookWithFilter(filter: Record<string, unknown>, webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>): Promise<databaseTypes.IWebhook>;
  updateWebhookById(webhookId: mongooseTypes.ObjectId, webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>): Promise<databaseTypes.IWebhook>;
  deleteWebhookById(webhookId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>): Promise<void>;
      addUser(
        webhookId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IWebhook>;
      removeUser(
        webhookId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IWebhook>;
      validateUser(
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
    }
