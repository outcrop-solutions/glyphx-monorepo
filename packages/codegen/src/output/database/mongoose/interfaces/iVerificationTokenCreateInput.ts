// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IVerificationTokenCreateInput
  extends Omit<
    databaseTypes.IVerificationToken,
    '_id' | 'createdAt' | 'updatedAt'
  > {}