import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import mongoose, { Types as mongooseTypes, Schema, model, Model } from 'mongoose';
import { error } from '@glyphx/core';
import { IUseragentDocument, IUseragentStaticMethods, IUseragentMethods } from '../interfaces';

const SCHEMA = new Schema<IUseragentDocument, IUseragentStaticMethods, IUseragentMethods>({
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
  userAgent: { type: string, required: false },
  platform: { type: string, required: false },
  appName: { type: string, required: false },
  appVersion: { type: string, required: false },
  vendor: { type: string, required: false },
  language: { type: string, required: false },
  cookieEnabled: { type: boolean, required: false },
});

export default mongoose.model('UserAgent', SCHEMA);
