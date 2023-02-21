import {Types as mongooseTypes, Model} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {IVerificationTokenMethods} from './iVerificationTokenMethods';
export interface IVerificationTokenStaticMethods
  extends Model<
    databaseTypes.IVerificationToken,
    {},
    IVerificationTokenMethods
  > {
  verificationTokenIdExists(
    verificationTokenId: mongooseTypes.ObjectId
  ): Promise<boolean>;
  allVerificationTokenIdsExist(
    verificationTokenIds: mongooseTypes.ObjectId[]
  ): Promise<boolean>;
  createVerificationToken(
    input: Omit<databaseTypes.IVerificationToken, '_id'>
  ): Promise<databaseTypes.IVerificationToken>;
  getVerificationTokenById(
    verificationTokenId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IVerificationToken>;
  updateVerificationTokenWithFilter(
    filter: Record<string, unknown>,
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<void>;
  updateVerificationTokenById(
    verificationTokenId: mongooseTypes.ObjectId,
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<databaseTypes.IVerificationToken>;
  deleteVerificationTokenById(sessionId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<void>;
}
