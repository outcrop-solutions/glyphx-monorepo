import {IQueryResult, databaseTypes} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {IWebhookMethods, IWebhookStaticMethods, IWebhookDocument, IWebhookCreateInput} from '../interfaces';
import {error} from 'core';
import {UserModel} from './user';
import {DBFormatter} from '../../lib/format';

const SCHEMA = new Schema<IWebhookDocument, IWebhookStaticMethods, IWebhookMethods>({
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

SCHEMA.static('webhookIdExists', async (webhookId: mongooseTypes.ObjectId): Promise<boolean> => {
  let retval = false;
  try {
    const result = await WEBHOOK_MODEL.findById(webhookId, ['_id']);
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
});

SCHEMA.static('allWebhookIdsExist', async (webhookIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await WEBHOOK_MODEL.find({_id: {$in: webhookIds}}, ['_id'])) as {_id: mongooseTypes.ObjectId}[];

    webhookIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
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
});

SCHEMA.static('getWebhookById', async (webhookId: string): Promise<databaseTypes.IWebhook> => {
  try {
    const webhookDocument = (await WEBHOOK_MODEL.findById(webhookId).populate('user').lean()) as databaseTypes.IWebhook;
    if (!webhookDocument) {
      throw new error.DataNotFoundError(
        `Could not find a webhook with the _id: ${webhookId}`,
        'webhook._id',
        webhookId
      );
    }
    const format = new DBFormatter();
    return format.toJS(webhookDocument);
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
});

SCHEMA.static('queryWebhooks', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
  try {
    const count = await WEBHOOK_MODEL.count(filter);

    if (!count) {
      throw new error.DataNotFoundError(`Could not find webhooks with the filter: ${filter}`, 'queryWebhooks', filter);
    }

    const skip = itemsPerPage * page;
    if (skip > count) {
      throw new error.InvalidArgumentError(
        `The page number supplied: ${page} exceeds the number of pages contained in the reults defined by the filter: ${Math.floor(
          count / itemsPerPage
        )}`,
        'page',
        page
      );
    }
    const webhookDocuments = (await WEBHOOK_MODEL.find(filter, null, {
      skip: skip,
      limit: itemsPerPage,
    })

      .populate('user')
      .lean()) as databaseTypes.IWebhook[];
    const format = new DBFormatter();
    const webhooks = webhookDocuments.map((doc: any) => {
      return format.toJS(doc);
    });

    const retval: IQueryResult<databaseTypes.IWebhook> = {
      results: webhooks as unknown as databaseTypes.IWebhook[],
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while creating the webhooks.  See the inner error for additional information',
        'mongoDb',
        'getWebhooks',
        err
      );
  }
});

SCHEMA.static('createWebhook', async (input: IWebhookCreateInput): Promise<databaseTypes.IWebhook> => {
  const userId =
    typeof input.user === 'string' ? new mongooseTypes.ObjectId(input.user) : new mongooseTypes.ObjectId(input.user.id);
  const userExists = await UserModel.userIdExists(userId);
  if (!userExists)
    throw new error.InvalidArgumentError(`A user with _id : ${userId} cannot be found`, 'user._id', userId);
  const createDate = new Date();
  const transformedDocument: IWebhookDocument = {
    createdAt: createDate,
    updatedAt: createDate,
    name: input.name,
    url: input.url,
    user: userId,
  };

  try {
    await WEBHOOK_MODEL.validate(transformedDocument);
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
      await WEBHOOK_MODEL.create([transformedDocument], {
        validateBeforeSave: false,
      })
    )[0];
    return await WEBHOOK_MODEL.getWebhookById(createdDocument._id.toString());
  } catch (err) {
    throw new error.DatabaseOperationError(
      'An unexpected error occurred wile creating the Webhook. See the inner error for additional information',
      'mongoDb',
      'create webhook',
      input,
      err
    );
  }
});

SCHEMA.static('validateUpdateObject', async (webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>): Promise<void> => {
  if (webhook.user?._id)
    if (!(await UserModel.userIdExists(webhook.user?._id)))
      throw new error.InvalidOperationError(
        `A user with an id: ${webhook.user._id} cannot be found.  You cannot update a webhook with an invalid user id`,
        {id: webhook.user._id}
      );

  if (webhook.createdAt)
    throw new error.InvalidOperationError('The createdAt date is set internally and cannot be altered externally', {
      createdAt: webhook.createdAt,
    });
  if (webhook.updatedAt)
    throw new error.InvalidOperationError('The updatedAt date is set internally and cannot be altered externally', {
      updatedAt: webhook.updatedAt,
    });
  if ((webhook as Record<string, unknown>)['_id'])
    throw new error.InvalidOperationError('The webhook._id is immutable and cannot be changed', {
      _id: (webhook as Record<string, unknown>)['_id'],
    });
});

SCHEMA.static(
  'updateWebhookWithFilter',
  async (filter: Record<string, unknown>, webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>): Promise<void> => {
    await WEBHOOK_MODEL.validateUpdateObject(webhook);
    try {
      const updateDate = new Date();
      const transformedWebhook: Partial<IWebhookDocument> & Record<string, unknown> = {updatedAt: updateDate};
      for (const key in webhook) {
        const value = (webhook as Record<string, any>)[key];
        if (key === 'user')
          // @jp-burford .owner or .user?
          transformedWebhook.user = value._id as mongooseTypes.ObjectId;
        else transformedWebhook[key] = value;
      }
      const updateResult = await WEBHOOK_MODEL.updateOne(filter, transformedWebhook);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(`No webhook document with filter: ${filter} was found`, 'filter', filter);
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) throw err;
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

SCHEMA.static(
  'updateWebhookById',
  async (webhookId: string, webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>): Promise<databaseTypes.IWebhook> => {
    await WEBHOOK_MODEL.updateWebhookWithFilter({_id: webhookId}, webhook);
    const retval = await WEBHOOK_MODEL.getWebhookById(webhookId);
    return retval;
  }
);

SCHEMA.static('deleteWebhookById', async (webhookId: string): Promise<void> => {
  try {
    const results = await WEBHOOK_MODEL.deleteOne({_id: webhookId});
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
        'An unexpected error occurred while deleteing the webhook from the database. The webhook may still exist.  See the inner error for additional information',
        'mongoDb',
        'delete webhook',
        {_id: webhookId},
        err
      );
  }
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['webhook'];

const WEBHOOK_MODEL = model<IWebhookDocument, IWebhookStaticMethods>('webhook', SCHEMA);

export {WEBHOOK_MODEL as WebhookModel};
