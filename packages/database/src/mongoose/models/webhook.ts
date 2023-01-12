import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  IWebhookMethods,
  IWebhookStaticMethods,
  IWebhookDocument,
} from '../interfaces';
import {error} from '@glyphx/core';
import {UserModel} from './user';

const schema = new Schema<
  IWebhookDocument,
  IWebhookStaticMethods,
  IWebhookMethods
>({
  createdAt: {type: Date, required: true, default: () => new Date()},
  updatedAt: {type: Date, required: true, default: () => new Date()},
  name: {type: String, required: true},
  url: {type: String, required: true},
  user: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
});

schema.static(
  'webhookIdExists',
  async (webhookId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await WebhookModel.findById(webhookId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find webhook.  See the inner error for additional information',
        'mongoDb',
        'webhookIdExists',
        {_id: webhookId},
        err
      );
    }
    return retval;
  }
);

schema.static(
  'getWebhookById',
  async (webhookId: mongooseTypes.ObjectId) => {}
);

schema.static(
  'createWebhook',
  async (
    input: Omit<databaseTypes.IWebhook, '_id'>
  ): Promise<databaseTypes.IWebhook> => {
    const userExists = await UserModel.userIdExists(
      input.user._id as mongooseTypes.ObjectId
    );
    if (!userExists)
      throw new error.InvalidArgumentError(
        `A user with _id : ${input.user._id} cannot be found`,
        'user._id',
        input.user._id
      );
    const createDate = new Date();
    const transformedDocument: IWebhookDocument = {
      createdAt: createDate,
      updatedAt: createDate,
      name: input.name,
      url: input.url,
      user: input.user._id as mongooseTypes.ObjectId,
    };

    try {
      await WebhookModel.validate(transformedDocument);
    } catch (err) {
      throw new error.DataValidationError(
        'An error occurred while validating the webhook document.  See the inner error for additional details.',
        'webhook',
        transformedDocument,
        err
      );
    }

    try {
      const createdDocument = (
        await WebhookModel.create([
          transformedDocument,
          {validateBeforeSave: false},
        ])
      )[0];
      return await WebhookModel.getWebhookById(createdDocument._id);
    } catch (err) {
      throw new error.DatabaseOperationError(
        'An unexpected error occurred wile creating the Webhook. See the inner error for additional information',
        'mongoDb',
        'create webhook',
        input,
        err
      );
    }
  }
);
const WebhookModel = model<IWebhookDocument, IWebhookStaticMethods>(
  'webhook',
  schema
);

export {WebhookModel};
