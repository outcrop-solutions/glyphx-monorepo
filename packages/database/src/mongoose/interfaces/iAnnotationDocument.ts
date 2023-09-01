import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IAnnotationDocument
  extends Omit<databaseTypes.IAnnotation, 'author'> {
  author: mongooseTypes.ObjectId;
}
