import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IAnnotationCreateInput
  extends Omit<
    databaseTypes.IAnnotation,
    '_id' | 'createdAt' | 'updatedAt' | 'author'
  > {
  author: mongooseTypes.ObjectId | databaseTypes.IUser;
}
