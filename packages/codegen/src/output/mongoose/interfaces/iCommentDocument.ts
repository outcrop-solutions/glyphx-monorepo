import { database as databaseTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';

export interface ICommentCreateInput extends Omit<databaseTypes.IComment, 'user' | 'state'> {
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
  state: mongooseTypes.ObjectId | databaseTypes.IState;
}
