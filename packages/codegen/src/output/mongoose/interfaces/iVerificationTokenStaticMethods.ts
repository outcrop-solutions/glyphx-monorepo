import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IVerificationTokenMethods} from './iVerificationTokenMethods';
import {IVerificationTokenCreateInput} from './iVerificationTokenCreateInput';

export interface IVerificationTokenStaticMethods
  extends Model<databaseTypes.IVerificationToken, {}, IVerificationTokenMethods> {
  verification_tokenIdExists(verification_tokenId: mongooseTypes.ObjectId): Promise<boolean>;
  allVerificationTokenIdsExist(verification_tokenIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createVerificationToken(input: IVerificationTokenCreateInput): Promise<databaseTypes.IVerificationToken>;
  getVerificationTokenById(verification_tokenId: mongooseTypes.ObjectId): Promise<databaseTypes.IVerificationToken>;
  queryVerificationTokens(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IVerificationToken>>;
  updateVerificationTokenWithFilter(filter: Record<string, unknown>, verification_token: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>): Promise<databaseTypes.IVerificationToken>;
  updateVerificationTokenById(verification_tokenId: mongooseTypes.ObjectId, verification_token: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>): Promise<databaseTypes.IVerificationToken>;
  deleteVerificationTokenById(verification_tokenId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(verification_token: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>): Promise<void>;
}
