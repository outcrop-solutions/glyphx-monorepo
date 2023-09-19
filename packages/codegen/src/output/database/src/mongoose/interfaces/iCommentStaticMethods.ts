// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types'
import {ICommentMethods} from './iCommentMethods';
import {ICommentCreateInput} from './iCommentCreateInput';

export interface ICommentStaticMethods
  extends Model<databaseTypes.IComment, {}, ICommentMethods> {
  commentIdExists(commentId: mongooseTypes.ObjectId): Promise<boolean>;
  allCommentIdsExist(commentIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createComment(input: ICommentCreateInput): Promise<databaseTypes.IComment>;
  getCommentById(commentId: mongooseTypes.ObjectId): Promise<databaseTypes.IComment>;
  queryComments(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IComment>>;
  updateCommentWithFilter(filter: Record<string, unknown>, comment: Omit<Partial<databaseTypes.IComment>, '_id'>): Promise<databaseTypes.IComment>;
  updateCommentById(commentId: mongooseTypes.ObjectId, comment: Omit<Partial<databaseTypes.IComment>, '_id'>): Promise<databaseTypes.IComment>;
  deleteCommentById(commentId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(comment: Omit<Partial<databaseTypes.IComment>, '_id'>): Promise<void>;
      addAuthor(
        commentId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IComment>;
      removeAuthor(
        commentId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IComment>;
      validateAuthor(
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
          addState(
        commentId: mongooseTypes.ObjectId, 
        state: databaseTypes.IState | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IComment>;
      removeState(
        commentId: mongooseTypes.ObjectId, 
        state: databaseTypes.IState | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IComment>;
      validateState(
        state: databaseTypes.IState | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
    }
