import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  ISessionMethods,
  ISessionStaticMethods,
  ISessionDocument,
} from '../interfaces';
import {error} from '@glyphx/core';
import {UserModel} from './user';

const schema = new Schema<
  ISessionDocument,
  ISessionStaticMethods,
  ISessionMethods
>({
  sessionToken: {type: String, required: true},
  expires: {type: Date, required: true},
  user: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
});

schema.static(
  'sessionIdExists',
  async (sessionId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await SessionModel.findById(sessionId, ['_id']);
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

schema.static(
  'getSessionById',
  async (sessionId: mongooseTypes.ObjectId) => {}
);

schema.static(
  'createSession',
  async (
    input: Omit<databaseTypes.ISession, '_id'>
  ): Promise<databaseTypes.ISession> => {
    const userExists = await UserModel.userIdExists(
      input.user._id as mongooseTypes.ObjectId
    );
    if (!userExists)
      throw new error.InvalidArgumentError(
        `A user with _id : ${input.user._id} cannot be found`,
        'user._id',
        input.user._id
      );

    const transformedDocument: ISessionDocument = {
      sessionToken: input.sessionToken,
      expires: input.expires,
      user: input.user._id as mongooseTypes.ObjectId,
    };

    try {
      await SessionModel.validate(transformedDocument);
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
        await SessionModel.create([
          transformedDocument,
          {validateBeforeSave: false},
        ])
      )[0];
      return await SessionModel.getSessionById(createdDocument._id);
    } catch (err) {
      throw new error.DatabaseOperationError(
        'An unexpected error occurred wile creating the session. See the inner error for additional information',
        'mongoDb',
        'create session',
        input,
        err
      );
    }
  }
);

schema.static(
  'validateUpdateObject',
  async (
    session: Omit<Partial<databaseTypes.ISession>, '_id'>
  ): Promise<void> => {
    if (session.user?._id && !(await UserModel.userIdExists(session.user?._id)))
      throw new error.InvalidOperationError(
        `A User with the _id: ${session.user._id} cannot be found`,
        {userId: session.user._id}
      );

    if ((session as unknown as databaseTypes.ISession)._id)
      throw new error.InvalidOperationError(
        "A Session's _id is imutable and cannot be changed",
        {
          _id: (session as unknown as databaseTypes.ISession)._id,
        }
      );
  }
);

schema.static(
  'updateSessionWithFilter',
  async (
    filter: Record<string, unknown>,
    session: Omit<Partial<databaseTypes.ISession>, '_id'>
  ): Promise<boolean> => {
    await SessionModel.validateUpdateObject(session);
    try {
      const transformedSession: Partial<ISessionDocument> &
        Record<string, any> = {};
      for (const key in session) {
        const value = (session as Record<string, any>)[key];
        if (key !== 'user') transformedSession[key] = value;
        else {
          //we only store the user id in our account collection
          transformedSession[key] = value._id;
        }
      }
      const updateResult = await SessionModel.updateOne(
        filter,
        transformedSession
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No session document with filter: ${filter} was found`,
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

schema.static(
  'updateSessionById',
  async (
    sessionId: mongooseTypes.ObjectId,
    session: Omit<Partial<databaseTypes.ISession>, '_id'>
  ): Promise<databaseTypes.ISession> => {
    await SessionModel.updateSessionWithFilter({_id: sessionId}, session);
    const retval = await SessionModel.getSessionById(sessionId);
    return retval;
  }
);

schema.static(
  'deleteSessionById',
  async (sessionId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await SessionModel.deleteOne({_id: sessionId});
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
          `An unexpected error occurred while deleteing the session from the database. The session may still exist.  See the inner error for additional information`,
          'mongoDb',
          'delete session',
          {_id: sessionId},
          err
        );
    }
  }
);

const SessionModel = model<ISessionDocument, ISessionStaticMethods>(
  'session',
  schema
);

export {SessionModel};
