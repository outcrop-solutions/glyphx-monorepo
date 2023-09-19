// THIS CODE WAS AUTOMATICALLY GENERATED
import { databaseTypes } from '../../../../database';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class SessionService {
  public static async getSession(
    sessionId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.ISession | null> {
    try {
      const id =
        sessionId instanceof mongooseTypes.ObjectId
          ? sessionId
          : new mongooseTypes.ObjectId(sessionId);
      const session =
        await mongoDbConnection.models.SessionModel.getSessionById(id);
      return session;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the session. See the inner error for additional details',
          'session',
          'getSession',
          {id: sessionId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getSessions(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.ISession[] | null> {
    try {
      const sessions =
        await mongoDbConnection.models.SessionModel.querySessions(filter);
      return sessions?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting sessions. See the inner error for additional details',
          'sessions',
          'getSessions',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createSession(
    data: Partial<databaseTypes.ISession>,
  ): Promise<databaseTypes.ISession> {
    try {
      // create session
      const session = await mongoDbConnection.models.SessionModel.createSession(
        data
      );

      return session;
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
          'An unexpected error occurred while creating the session. See the inner error for additional details',
          'session',
          'createSession',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateSession(
    sessionId: mongooseTypes.ObjectId | string,
    data: Partial<Omit<
      databaseTypes.ISession,
      | '_id'
      | 'createdAt'
      | 'updatedAt'
    >>
  ): Promise<databaseTypes.ISession> {
    try {
      const id =
        sessionId instanceof mongooseTypes.ObjectId
          ? sessionId
          : new mongooseTypes.ObjectId(sessionId);
      const session =
        await mongoDbConnection.models.SessionModel.updateSessionById(id, {
          ...data
        });
      return session;
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
          'updateSession',
          { sessionId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteSession(
    sessionId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.ISession> {
    try {
      const id =
        sessionId instanceof mongooseTypes.ObjectId
          ? sessionId
          : new mongooseTypes.ObjectId(sessionId);
      const session =
        await mongoDbConnection.models.SessionModel.updateSessionById(id, {
          deletedAt: new Date(),
        });
      return session;
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
          'updateSession',
          { sessionId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

public static async addUser(
    sessionId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ISession> {
    try {
      const id =
        sessionId instanceof mongooseTypes.ObjectId
          ? sessionId
          : new mongooseTypes.ObjectId(sessionId);
      const updatedSession =
        await mongoDbConnection.models.SessionModel.addUser(id, user);

      return updatedSession;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the session. See the inner error for additional details',
          'session',
          'addUser',
          {id: sessionId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeUser(
    sessionId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ISession> {
    try {
      const id =
         sessionId instanceof mongooseTypes.ObjectId
          ?  sessionId
          : new mongooseTypes.ObjectId( sessionId);
      const updatedSession =
        await mongoDbConnection.models.UserModel.removeUser(id, user);

      return updatedSession;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the session. See the inner error for additional details',
          'session',
          'removeUser',
          {id:  sessionId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

}