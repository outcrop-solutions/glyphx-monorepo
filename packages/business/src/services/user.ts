import {EmailClient, updateHtml, updateText} from '@glyphx/email';
import {database as databaseTypes} from '@glyphx/types';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';

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
          {userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deactivate(
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

      // delete associated workspaces
      await mongoDbConnection.models.WorkspaceModel.updateWorkspaceByFilter(
        {creator: user._id},
        {
          deletedAt: new Date(),
        }
      );
      // delete associated memberships
      await mongoDbConnection.models.MemberModel.updateMemberWithFilter(
        {member: user._id},
        {
          deletedAt: new Date(),
        }
      );
      // delete associated projects
      await mongoDbConnection.models.ProjectModel.updateProjectWithFilter(
        {owner: user._id},
        {
          deletedAt: new Date(),
        }
      );

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

  public static async updateEmail(
    userId: mongooseTypes.ObjectId | string,
    email: string,
    previousEmail: string
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);

      const user = await mongoDbConnection.models.UserModel.updateUserById(id, {
        email,
        emailVerified: undefined,
      });

      await EmailClient.sendMail({
        html: updateHtml({email}),
        subject: '[Glyphx] Email address updated',
        text: updateText({email}),
        to: [email, previousEmail],
      });

      await mongoDbConnection.models.MemberModel.updateMemberWithFilter(
        {email: previousEmail},
        {email: email}
      );
      await mongoDbConnection.models.MemberModel.updateMemberWithFilter(
        {inviter: previousEmail},
        {inviter: email}
      );
      await mongoDbConnection.models.CustomerPaymentModel.updateCustomerPaymentWithFilter(
        {email: previousEmail},
        {email: email}
      );

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

  public static async updateName(
    userId: mongooseTypes.ObjectId | string,
    name: string
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const user = await mongoDbConnection.models.UserModel.updateUserById(id, {
        name,
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

  public static async updateUserCode(
    userId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const user = await mongoDbConnection.models.UserModel.updateUserById(id, {
        userCode: v4().replaceAll('-', ''),
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
