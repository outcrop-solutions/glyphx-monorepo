import {sendMail, updateHtml, updateText} from '@glyphx/email';
import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';

//eslint-disable-next-line
const prisma: any = {};

export async function getUser(id) {
  return await prisma.user.findUnique({
    select: {
      email: true,
      name: true,
      userCode: true,
    },
    where: {id},
  });
}

export async function deactivate(id) {
  return await prisma.user.update({
    data: {deletedAt: new Date()},
    where: {id},
  });
}

export async function updateEmail(id, email, previousEmail) {
  await prisma.user.update({
    data: {
      email,
      emailVerified: null,
    },
    where: {id},
  });
  await sendMail({
    html: updateHtml({email}),
    subject: '[Glyphx] Email address updated',
    text: updateText({email}),
    to: [email, previousEmail],
  });
}

export async function updateName(id, name) {
  return await prisma.user.update({
    data: {name},
    where: {id},
  });
}

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
    } catch (err) {
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
  ): Promise<databaseTypes.IUser | null> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const user = await mongoDbConnection.models.UserModel.updateUserById(id, {
        deletedAt: new Date(),
      });
      return user;
    } catch (err) {
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

  public static async updateEmail(
    userId: mongooseTypes.ObjectId | string,
    email: string,
    previousEmail: string
  ): Promise<databaseTypes.IUser | null> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);

      // @jp: we need to standardized unsetting properties i.e emailVerified here (Date => null)
      const user = await mongoDbConnection.models.UserModel.updateUserById(id, {
        email,
        emailVerified: null,
      });

      await sendMail({
        html: updateHtml({email}),
        subject: '[Glyphx] Email address updated',
        text: updateText({email}),
        to: [email, previousEmail],
      });

      return user;
    } catch (err) {
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

  public static async updateName(
    userId: mongooseTypes.ObjectId | string,
    name: string
  ): Promise<databaseTypes.IUser | null> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const user = await mongoDbConnection.models.UserModel.updateUserById(id, {
        name,
      });
      return user;
    } catch (err) {
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
