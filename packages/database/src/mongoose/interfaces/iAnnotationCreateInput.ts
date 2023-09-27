import {databaseTypes} from 'types';

export interface IAnnotationCreateInput
  extends Omit<databaseTypes.IAnnotation, '_id' | 'createdAt' | 'updatedAt' | 'author'> {
  author: string | databaseTypes.IUser;
}
