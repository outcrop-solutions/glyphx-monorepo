// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {
  ISessionDocument,
  ISessionCreateInput,
  ISessionStaticMethods,
  ISessionMethods,
} from '../interfaces';
import {UserModel} from './user';

const SCHEMA = new Schema<
  ISessionDocument,
  ISessionStaticMethods,
  ISessionMethods
>({
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
  userId: {
    type: String,
    required: false,
  },
  sessionToken: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: false,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  user: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'user',
  },
});

SCHEMA.static(
  'sessionIdExists',
  async (sessionId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await SESSION_MODEL.findById(sessionId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the session.  See the inner error for additional information',
        'mongoDb',
        'sessionIdExists',
        {_id: sessionId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allSessionIdsExist',
  async (sessionIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await SESSION_MODEL.find({_id: {$in: sessionIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      sessionIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more sessionIds cannot be found in the database.',
          'session._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the sessionIds.  See the inner error for additional information',
          'mongoDb',
          'allSessionIdsExists',
          {sessionIds: sessionIds},
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
    session: Omit<Partial<databaseTypes.ISession>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a session with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (session.user)
      tasks.push(
        idValidator(
          session.user._id as mongooseTypes.ObjectId,
          'User',
          UserModel.userIdExists
        )
      );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (session.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: session.createdAt}
      );
    if (session.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: session.updatedAt}
      );
    if ((session as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The session._id is immutable and cannot be changed',
        {_id: (session as Record<string, unknown>)['_id']}
      );
  }
);

// CREATE
SCHEMA.static(
  'createSession',
  async (input: ISessionCreateInput): Promise<databaseTypes.ISession> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [user] = await Promise.all([
        SESSION_MODEL.validateUser(input.user),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: ISessionDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        userId: input.userId,
        sessionToken: input.sessionToken,
        expires: input.expires,
        user: user,
      };
      try {
        await SESSION_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'ISessionDocument',
          resolvedInput,
          err
        );
      }
      const sessionDocument = (
        await SESSION_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = sessionDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the session.  See the inner error for additional details',
          'mongoDb',
          'addSession',
          {},
          err
        );
      }
    }
    if (id) return await SESSION_MODEL.getSessionById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the session may not have been created.  I have no other information to provide.'
      );
  }
);

// READ
SCHEMA.static('getSessionById', async (sessionId: mongooseTypes.ObjectId) => {
  try {
    const sessionDocument = (await SESSION_MODEL.findById(sessionId)
      .populate('user')
      .lean()) as databaseTypes.ISession;
    if (!sessionDocument) {
      throw new error.DataNotFoundError(
        `Could not find a session with the _id: ${sessionId}`,
        'session_id',
        sessionId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (sessionDocument as any)['__v'];

    delete (sessionDocument as any).user?.['__v'];

    return sessionDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getSessionById',
        err
      );
  }
});

SCHEMA.static(
  'querySessions',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await SESSION_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find sessions with the filter: ${filter}`,
          'querySessions',
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

      const sessionDocuments = (await SESSION_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('user')
        .lean()) as databaseTypes.ISession[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      sessionDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        delete (doc as any).user?.['__v'];
      });

      const retval: IQueryResult<databaseTypes.ISession> = {
        results: sessionDocuments,
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
          'An unexpected error occurred while getting the sessions.  See the inner error for additional information',
          'mongoDb',
          'querySessions',
          err
        );
    }
  }
);

// UPDATE
SCHEMA.static(
  'updateSessionWithFilter',
  async (
    filter: Record<string, unknown>,
    session: Omit<Partial<databaseTypes.ISession>, '_id'>
  ): Promise<void> => {
    try {
      await SESSION_MODEL.validateUpdateObject(session);
      const updateDate = new Date();
      const transformedObject: Partial<ISessionDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in session) {
        const value = (session as Record<string, any>)[key];
        if (key === 'user')
          transformedObject.user =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await SESSION_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No session document with filter: ${filter} was found',
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
          'update session',
          {filter: filter, session: session},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateSessionById',
  async (
    sessionId: mongooseTypes.ObjectId,
    session: Omit<Partial<databaseTypes.ISession>, '_id'>
  ): Promise<databaseTypes.ISession> => {
    await SESSION_MODEL.updateSessionWithFilter({_id: sessionId}, session);
    return await SESSION_MODEL.getSessionById(sessionId);
  }
);

// DELETE
SCHEMA.static(
  'deleteSessionById',
  async (sessionId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await SESSION_MODEL.deleteOne({_id: sessionId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A session with a _id: ${sessionId} was not found in the database`,
          '_id',
          sessionId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the session from the database. The session may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete session',
          {_id: sessionId},
          err
        );
    }
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['session'];

const SESSION_MODEL = model<ISessionDocument, ISessionStaticMethods>(
  'session',
  SCHEMA
);

export {SESSION_MODEL as SessionModel};
