// THIS CODE WAS AUTOMATICALLY GENERATED
import { databaseTypes } from '../../../../database';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class AccountService {
  public static async getAccount(
    accountId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IAccount | null> {
    try {
      const id =
        accountId instanceof mongooseTypes.ObjectId
          ? accountId
          : new mongooseTypes.ObjectId(accountId);
      const account =
        await mongoDbConnection.models.AccountModel.getAccountById(id);
      return account;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the account. See the inner error for additional details',
          'account',
          'getAccount',
          {id: accountId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getAccounts(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IAccount[] | null> {
    try {
      const accounts =
        await mongoDbConnection.models.AccountModel.queryAccounts(filter);
      return accounts?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting accounts. See the inner error for additional details',
          'accounts',
          'getAccounts',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createAccount(
    data: Partial<databaseTypes.IAccount>,
  ): Promise<databaseTypes.IAccount> {
    try {
      // create account
      const account = await mongoDbConnection.models.AccountModel.createAccount(
        data
      );

      return account;
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
          'An unexpected error occurred while creating the account. See the inner error for additional details',
          'account',
          'createAccount',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateAccount(
    accountId: mongooseTypes.ObjectId | string,
    data: Partial<Omit<
      databaseTypes.IAccount,
      | '_id'
      | 'createdAt'
      | 'updatedAt'
    >>
  ): Promise<databaseTypes.IAccount> {
    try {
      const id =
        accountId instanceof mongooseTypes.ObjectId
          ? accountId
          : new mongooseTypes.ObjectId(accountId);
      const account =
        await mongoDbConnection.models.AccountModel.updateAccountById(id, {
          ...data
        });
      return account;
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
          'updateAccount',
          { accountId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteAccount(
    accountId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IAccount> {
    try {
      const id =
        accountId instanceof mongooseTypes.ObjectId
          ? accountId
          : new mongooseTypes.ObjectId(accountId);
      const account =
        await mongoDbConnection.models.AccountModel.updateAccountById(id, {
          deletedAt: new Date(),
        });
      return account;
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
          'updateAccount',
          { accountId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

public static async addUser(
    accountId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IAccount> {
    try {
      const id =
        accountId instanceof mongooseTypes.ObjectId
          ? accountId
          : new mongooseTypes.ObjectId(accountId);
      const updatedAccount =
        await mongoDbConnection.models.AccountModel.addUser(id, user);

      return updatedAccount;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the account. See the inner error for additional details',
          'account',
          'addUser',
          {id: accountId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeUser(
    accountId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IAccount> {
    try {
      const id =
         accountId instanceof mongooseTypes.ObjectId
          ?  accountId
          : new mongooseTypes.ObjectId( accountId);
      const updatedAccount =
        await mongoDbConnection.models.UserModel.removeUser(id, user);

      return updatedAccount;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the account. See the inner error for additional details',
          'account',
          'removeUser',
          {id:  accountId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

}