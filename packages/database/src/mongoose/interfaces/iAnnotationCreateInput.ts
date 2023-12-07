// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';

export interface IAnnotationCreateInput
  extends Omit<databaseTypes.IAnnotation, '_id' | 'createdAt' | 'updatedAt' | 'author' | 'state'> {
  author: string | databaseTypes.IUser;
  state: string | databaseTypes.IState;
}
