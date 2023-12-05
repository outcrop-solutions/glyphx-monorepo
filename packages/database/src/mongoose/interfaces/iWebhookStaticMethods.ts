// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IWebhookMethods} from './iWebhookMethods';
import {IWebhookCreateInput} from './iWebhookCreateInput';

export interface IWebhookStaticMethods extends Model<databaseTypes.IWebhook, {}, IWebhookMethods> {
  webhookIdExists(webhookId: mongooseTypes.ObjectId): Promise<boolean>;
  allWebhookIdsExist(webhookIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createWebhook(input: IWebhookCreateInput): Promise<databaseTypes.IWebhook>;
  getWebhookById(webhookId: string): Promise<databaseTypes.IWebhook>;
  queryWebhooks(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IWebhook>>;
  updateWebhookWithFilter(
    filter: Record<string, unknown>,
    webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>
  ): Promise<databaseTypes.IWebhook>;
  updateWebhookById(
    webhookId: string,
    webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>
  ): Promise<databaseTypes.IWebhook>;
  deleteWebhookById(webhookId: string): Promise<void>;
  validateUpdateObject(webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>): Promise<void>;
  addUser(webhookId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IWebhook>;
  removeUser(webhookId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IWebhook>;
  validateUser(user: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId>;
}
