import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IAnnotationDocument
  extends Omit<databaseTypes.IAnnotation, 'author'> {
  author: mongooseTypes.ObjectId;
}
