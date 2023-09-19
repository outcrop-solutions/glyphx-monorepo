// THIS CODE WAS AUTOMATICALLY GENERATED
import { databaseTypes } from '../../../../database';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class UserService {
  public static async getUser(
    userId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IUser | null> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const user =
        await mongoDbConnection.models.UserModel.getUserById(id);
      return user;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the user. See the inner error for additional details',
          'user',
          'getUser',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getUsers(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IUser[] | null> {
    try {
      const users =
        await mongoDbConnection.models.UserModel.queryUsers(filter);
      return users?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting users. See the inner error for additional details',
          'users',
          'getUsers',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createUser(
    data: Partial<databaseTypes.IUser>,
  ): Promise<databaseTypes.IUser> {
    try {
      // create user
      const user = await mongoDbConnection.models.UserModel.createUser(
        data
      );

      return user;
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
          'An unexpected error occurred while creating the user. See the inner error for additional details',
          'user',
          'createUser',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateUser(
    userId: mongooseTypes.ObjectId | string,
    data: Partial<Omit<
      databaseTypes.IUser,
      | '_id'
      | 'createdAt'
      | 'updatedAt'
    >>
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const user =
        await mongoDbConnection.models.UserModel.updateUserById(id, {
          ...data
        });
      return user;
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
          'updateUser',
          { userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteUser(
    userId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const user =
        await mongoDbConnection.models.UserModel.updateUserById(id, {
          deletedAt: new Date(),
        });
      return user;
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
          'updateUser',
          { userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

public static async addCustomerPayment(
    userId: mongooseTypes.ObjectId | string,
    customerPayment: (databaseTypes.ICustomerPayment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.UserModel.addCustomerPayment(id, customerPayment);

      return updatedUser;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding customerPayment to the user. See the inner error for additional details',
          'user',
          'addCustomerPayment',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeCustomerPayment(
    userId: mongooseTypes.ObjectId | string,
    customerPayment: (databaseTypes.ICustomerPayment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
         userId instanceof mongooseTypes.ObjectId
          ?  userId
          : new mongooseTypes.ObjectId( userId);
      const updatedUser =
        await mongoDbConnection.models.CustomerPaymentModel.removeCustomerPayment(id, customerPayment);

      return updatedUser;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  customerPayment from the user. See the inner error for additional details',
          'user',
          'removeCustomerPayment',
          {id:  userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

}