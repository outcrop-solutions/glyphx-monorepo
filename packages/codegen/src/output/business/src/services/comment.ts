// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../database';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class CommentService {
  public static async getComment(
    commentId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IComment | null> {
    try {
      const id =
        commentId instanceof mongooseTypes.ObjectId
          ? commentId
          : new mongooseTypes.ObjectId(commentId);
      const comment =
        await mongoDbConnection.models.CommentModel.getCommentById(id);
      return comment;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the comment. See the inner error for additional details',
          'comment',
          'getComment',
          {id: commentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getComments(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IComment[] | null> {
    try {
      const comments =
        await mongoDbConnection.models.CommentModel.queryComments(filter);
      return comments?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting comments. See the inner error for additional details',
          'comments',
          'getComments',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createComment(
    data: Partial<databaseTypes.IComment>
  ): Promise<databaseTypes.IComment> {
    try {
      // create comment
      const comment =
        await mongoDbConnection.models.CommentModel.createComment(data);

      return comment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidOperationError ||
        err instanceof error.InvalidArgumentError ||
        err instanceof error.DataValidationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while creating the comment. See the inner error for additional details',
          'comment',
          'createComment',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateComment(
    commentId: mongooseTypes.ObjectId | string,
    data: Partial<
      Omit<databaseTypes.IComment, '_id' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<databaseTypes.IComment> {
    try {
      const id =
        commentId instanceof mongooseTypes.ObjectId
          ? commentId
          : new mongooseTypes.ObjectId(commentId);
      const comment =
        await mongoDbConnection.models.CommentModel.updateCommentById(id, {
          ...data,
        });
      return comment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateComment',
          {commentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteComment(
    commentId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IComment> {
    try {
      const id =
        commentId instanceof mongooseTypes.ObjectId
          ? commentId
          : new mongooseTypes.ObjectId(commentId);
      const comment =
        await mongoDbConnection.models.CommentModel.updateCommentById(id, {
          deletedAt: new Date(),
        });
      return comment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateComment',
          {commentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addAuthor(
    commentId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IComment> {
    try {
      const id =
        commentId instanceof mongooseTypes.ObjectId
          ? commentId
          : new mongooseTypes.ObjectId(commentId);
      const updatedComment =
        await mongoDbConnection.models.CommentModel.addAuthor(id, user);

      return updatedComment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the comment. See the inner error for additional details',
          'comment',
          'addAuthor',
          {id: commentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeAuthor(
    commentId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IComment> {
    try {
      const id =
        commentId instanceof mongooseTypes.ObjectId
          ? commentId
          : new mongooseTypes.ObjectId(commentId);
      const updatedComment =
        await mongoDbConnection.models.AuthorModel.removeAuthor(id, user);

      return updatedComment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the comment. See the inner error for additional details',
          'comment',
          'removeAuthor',
          {id: commentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addState(
    commentId: mongooseTypes.ObjectId | string,
    state: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IComment> {
    try {
      const id =
        commentId instanceof mongooseTypes.ObjectId
          ? commentId
          : new mongooseTypes.ObjectId(commentId);
      const updatedComment =
        await mongoDbConnection.models.CommentModel.addState(id, state);

      return updatedComment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding state to the comment. See the inner error for additional details',
          'comment',
          'addState',
          {id: commentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeState(
    commentId: mongooseTypes.ObjectId | string,
    state: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IComment> {
    try {
      const id =
        commentId instanceof mongooseTypes.ObjectId
          ? commentId
          : new mongooseTypes.ObjectId(commentId);
      const updatedComment =
        await mongoDbConnection.models.StateModel.removeState(id, state);

      return updatedComment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  state from the comment. See the inner error for additional details',
          'comment',
          'removeState',
          {id: commentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
