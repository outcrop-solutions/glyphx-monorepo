// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IAnnotationDocument extends Omit<databaseTypes.IAnnotation, 'author' | 'state'> {
  author: mongooseTypes.ObjectId;
  state: mongooseTypes.ObjectId;
}
