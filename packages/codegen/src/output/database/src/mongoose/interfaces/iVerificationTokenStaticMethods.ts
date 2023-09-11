// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IVerificationTokenMethods} from './iVerificationTokenMethods';
import {IVerificationTokenCreateInput} from './iVerificationTokenCreateInput';

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
    input: IVerificationTokenCreateInput
  ): Promise<databaseTypes.IVerificationToken>;
  getVerificationTokenById(
    verificationTokenId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IVerificationToken>;
  queryVerificationTokens(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IVerificationToken>>;
  updateVerificationTokenWithFilter(
    filter: Record<string, unknown>,
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<databaseTypes.IVerificationToken>;
  updateVerificationTokenById(
    verificationTokenId: mongooseTypes.ObjectId,
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<databaseTypes.IVerificationToken>;
  deleteVerificationTokenById(
    verificationTokenId: mongooseTypes.ObjectId
  ): Promise<void>;
  validateUpdateObject(
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<void>;
}
