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
  createdAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  updatedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
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
  'allWebhookIdsExist',
  async (webhookIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    const retval = true;
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await WebhookModel.find({_id: {$in: webhookIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      webhookIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more webhookIds cannot be found in the database.',
          'webhook._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the webhookIds.  See the inner error for additional information',
          'mongoDb',
          'allwebhookIdsExists',
          {webhookIds: webhookIds},
          err
        );
      }
    }
    return true;
  }
);

schema.static(
  'getWebhookById',
  async (
    webhookId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IWebhook> => {
    try {
      const webhookDocument = (await WebhookModel.findById(webhookId)
        .populate('user')
        .lean()) as databaseTypes.IWebhook;
      if (!webhookDocument) {
        throw new error.DataNotFoundError(
          `Could not find a webhook with the _id: ${webhookId}`,
          'webhook._id',
          webhookId
        );
      }
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      delete (webhookDocument as any)['__v'];
      delete (webhookDocument as any).user['__v'];

      return webhookDocument;
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while getting the webhook.  See the inner error for additional information',
          'mongoDb',
          'getWebhookById',
          err
        );
    }
  }
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
        await WebhookModel.create([transformedDocument], {
          validateBeforeSave: false,
        })
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

schema.static(
  'validateUpdateObject',
  async (
    webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>
  ): Promise<void> => {
    if (webhook.user?._id)
      if (!(await UserModel.userIdExists(webhook.user?._id)))
        throw new error.InvalidOperationError(
          `A user with an id: ${webhook.user._id} cannot be found.  You cannot update a webhook with an invalid user id`,
          {id: webhook.user._id}
        );

    if (webhook.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: webhook.createdAt}
      );
    if (webhook.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: webhook.updatedAt}
      );
    if ((webhook as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The webhook._id is immutable and cannot be changed',
        {_id: (webhook as Record<string, unknown>)['_id']}
      );
  }
);

schema.static(
  'updateWebhookWithFilter',
  async (
    filter: Record<string, unknown>,
    webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>
  ): Promise<void> => {
    await WebhookModel.validateUpdateObject(webhook);
    try {
      const updateDate = new Date();
      const transformedWebhook: Partial<IWebhookDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in webhook) {
        const value = (webhook as Record<string, any>)[key];
        if (key === 'user')
          transformedWebhook.owner = value._id as mongooseTypes.ObjectId;
        else transformedWebhook[key] = value;
      }
      const updateResult = await WebhookModel.updateOne(
        filter,
        transformedWebhook
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No webhook document with filter: ${filter} was found`,
          'filter',
          filter
        );
      }
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      )
        throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the webhook with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update webhook',
          {filter: filter, webhook: webhook},
          err
        );
    }
  }
);

schema.static(
  'updateWebhookById',
  async (
    webhookId: mongooseTypes.ObjectId,
    webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>
  ): Promise<databaseTypes.IWebhook> => {
    await WebhookModel.updateWebhookWithFilter({_id: webhookId}, webhook);
    const retval = await WebhookModel.getWebhookById(webhookId);
    return retval;
  }
);

schema.static(
  'deleteWebhookById',
  async (webhookId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await WebhookModel.deleteOne({_id: webhookId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `An webhook with a _id: ${webhookId} was not found in the database`,
          '_id',
          webhookId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while deleteing the webhook from the database. The webhook may still exist.  See the inner error for additional information`,
          'mongoDb',
          'delete webhook',
          {_id: webhookId},
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
