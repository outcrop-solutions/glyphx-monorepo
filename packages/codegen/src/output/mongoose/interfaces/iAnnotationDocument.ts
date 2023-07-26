import { database as databaseTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';

export interface IAnnotationCreateInput extends Omit<databaseTypes.IAnnotation, 'user'> {
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
}
