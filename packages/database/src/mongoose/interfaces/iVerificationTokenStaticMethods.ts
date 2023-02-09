import {Types as mongooseTypes, Model} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {IVerificationTokenMethods} from './iVerificationTokenMethods';
export interface IVerificationTokenStaticMethods
  extends Model<databaseTypes.IVerificationToken, {}, IVerificationTokenMethods> {
  webhookIdExists(webhookId: mongooseTypes.ObjectId): Promise<boolean>;
  allVerificationTokenIdsExist(webhookIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createVerificationToken(
    input: Omit<databaseTypes.IVerificationToken, '_id'>
  ): Promise<databaseTypes.IVerificationToken>;
  getVerificationTokenById(
    webhookId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IVerificationToken>;
  updateVerificationTokenWithFilter(
    filter: Record<string, unknown>,
    webhook: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<void>;
  updateVerificationTokenById(
    webhookId: mongooseTypes.ObjectId,
    webhook: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<databaseTypes.IVerificationToken>;
  deleteVerificationTokenById(sessionId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    webhook: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<void>;
}
