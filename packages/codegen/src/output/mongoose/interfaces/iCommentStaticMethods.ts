import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { ICommentMethods } from './iCommentMethods';
import { ICommentCreateInput } from './iCommentCreateInput';

export interface ICommentStaticMethods extends Model<databaseTypes.IComment, {}, ICommentMethods> {
  commentIdExists(commentId: mongooseTypes.ObjectId): Promise<boolean>;
  allCommentIdsExist(commentIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createComment(input: ICommentCreateInput): Promise<databaseTypes.IComment>;
  getCommentById(commentId: mongooseTypes.ObjectId): Promise<databaseTypes.IComment>;
  queryComments(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IComment>>;
  updateCommentWithFilter(
    filter: Record<string, unknown>,
    comment: Omit<Partial<databaseTypes.IComment>, '_id'>
  ): Promise<databaseTypes.IComment>;
  updateCommentById(
    commentId: mongooseTypes.ObjectId,
    comment: Omit<Partial<databaseTypes.IComment>, '_id'>
  ): Promise<databaseTypes.IComment>;
  deleteCommentById(commentId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(comment: Omit<Partial<databaseTypes.IComment>, '_id'>): Promise<void>;
  addUsers(
    commentId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IComment>;
  removeUsers(
    commentId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IComment>;
  validateUsers(users: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;

  addStates(
    commentId: mongooseTypes.ObjectId,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IComment>;
  removeStates(
    commentId: mongooseTypes.ObjectId,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IComment>;
  validateStates(states: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;
}
