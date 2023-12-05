// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IAnnotationCreateInput
  extends Omit<databaseTypes.IAnnotation, '_id' | 'createdAt' | 'updatedAt' | 'author' | 'state'> {
  author: string | databaseTypes.IUser;
  state: string | databaseTypes.IState;
}
