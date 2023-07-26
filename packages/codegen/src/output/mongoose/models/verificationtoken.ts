import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import mongoose, { Types as mongooseTypes, Schema, model, Model } from 'mongoose';
import { error } from '@glyphx/core';
import { IVerificationtokenDocument, IVerificationtokenStaticMethods, IVerificationtokenMethods } from '../interfaces';

const SCHEMA = new Schema<IVerificationtokenDocument, IVerificationtokenStaticMethods, IVerificationtokenMethods>({
  createdAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  updatedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  deletedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  identifier: { type: string, required: false },
  token: { type: string, required: false },
  expires: { type: Date, required: false },
});

export default mongoose.model('VerificationToken', SCHEMA);
