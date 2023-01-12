import mongoose, {Types as mongooseTypes, Model} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {IWebhookMethods} from './iWebhookMethods';
export interface IWebhookStaticMethods
  extends Model<databaseTypes.IWebhook, {}, IWebhookMethods> {
  webhookIdExists(webhookId: mongooseTypes.ObjectId): Promise<boolean>;
  createWebhook(
    input: Omit<databaseTypes.IWebhook, '_id'>
  ): Promise<databaseTypes.IWebhook>;
  getWebhookById(
    webhookId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IWebhook>;
  updateWebhookWithFilter(
    filter: Record<string, unknown>,
    webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>
  ): Promise<void>;
  updateWebhookById(
    webhookId: mongooseTypes.ObjectId,
    webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>
  ): Promise<databaseTypes.IWebhook>;
  deleteWebhookById(sessionId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>
  ): Promise<void>;
}
