import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface ICommentCreateInput
  extends Omit<databaseTypes.IComment, '_id' | 'createdAt' | 'updatedAt'  | 'author' | 'state'> {
            author: mongooseTypes.ObjectId | databaseTypes.IUser;
            state: mongooseTypes.ObjectId | databaseTypes.IState;
}
