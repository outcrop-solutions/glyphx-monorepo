// import emailClient from 'email';
import {databaseTypes, emailTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from '../lib/databaseConnection';
import {v4} from 'uuid';

export class UserService {
  public static async getUser(userId: string): Promise<databaseTypes.IUser | null> {
    try {
      const user = await mongoDbConnection.models.UserModel.getUserById(userId);
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
          {userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getUsers(filter?: Record<string, unknown>): Promise<databaseTypes.IUser[] | null> {
    try {
      const users = await mongoDbConnection.models.UserModel.queryUsers(filter);
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

  public static async deactivate(userId: string): Promise<databaseTypes.IUser> {
    try {
      const user = await mongoDbConnection.models.UserModel.updateUserById(userId, {
        deletedAt: new Date(),
      });

      // delete associated workspaces
      await mongoDbConnection.models.WorkspaceModel.updateWorkspaceByFilter(
        {creator: userId},
        {
          deletedAt: new Date(),
        }
      );

      // delete associated memberships
      await mongoDbConnection.models.MemberModel.updateMemberWithFilter(
        {member: userId},
        {
          deletedAt: new Date(),
        }
      );

      // if (paymentId) {
      //   // delete associated customerPayments
      await mongoDbConnection.models.CustomerPaymentModel.updateCustomerPaymentWithFilter(
        {email: user.email},
        {
          deletedAt: new Date(),
        }
      );

      return user;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateUser',
          {userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateEmail(userId: string, email: string, previousEmail: string): Promise<databaseTypes.IUser> {
    try {
      const user = await mongoDbConnection.models.UserModel.updateUserById(userId, {
        email,
        emailVerified: undefined,
      });

      await mongoDbConnection.models.MemberModel.updateMemberWithFilter({email: previousEmail}, {email: email});

      await mongoDbConnection.models.MemberModel.updateMemberWithFilter({inviter: previousEmail}, {inviter: email});

      await mongoDbConnection.models.CustomerPaymentModel.updateCustomerPaymentWithFilter(
        {email: previousEmail},
        {email: email}
      );

      return user;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the user. See the inner error for additional details',
          'user',
          'updateUser',
          {userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateName(userId: string, name: string): Promise<databaseTypes.IUser> {
    try {
      const user = await mongoDbConnection.models.UserModel.updateUserById(userId, {
        name,
      });
      return user;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the user. See the inner error for additional details',
          'user',
          'updateUser',
          {userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateUserCode(userId: string): Promise<databaseTypes.IUser> {
    try {
      const user = await mongoDbConnection.models.UserModel.updateUserById(userId, {
        userCode: v4().replaceAll('-', ''),
      });
      return user;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the user. See the inner error for additional details',
          'user',
          'updateUser',
          {userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
