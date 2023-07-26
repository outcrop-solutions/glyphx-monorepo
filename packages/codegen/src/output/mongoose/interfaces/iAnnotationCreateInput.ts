import { database as databaseTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';

export interface IAnnotationCreateInput
  extends Omit<databaseTypes.IAnnotation, '_id' | 'createdAt' | 'updatedAt' | 'user'> {
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
}
