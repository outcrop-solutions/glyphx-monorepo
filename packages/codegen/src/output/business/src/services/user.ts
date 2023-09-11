// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../database';
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
      const user = await mongoDbConnection.models.UserModel.getUserById(id);
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

  public static async createUser(
    data: Partial<databaseTypes.IUser>
  ): Promise<databaseTypes.IUser> {
    try {
      // create user
      const user = await mongoDbConnection.models.UserModel.createUser(data);

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
    data: Partial<Omit<databaseTypes.IUser, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const user = await mongoDbConnection.models.UserModel.updateUserById(id, {
        ...data,
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
          {userId},
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
      const user = await mongoDbConnection.models.UserModel.updateUserById(id, {
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
          {userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addAccounts(
    userId: mongooseTypes.ObjectId | string,
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser = await mongoDbConnection.models.UserModel.addAccounts(
        id,
        accounts
      );

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
    userId: mongooseTypes.ObjectId | string,
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.AccountsModel.removeAccounts(
          id,
          accounts
        );

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
    userId: mongooseTypes.ObjectId | string,
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser = await mongoDbConnection.models.UserModel.addSessions(
        id,
        sessions
      );

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
    userId: mongooseTypes.ObjectId | string,
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.SessionsModel.removeSessions(
          id,
          sessions
        );

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
    userId: mongooseTypes.ObjectId | string,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.UserModel.addMemberships(id, members);

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
    userId: mongooseTypes.ObjectId | string,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.MembershipModel.removeMemberships(
          id,
          members
        );

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
    userId: mongooseTypes.ObjectId | string,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.UserModel.addInvitedMembers(id, members);

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
    userId: mongooseTypes.ObjectId | string,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.InvitedMembersModel.removeInvitedMembers(
          id,
          members
        );

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
    userId: mongooseTypes.ObjectId | string,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.UserModel.addCreatedWorkspaces(
          id,
          workspaces
        );

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
    userId: mongooseTypes.ObjectId | string,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.CreatedWorkspacesModel.removeCreatedWorkspaces(
          id,
          workspaces
        );

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
    userId: mongooseTypes.ObjectId | string,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser = await mongoDbConnection.models.UserModel.addProjects(
        id,
        projects
      );

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
    userId: mongooseTypes.ObjectId | string,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.ProjectsModel.removeProjects(
          id,
          projects
        );

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
    userId: mongooseTypes.ObjectId | string,
    customerPayment: (databaseTypes.ICustomerPayment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.UserModel.addCustomerPayment(
          id,
          customerPayment
        );

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
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.CustomerPaymentModel.removeCustomerPayment(
          id,
          customerPayment
        );

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
          {id: userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addWebhooks(
    userId: mongooseTypes.ObjectId | string,
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser = await mongoDbConnection.models.UserModel.addWebhooks(
        id,
        webhooks
      );

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
    userId: mongooseTypes.ObjectId | string,
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const updatedUser =
        await mongoDbConnection.models.WebhooksModel.removeWebhooks(
          id,
          webhooks
        );

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
