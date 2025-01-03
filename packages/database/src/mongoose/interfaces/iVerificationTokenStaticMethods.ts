import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IVerificationTokenMethods} from './iVerificationTokenMethods';
export interface IVerificationTokenStaticMethods
  extends Model<databaseTypes.IVerificationToken, {}, IVerificationTokenMethods> {
  verificationTokenIdExists(verificationTokenId: mongooseTypes.ObjectId): Promise<boolean>;
  allVerificationTokenIdsExist(verificationTokenIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createVerificationToken(
    input: Omit<databaseTypes.IVerificationToken, '_id'>
  ): Promise<databaseTypes.IVerificationToken>;
  getVerificationTokenById(verificationTokenId: string): Promise<databaseTypes.IVerificationToken>;
  queryVerificationTokens(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IVerificationToken>>;
  updateVerificationTokenWithFilter(
    filter: Record<string, unknown>,
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<void>;
  updateVerificationTokenById(
    verificationTokenId: string,
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<databaseTypes.IVerificationToken>;
  deleteVerificationTokenById(sessionId: string): Promise<void>;
  validateUpdateObject(verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>): Promise<void>;
}
