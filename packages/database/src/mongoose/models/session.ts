import {IQueryResult, databaseTypes} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {ISessionMethods, ISessionStaticMethods, ISessionDocument, ISessionCreateInput} from '../interfaces';
import {error} from 'core';
import {UserModel} from './user';
import {DBFormatter} from '../../lib/format';

const SCHEMA = new Schema<ISessionDocument, ISessionStaticMethods, ISessionMethods>({
  sessionToken: {type: String, required: true},
  expires: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  userId: {type: String, required: false},
  user: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
});

SCHEMA.static('sessionIdExists', async (sessionId: mongooseTypes.ObjectId): Promise<boolean> => {
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
});

SCHEMA.static('allSessionIdsExist', async (sessionIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await SESSION_MODEL.find({_id: {$in: sessionIds}}, ['_id'])) as {_id: mongooseTypes.ObjectId}[];

    sessionIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
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
});

SCHEMA.static('getSessionById', async (sessionId: string) => {
  try {
    const sessionDocument = (await SESSION_MODEL.findById(sessionId).populate('user').lean()) as databaseTypes.ISession;
    if (!sessionDocument) {
      throw new error.DataNotFoundError(`Could not find a session with the _id: ${sessionId}`, 'session_id', sessionId);
    }
    const format = new DBFormatter();
    return format.toJS(sessionDocument);
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the session.  See the inner error for additional information',
        'mongoDb',
        'getSessionById',
        err
      );
  }
});

SCHEMA.static('querySessions', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
  try {
    const count = await SESSION_MODEL.count(filter);

    if (!count) {
      throw new error.DataNotFoundError(`Could not find sessions with the filter: ${filter}`, 'querySessions', filter);
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

    const format = new DBFormatter();
    const sessions = sessionDocuments.map((doc: any) => {
      return format.toJS(doc);
    });

    const retval: IQueryResult<databaseTypes.ISession> = {
      results: sessions as unknown as databaseTypes.ISession[],
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the sessions.  See the inner error for additional information',
        'mongoDb',
        'querySessions',
        err
      );
  }
});

SCHEMA.static('createSession', async (input: ISessionCreateInput): Promise<databaseTypes.ISession> => {
  const userId =
    typeof input.user === 'string' ? new mongooseTypes.ObjectId(input.user) : new mongooseTypes.ObjectId(input.user.id);
  const userExists = await UserModel.userIdExists(userId);
  if (!userExists)
    throw new error.InvalidArgumentError(`A user with _id : ${userId} cannot be found`, 'user._id', input.user);

  const transformedDocument: ISessionDocument = {
    sessionToken: input.sessionToken,
    expires: input.expires,
    user: userId,
  };

  try {
    await SESSION_MODEL.validate(transformedDocument);
  } catch (err) {
    throw new error.DataValidationError(
      'An error occurred while validating the session document.  See the inner error for additional details.',
      'session',
      transformedDocument,
      err
    );
  }

  try {
    const createdDocument = (
      await SESSION_MODEL.create([transformedDocument], {
        validateBeforeSave: false,
      })
    )[0];
    return await SESSION_MODEL.getSessionById(createdDocument._id.toString());
  } catch (err) {
    throw new error.DatabaseOperationError(
      'An unexpected error occurred wile creating the session. See the inner error for additional information',
      'mongoDb',
      'create session',
      input,
      err
    );
  }
});

SCHEMA.static('validateUpdateObject', async (session: Omit<Partial<databaseTypes.ISession>, '_id'>): Promise<void> => {
  if (session.user?._id && !(await UserModel.userIdExists(session.user?._id)))
    throw new error.InvalidOperationError(`A User with the _id: ${session.user._id} cannot be found`, {
      userId: session.user._id,
    });

  if ((session as unknown as databaseTypes.ISession)._id)
    throw new error.InvalidOperationError("A Session's _id is imutable and cannot be changed", {
      _id: (session as unknown as databaseTypes.ISession)._id,
    });
});

SCHEMA.static(
  'updateSessionWithFilter',
  async (filter: Record<string, unknown>, session: Omit<Partial<databaseTypes.ISession>, '_id'>): Promise<boolean> => {
    await SESSION_MODEL.validateUpdateObject(session);
    try {
      const transformedSession: Partial<ISessionDocument> & Record<string, any> = {};
      for (const key in session) {
        const value = (session as Record<string, any>)[key];
        if (key !== 'user') transformedSession[key] = value;
        else {
          //we only store the user id in our account collection
          transformedSession[key] = value._id;
        }
      }
      const updateResult = await SESSION_MODEL.updateOne(filter, transformedSession);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(`No session document with filter: ${filter} was found`, 'filter', filter);
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the session with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update session',
          {filter: filter, session: session},
          err
        );
    }
    return true;
  }
);

SCHEMA.static(
  'updateSessionById',
  async (sessionId: string, session: Omit<Partial<databaseTypes.ISession>, '_id'>): Promise<databaseTypes.ISession> => {
    await SESSION_MODEL.updateSessionWithFilter({_id: sessionId}, session);
    const retval = await SESSION_MODEL.getSessionById(sessionId);
    return retval;
  }
);

SCHEMA.static('deleteSessionById', async (sessionId: string): Promise<void> => {
  try {
    const results = await SESSION_MODEL.deleteOne({_id: sessionId});
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `An session with a _id: ${sessionId} was not found in the database`,
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
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['session'];

const SESSION_MODEL = model<ISessionDocument, ISessionStaticMethods>('session', SCHEMA);

export {SESSION_MODEL as SessionModel};
