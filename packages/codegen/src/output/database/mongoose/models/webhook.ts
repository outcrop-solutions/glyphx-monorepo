// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {
  IWebhookDocument,
  IWebhookCreateInput,
  IWebhookStaticMethods,
  IWebhookMethods,
} from '../interfaces';
import {UserModel} from './user';

const SCHEMA = new Schema<
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
  deletedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'user',
  },
});

SCHEMA.static(
  'webhookIdExists',
  async (webhookId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await WEBHOOK_MODEL.findById(webhookId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the webhook.  See the inner error for additional information',
        'mongoDb',
        'webhookIdExists',
        {_id: webhookId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allWebhookIdsExist',
  async (webhookIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await WEBHOOK_MODEL.find({_id: {$in: webhookIds}}, [
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
          'allWebhookIdsExists',
          {webhookIds: webhookIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (
    webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a webhook with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (webhook.user)
      tasks.push(
        idValidator(
          webhook.user._id as mongooseTypes.ObjectId,
          'User',
          UserModel.userIdExists
        )
      );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

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

// CREATE
SCHEMA.static(
  'createWebhook',
  async (input: IWebhookCreateInput): Promise<databaseTypes.IWebhook> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [user] = await Promise.all([
        WEBHOOK_MODEL.validateUser(input.user),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IWebhookDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        name: input.name,
        url: input.url,
        user: user,
      };
      try {
        await WEBHOOK_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IWebhookDocument',
          resolvedInput,
          err
        );
      }
      const webhookDocument = (
        await WEBHOOK_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = webhookDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the webhook.  See the inner error for additional details',
          'mongoDb',
          'addWebhook',
          {},
          err
        );
      }
    }
    if (id) return await WEBHOOK_MODEL.getWebhookById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the webhook may not have been created.  I have no other information to provide.'
      );
  }
);

// READ
SCHEMA.static('getWebhookById', async (webhookId: mongooseTypes.ObjectId) => {
  try {
    const webhookDocument = (await WEBHOOK_MODEL.findById(webhookId)
      .populate('user')
      .lean()) as databaseTypes.IWebhook;
    if (!webhookDocument) {
      throw new error.DataNotFoundError(
        `Could not find a webhook with the _id: ${webhookId}`,
        'webhook_id',
        webhookId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (webhookDocument as any)['__v'];

    delete (webhookDocument as any).user?.['__v'];

    return webhookDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getWebhookById',
        err
      );
  }
});

SCHEMA.static(
  'queryWebhooks',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await WEBHOOK_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find webhooks with the filter: ${filter}`,
          'queryWebhooks',
          filter
        );
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

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      webhookDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        delete (doc as any).user?.['__v'];
      });

      const retval: IQueryResult<databaseTypes.IWebhook> = {
        results: webhookDocuments,
        numberOfItems: count,
        page: page,
        itemsPerPage: itemsPerPage,
      };

      return retval;
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while getting the webhooks.  See the inner error for additional information',
          'mongoDb',
          'queryWebhooks',
          err
        );
    }
  }
);

// UPDATE
SCHEMA.static(
  'updateWebhookWithFilter',
  async (
    filter: Record<string, unknown>,
    webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>
  ): Promise<void> => {
    try {
      await WEBHOOK_MODEL.validateUpdateObject(webhook);
      const updateDate = new Date();
      const transformedObject: Partial<IWebhookDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in webhook) {
        const value = (webhook as Record<string, any>)[key];
        if (key === 'user')
          transformedObject.user =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await WEBHOOK_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No webhook document with filter: ${filter} was found',
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
          `An unexpected error occurred while updating the project with filter :${filter}.  See the inner error for additional information`,
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
  async (
    webhookId: mongooseTypes.ObjectId,
    webhook: Omit<Partial<databaseTypes.IWebhook>, '_id'>
  ): Promise<databaseTypes.IWebhook> => {
    await WEBHOOK_MODEL.updateWebhookWithFilter({_id: webhookId}, webhook);
    return await WEBHOOK_MODEL.getWebhookById(webhookId);
  }
);

// DELETE
SCHEMA.static(
  'deleteWebhookById',
  async (webhookId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await WEBHOOK_MODEL.deleteOne({_id: webhookId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A webhook with a _id: ${webhookId} was not found in the database`,
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
  }
);

SCHEMA.static(
  'addUser',
  async (
    webhookId: mongooseTypes.ObjectId,
    user: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IWebhook> => {
    try {
      if (!user)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'user',
          user
        );
      const webhookDocument = await WEBHOOK_MODEL.findById(webhookId);

      if (!webhookDocument)
        throw new error.DataNotFoundError(
          'A webhookDocument with _id cannot be found',
          'webhook._id',
          webhookId
        );

      const reconciledId = await WEBHOOK_MODEL.validateUser(user);

      if (webhookDocument.user?.toString() !== reconciledId.toString()) {
        const reconciledId = await WEBHOOK_MODEL.validateUser(user);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        webhookDocument.user = reconciledId;
        await webhookDocument.save();
      }

      return await WEBHOOK_MODEL.getWebhookById(webhookId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the user. See the inner error for additional information',
          'mongoDb',
          'webhook.addUser',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeUser',
  async (
    webhookId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IWebhook> => {
    try {
      const webhookDocument = await WEBHOOK_MODEL.findById(webhookId);
      if (!webhookDocument)
        throw new error.DataNotFoundError(
          'A webhookDocument with _id cannot be found',
          'webhook._id',
          webhookId
        );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      webhookDocument.user = undefined;
      await webhookDocument.save();

      return await WEBHOOK_MODEL.getWebhookById(webhookId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing the user. See the inner error for additional information',
          'mongoDb',
          'webhook.removeUser',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateUser',
  async (
    input: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const userId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await UserModel.userIdExists(userId))) {
      throw new error.InvalidArgumentError(
        `The user: ${userId} does not exist`,
        'userId',
        userId
      );
    }
    return userId;
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['webhook'];

const WEBHOOK_MODEL = model<IWebhookDocument, IWebhookStaticMethods>(
  'webhook',
  SCHEMA
);

export {WEBHOOK_MODEL as WebhookModel};
