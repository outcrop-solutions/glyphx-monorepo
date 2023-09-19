// THIS CODE WAS AUTOMATICALLY GENERATED
import { databaseTypes } from '../../../../database';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class WebhookService {
  public static async getWebhook(
    webhookId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IWebhook | null> {
    try {
      const id =
        webhookId instanceof mongooseTypes.ObjectId
          ? webhookId
          : new mongooseTypes.ObjectId(webhookId);
      const webhook =
        await mongoDbConnection.models.WebhookModel.getWebhookById(id);
      return webhook;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the webhook. See the inner error for additional details',
          'webhook',
          'getWebhook',
          {id: webhookId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getWebhooks(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IWebhook[] | null> {
    try {
      const webhooks =
        await mongoDbConnection.models.WebhookModel.queryWebhooks(filter);
      return webhooks?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting webhooks. See the inner error for additional details',
          'webhooks',
          'getWebhooks',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createWebhook(
    data: Partial<databaseTypes.IWebhook>,
  ): Promise<databaseTypes.IWebhook> {
    try {
      // create webhook
      const webhook = await mongoDbConnection.models.WebhookModel.createWebhook(
        data
      );

      return webhook;
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
          'An unexpected error occurred while creating the webhook. See the inner error for additional details',
          'webhook',
          'createWebhook',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateWebhook(
    webhookId: mongooseTypes.ObjectId | string,
    data: Partial<Omit<
      databaseTypes.IWebhook,
      | '_id'
      | 'createdAt'
      | 'updatedAt'
    >>
  ): Promise<databaseTypes.IWebhook> {
    try {
      const id =
        webhookId instanceof mongooseTypes.ObjectId
          ? webhookId
          : new mongooseTypes.ObjectId(webhookId);
      const webhook =
        await mongoDbConnection.models.WebhookModel.updateWebhookById(id, {
          ...data
        });
      return webhook;
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
          'updateWebhook',
          { webhookId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteWebhook(
    webhookId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IWebhook> {
    try {
      const id =
        webhookId instanceof mongooseTypes.ObjectId
          ? webhookId
          : new mongooseTypes.ObjectId(webhookId);
      const webhook =
        await mongoDbConnection.models.WebhookModel.updateWebhookById(id, {
          deletedAt: new Date(),
        });
      return webhook;
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
          'updateWebhook',
          { webhookId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

public static async addUser(
    webhookId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWebhook> {
    try {
      const id =
        webhookId instanceof mongooseTypes.ObjectId
          ? webhookId
          : new mongooseTypes.ObjectId(webhookId);
      const updatedWebhook =
        await mongoDbConnection.models.WebhookModel.addUser(id, user);

      return updatedWebhook;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the webhook. See the inner error for additional details',
          'webhook',
          'addUser',
          {id: webhookId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeUser(
    webhookId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWebhook> {
    try {
      const id =
         webhookId instanceof mongooseTypes.ObjectId
          ?  webhookId
          : new mongooseTypes.ObjectId( webhookId);
      const updatedWebhook =
        await mongoDbConnection.models.UserModel.removeUser(id, user);

      return updatedWebhook;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the webhook. See the inner error for additional details',
          'webhook',
          'removeUser',
          {id:  webhookId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

}