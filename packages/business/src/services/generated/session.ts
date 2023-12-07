// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';
import {ISessionCreateInput} from 'database/src/mongoose/interfaces';

export class SessionService {
  public static async getSession(sessionId: string): Promise<databaseTypes.ISession | null> {
    try {
      const session = await mongoDbConnection.models.SessionModel.getSessionById(sessionId);
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

  public static async getSessions(filter?: Record<string, unknown>): Promise<databaseTypes.ISession[] | null> {
    try {
      const sessions = await mongoDbConnection.models.SessionModel.querySessions(filter);
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

  public static async createSession(data: Partial<databaseTypes.ISession>): Promise<databaseTypes.ISession> {
    try {
      // create session
      const session = await mongoDbConnection.models.SessionModel.createSession(data as ISessionCreateInput);

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
    sessionId: string,
    data: Partial<Omit<databaseTypes.ISession, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.ISession> {
    try {
      const session = await mongoDbConnection.models.SessionModel.updateSessionById(sessionId, {
        ...data,
      });
      return session;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateSession',
          {sessionId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteSession(sessionId: string): Promise<databaseTypes.ISession> {
    try {
      const session = await mongoDbConnection.models.SessionModel.updateSessionById(sessionId, {
        deletedAt: new Date(),
      });
      return session;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateSession',
          {sessionId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addUser(sessionId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.ISession> {
    try {
      const updatedSession = await mongoDbConnection.models.SessionModel.addUser(sessionId, user);

      return updatedSession;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    sessionId: string,
    user: databaseTypes.IUser | string
  ): Promise<databaseTypes.ISession> {
    try {
      const updatedSession = await mongoDbConnection.models.SessionModel.removeUser(sessionId, user);

      return updatedSession;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the session. See the inner error for additional details',
          'session',
          'removeUser',
          {id: sessionId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
