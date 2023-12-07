// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IUserCreateInput} from 'database/src/mongoose/interfaces';

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
          {id: userId},
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

  public static async createUser(data: Partial<databaseTypes.IUser>): Promise<databaseTypes.IUser> {
    try {
      // create user
      const user = await mongoDbConnection.models.UserModel.createUser(data as IUserCreateInput);

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
    userId: string,
    data: Partial<Omit<databaseTypes.IUser, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IUser> {
    try {
      const user = await mongoDbConnection.models.UserModel.updateUserById(userId, {
        ...data,
      });
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

  public static async deleteUser(userId: string): Promise<databaseTypes.IUser> {
    try {
      const user = await mongoDbConnection.models.UserModel.updateUserById(userId, {
        deletedAt: new Date(),
      });
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

  public static async addAccounts(
    userId: string,
    accounts: (databaseTypes.IAccount | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.addAccounts(userId, accounts);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding accounts to the user. See the inner error for additional details',
          'user',
          'addAccounts',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeAccounts(
    userId: string,
    accounts: (databaseTypes.IAccount | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.removeAccounts(userId, accounts);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  accounts from the user. See the inner error for additional details',
          'user',
          'removeAccounts',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addSessions(
    userId: string,
    sessions: (databaseTypes.ISession | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.addSessions(userId, sessions);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding sessions to the user. See the inner error for additional details',
          'user',
          'addSessions',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeSessions(
    userId: string,
    sessions: (databaseTypes.ISession | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.removeSessions(userId, sessions);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  sessions from the user. See the inner error for additional details',
          'user',
          'removeSessions',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addMemberships(
    userId: string,
    members: (databaseTypes.IMember | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.addMemberships(userId, members);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding members to the user. See the inner error for additional details',
          'user',
          'addMemberships',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeMemberships(
    userId: string,
    members: (databaseTypes.IMember | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.removeMemberships(userId, members);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  members from the user. See the inner error for additional details',
          'user',
          'removeMemberships',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addInvitedMembers(
    userId: string,
    members: (databaseTypes.IMember | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.addInvitedMembers(userId, members);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding members to the user. See the inner error for additional details',
          'user',
          'addInvitedMembers',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeInvitedMembers(
    userId: string,
    members: (databaseTypes.IMember | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.removeInvitedMembers(userId, members);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  members from the user. See the inner error for additional details',
          'user',
          'removeInvitedMembers',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addCreatedWorkspaces(
    userId: string,
    workspaces: (databaseTypes.IWorkspace | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.addCreatedWorkspaces(userId, workspaces);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding workspaces to the user. See the inner error for additional details',
          'user',
          'addCreatedWorkspaces',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeCreatedWorkspaces(
    userId: string,
    workspaces: (databaseTypes.IWorkspace | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.removeCreatedWorkspaces(userId, workspaces);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  workspaces from the user. See the inner error for additional details',
          'user',
          'removeCreatedWorkspaces',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addProjects(
    userId: string,
    projects: (databaseTypes.IProject | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.addProjects(userId, projects);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding projects to the user. See the inner error for additional details',
          'user',
          'addProjects',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeProjects(
    userId: string,
    projects: (databaseTypes.IProject | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.removeProjects(userId, projects);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  projects from the user. See the inner error for additional details',
          'user',
          'removeProjects',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addCustomerPayment(
    userId: string,
    customerPayment: databaseTypes.ICustomerPayment | string
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.addCustomerPayment(userId, customerPayment);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    userId: string,
    customerPayment: databaseTypes.ICustomerPayment | string
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.removeCustomerPayment(userId, customerPayment);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  customerPayment from the user. See the inner error for additional details',
          'user',
          'removeCustomerPayment',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addWebhooks(
    userId: string,
    webhooks: (databaseTypes.IWebhook | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.addWebhooks(userId, webhooks);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding webhooks to the user. See the inner error for additional details',
          'user',
          'addWebhooks',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeWebhooks(
    userId: string,
    webhooks: (databaseTypes.IWebhook | string)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const updatedUser = await mongoDbConnection.models.UserModel.removeWebhooks(userId, webhooks);

      return updatedUser;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  webhooks from the user. See the inner error for additional details',
          'user',
          'removeWebhooks',
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
