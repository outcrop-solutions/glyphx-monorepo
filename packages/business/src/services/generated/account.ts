// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IAccountCreateInput} from 'database/src/mongoose/interfaces';

export class AccountService {
  public static async getAccount(accountId: string): Promise<databaseTypes.IAccount | null> {
    try {
      const account = await mongoDbConnection.models.AccountModel.getAccountById(accountId);
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

  public static async getAccounts(filter?: Record<string, unknown>): Promise<databaseTypes.IAccount[] | null> {
    try {
      const accounts = await mongoDbConnection.models.AccountModel.queryAccounts(filter);
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

  public static async createAccount(data: Partial<databaseTypes.IAccount>): Promise<databaseTypes.IAccount> {
    try {
      // create account
      const account = await mongoDbConnection.models.AccountModel.createAccount(data as IAccountCreateInput);

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
    accountId: string,
    data: Partial<Omit<databaseTypes.IAccount, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IAccount> {
    try {
      const account = await mongoDbConnection.models.AccountModel.updateAccountById(accountId, {
        ...data,
      });
      return account;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateAccount',
          {accountId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteAccount(accountId: string): Promise<databaseTypes.IAccount> {
    try {
      const account = await mongoDbConnection.models.AccountModel.updateAccountById(accountId, {
        deletedAt: new Date(),
      });
      return account;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateAccount',
          {accountId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addUser(accountId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IAccount> {
    try {
      const updatedAccount = await mongoDbConnection.models.AccountModel.addUser(accountId, user);

      return updatedAccount;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    accountId: string,
    user: databaseTypes.IUser | string
  ): Promise<databaseTypes.IAccount> {
    try {
      const updatedAccount = await mongoDbConnection.models.AccountModel.removeUser(accountId, user);

      return updatedAccount;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the account. See the inner error for additional details',
          'account',
          'removeUser',
          {id: accountId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
