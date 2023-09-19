// THIS CODE WAS AUTOMATICALLY GENERATED
import { databaseTypes } from '../../../../database';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class UserAgentService {
  public static async getUserAgent(
    userAgentId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IUserAgent | null> {
    try {
      const id =
        userAgentId instanceof mongooseTypes.ObjectId
          ? userAgentId
          : new mongooseTypes.ObjectId(userAgentId);
      const userAgent =
        await mongoDbConnection.models.UserAgentModel.getUserAgentById(id);
      return userAgent;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the userAgent. See the inner error for additional details',
          'userAgent',
          'getUserAgent',
          {id: userAgentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getUserAgents(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IUserAgent[] | null> {
    try {
      const userAgents =
        await mongoDbConnection.models.UserAgentModel.queryUserAgents(filter);
      return userAgents?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting userAgents. See the inner error for additional details',
          'userAgents',
          'getUserAgents',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createUserAgent(
    data: Partial<databaseTypes.IUserAgent>,
  ): Promise<databaseTypes.IUserAgent> {
    try {
      // create userAgent
      const userAgent = await mongoDbConnection.models.UserAgentModel.createUserAgent(
        data
      );

      return userAgent;
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
          'An unexpected error occurred while creating the userAgent. See the inner error for additional details',
          'userAgent',
          'createUserAgent',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateUserAgent(
    userAgentId: mongooseTypes.ObjectId | string,
    data: Partial<Omit<
      databaseTypes.IUserAgent,
      | '_id'
      | 'createdAt'
      | 'updatedAt'
    >>
  ): Promise<databaseTypes.IUserAgent> {
    try {
      const id =
        userAgentId instanceof mongooseTypes.ObjectId
          ? userAgentId
          : new mongooseTypes.ObjectId(userAgentId);
      const userAgent =
        await mongoDbConnection.models.UserAgentModel.updateUserAgentById(id, {
          ...data
        });
      return userAgent;
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
          'updateUserAgent',
          { userAgentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteUserAgent(
    userAgentId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IUserAgent> {
    try {
      const id =
        userAgentId instanceof mongooseTypes.ObjectId
          ? userAgentId
          : new mongooseTypes.ObjectId(userAgentId);
      const userAgent =
        await mongoDbConnection.models.UserAgentModel.updateUserAgentById(id, {
          deletedAt: new Date(),
        });
      return userAgent;
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
          'updateUserAgent',
          { userAgentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}