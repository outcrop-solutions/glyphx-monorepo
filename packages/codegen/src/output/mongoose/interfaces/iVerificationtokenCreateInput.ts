import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IVerificationTokenCreateInput
  extends Omit<databaseTypes.IVerificationToken, '_id' | 'createdAt' | 'updatedAt' > {
}
