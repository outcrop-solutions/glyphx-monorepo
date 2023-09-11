// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface ICommentDocument
  extends Omit<databaseTypes.IComment, 'author' | 'state'> {
  author: mongooseTypes.ObjectId;
  state: mongooseTypes.ObjectId;
}
