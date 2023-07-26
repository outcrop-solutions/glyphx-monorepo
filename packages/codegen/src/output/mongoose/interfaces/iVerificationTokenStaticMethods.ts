import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { IVerificationTokenMethods } from './iVerificationTokenMethods';
import { IVerificationTokenCreateInput } from './iVerificationTokenCreateInput';

export interface IVerificationTokenStaticMethods
  extends Model<databaseTypes.IVerificationToken, {}, IVerificationTokenMethods> {
  verificationtokenIdExists(verificationtokenId: mongooseTypes.ObjectId): Promise<boolean>;
  allVerificationTokenIdsExist(verificationtokenIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createVerificationToken(input: IVerificationTokenCreateInput): Promise<databaseTypes.IVerificationToken>;
  getVerificationTokenById(verificationtokenId: mongooseTypes.ObjectId): Promise<databaseTypes.IVerificationToken>;
  queryVerificationTokens(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IVerificationToken>>;
  updateVerificationTokenWithFilter(
    filter: Record<string, unknown>,
    verificationtoken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<databaseTypes.IVerificationToken>;
  updateVerificationTokenById(
    verificationtokenId: mongooseTypes.ObjectId,
    verificationtoken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<databaseTypes.IVerificationToken>;
  deleteVerificationTokenById(verificationtokenId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(verificationtoken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>): Promise<void>;
}
