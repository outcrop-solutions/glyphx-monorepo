import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {ICommentDocument, ICommentCreateInput, ICommentStaticMethods, ICommentMethods} from '../interfaces';
import { AuthorModel} from './author'
import { StateModel} from './state'

const SCHEMA = new Schema<ICommentDocument, ICommentStaticMethods, ICommentMethods>({
  createdAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  updatedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  deletedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  content: {
    type: String,
    required: true,
      default: false
      },
  author: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'user'
  },
  state: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'state'
  }
})

SCHEMA.static(
  'commentIdExists',
  async (commentId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await COMMENT_MODEL.findById(commentId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the comment.  See the inner error for additional information',
        'mongoDb',
        'commentIdExists',
        {_id: commentId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allCommentIdsExist',
  async (commentIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await COMMENT_MODEL.find({_id: {$in: commentIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      commentIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more commentIds cannot be found in the database.',
          'comment._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the commentIds.  See the inner error for additional information',
          'mongoDb',
          'allCommentIdsExists',
          { commentIds: commentIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (
    comment: Omit<Partial<databaseTypes.IComment>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a comment with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

        if (comment.author)
          tasks.push(
            idValidator(
              comment.author._id as mongooseTypes.ObjectId,
              'Author',
              AuthorModel.authorIdExists
            )
          );
        if (comment.state)
          tasks.push(
            idValidator(
              comment.state._id as mongooseTypes.ObjectId,
              'State',
              StateModel.stateIdExists
            )
          );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (comment.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: comment.createdAt}
      );
    if (comment.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: comment.updatedAt}
      );
    if ((comment as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The comment._id is immutable and cannot be changed',
        {_id: (comment as Record<string, unknown>)['_id']}
      );
  }
);

SCHEMA.static(
  'createComment',
  async (input: ICommentCreateInput): Promise<databaseTypes.IComment> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [ 
        ] = await Promise.all([
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: ICommentDocument = {
        createdAt: createDate,
        updatedAt: createDate
          ,content: input.content
          ,author: input.author
          ,state: input.state
      };
      try {
        await COMMENT_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'ICommentDocument',
          resolvedInput,
          err
        );
      }
      const commentDocument = (
        await COMMENT_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = commentDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the comment.  See the inner error for additional details',
          'mongoDb',
          'addComment',
          {},
          err
        );
      }
    }
    if (id) return await COMMENT_MODEL.getCommentById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the comment may not have been created.  I have no other information to provide.'
      );
  }
);

SCHEMA.static('getCommentById', async (commentId: mongooseTypes.ObjectId) => {
  try {
    const commentDocument = (await COMMENT_MODEL.findById(commentId)
      .populate('author')
      .populate('state')
      .lean()) as databaseTypes.IComment;
    if (!commentDocument) {
      throw new error.DataNotFoundError(
        `Could not find a comment with the _id: ${ commentId}`,
        'comment_id',
        commentId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (commentDocument as any)['__v'];

    delete (commentDocument as any).author?.['__v'];
    delete (commentDocument as any).state?.['__v'];

    return commentDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getCommentById',
        err
      );
  }
});

SCHEMA.static(
  'updateCommentWithFilter',
  async (
    filter: Record<string, unknown>,
    comment: Omit<Partial<databaseTypes.IComment>, '_id'>
  ): Promise<void> => {
    try {
      await COMMENT_MODEL.validateUpdateObject(comment);
      const updateDate = new Date();
      const transformedObject: Partial<ICommentDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in comment) {
        const value = (comment as Record<string, any>)[key];
          if (key === 'author')
            transformedObject.author =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
          if (key === 'state')
            transformedObject.state =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await COMMENT_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No comment document with filter: ${filter} was found',
          'filter',
          filter
        );
      }
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      )
        throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the project with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update comment',
          {filter: filter, comment : comment },
          err
        );
    }
  }
);

SCHEMA.static(
  'queryComments',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await COMMENT_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find comments with the filter: ${filter}`,
          'queryComments',
          filter
        );
      }

      const skip = itemsPerPage * page;
      if (skip > count) {
        throw new error.InvalidArgumentError(
          `The page number supplied: ${page} exceeds the number of pages contained in the reults defined by the filter: ${Math.floor(
            count / itemsPerPage
          )}`,
          'page',
          page
        );
      }

      const commentDocuments = (await COMMENT_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('author')
        .populate('state')
        .lean()) as databaseTypes.IComment[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      commentDocuments.forEach((doc: any) => {
      delete (doc as any)['__v'];
      delete (doc as any).author?.['__v'];
      delete (doc as any).state?.['__v'];
      });

      const retval: IQueryResult<databaseTypes.IComment> = {
        results: commentDocuments,
        numberOfItems: count,
        page: page,
        itemsPerPage: itemsPerPage,
      };

      return retval;
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while getting the comments.  See the inner error for additional information',
          'mongoDb',
          'queryComments',
          err
        );
    }
  }
);

SCHEMA.static(
  'deleteCommentById',
  async (commentId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await COMMENT_MODEL.deleteOne({_id: commentId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A comment with a _id: ${ commentId} was not found in the database`,
          '_id',
          commentId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the comment from the database. The comment may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete comment',
          {_id: commentId},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateCommentById',
  async (
    commentId: mongooseTypes.ObjectId,
    comment: Omit<Partial<databaseTypes.IComment>, '_id'>
  ): Promise<databaseTypes.IComment> => {
    await COMMENT_MODEL.updateCommentWithFilter({_id: commentId}, comment);
    return await COMMENT_MODEL.getCommentById(commentId);
  }
);






// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['comment'];

const COMMENT_MODEL = model<ICommentDocument, ICommentStaticMethods>(
  'comment',
  SCHEMA
);

export { COMMENT_MODEL as CommentModel };
;
