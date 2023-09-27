import {databaseTypes, IQueryResult} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {
  IActivityLogMethods,
  IActivityLogStaticMethods,
  IActivityLogDocument,
  IActivityLogCreateInput,
} from '../interfaces';
import {error} from 'core';
import {UserModel} from './user';
import {userAgentSchema} from '../schemas';
import {ProjectModel} from './project';
import {StateModel} from './state';
import {CustomerPaymentModel} from './customerPayment';
import {MemberModel} from './member';
import {WebhookModel} from './webhook';
import {WorkspaceModel} from './workspace';
import {ProcessTrackingModel} from './processTracking';
import {DBFormatter} from '../../lib/format';

const SCHEMA = new Schema<IActivityLogDocument, IActivityLogStaticMethods, IActivityLogMethods>({
  createdAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  deletedAt: {type: Date, required: false},
  updatedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  actor: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  userAgent: userAgentSchema,
  workspaceId: {type: Schema.Types.ObjectId, required: false},
  projectId: {type: Schema.Types.ObjectId, required: false},
  action: {
    type: String,
    required: true,
    enum: databaseTypes.constants.ACTION_TYPE,
    default: databaseTypes.constants.ACTION_TYPE.CREATED,
  },
  onModel: {
    type: String,
    required: true,
    enum: databaseTypes.constants.RESOURCE_MODEL,
    default: databaseTypes.constants.RESOURCE_MODEL.USER,
  },
  resource: {type: Schema.Types.ObjectId, required: true, refPath: 'onModel'},
});

SCHEMA.static('activityLogIdExists', async (activityLogId: mongooseTypes.ObjectId): Promise<boolean> => {
  let retval = false;
  try {
    const result = await ACTIVITY_LOG_MODEL.findById(activityLogId, ['_id']);
    if (result) retval = true;
  } catch (err) {
    throw new error.DatabaseOperationError(
      'an unexpected error occurred while trying to find the activityLog.  See the inner error for additional information',
      'mongoDb',
      'activityLogIdExists',
      {_id: activityLogId},
      err
    );
  }
  return retval;
});

SCHEMA.static('allActivityLogIdsExist', async (activityLogIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await ACTIVITY_LOG_MODEL.find({_id: {$in: activityLogIds}}, ['_id'])) as {
      _id: mongooseTypes.ObjectId;
    }[];

    activityLogIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
    });

    if (notFoundIds.length) {
      throw new error.DataNotFoundError(
        'One or more activityLogIds cannot be found in the database.',
        'activityLog._id',
        notFoundIds
      );
    }
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the activityLogIds.  See the inner error for additional information',
        'mongoDb',
        'allActivityLogIdsExists',
        {activityLogIds: activityLogIds},
        err
      );
    }
  }
  return true;
});

SCHEMA.static('getActivityLogById', async (activityLogId: string) => {
  try {
    const activityLogDocument = (await ACTIVITY_LOG_MODEL.findById(activityLogId)
      .populate('actor')
      .populate('resource')
      .lean()) as databaseTypes.IActivityLog;
    if (!activityLogDocument) {
      throw new error.DataNotFoundError(
        `Could not find a activityLog with the _id: ${activityLogId}`,
        'activityLog_id',
        activityLogId
      );
    }
    const format = new DBFormatter();
    return format.toJS(activityLogDocument);
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the activityLog.  See the inner error for additional information',
        'mongoDb',
        'getActivityLogById',
        err
      );
  }
});

SCHEMA.static(
  'queryActivityLogs',
  //istanbul ignore next
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await ACTIVITY_LOG_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find activityLogs with the filter: ${filter}`,
          'queryActivityLogs',
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

      const activityLogDocuments = (await ACTIVITY_LOG_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('actor')
        .populate('resource')
        .lean()) as databaseTypes.IActivityLog[];

      const format = new DBFormatter();
      const formattedActivityLogs = activityLogDocuments?.map((doc: databaseTypes.IActivityLog) => {
        return format.toJS(doc);
      });

      const retval: IQueryResult<databaseTypes.IActivityLog> = {
        results: formattedActivityLogs as unknown as databaseTypes.IActivityLog[],
        numberOfItems: count,
        page: page,
        itemsPerPage: itemsPerPage,
      };

      return retval;
    } catch (err) {
      if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while querying the activityLogs.  See the inner error for additional information',
          'mongoDb',
          'queryProjectTemplates',
          err
        );
    }
  }
);

SCHEMA.static('createActivityLog', async (input: IActivityLogCreateInput): Promise<databaseTypes.IActivityLog> => {
  const userId =
    input.actor instanceof mongooseTypes.ObjectId
      ? input.actor
      : // @ts-ignore
        new mongooseTypes.ObjectId(input.actor._id);

  const userExists = await UserModel.userIdExists(userId);
  if (!userExists)
    throw new error.InvalidArgumentError(`A user with _id : ${userId} cannot be found`, 'user._id', userId);

  let workspaceId;
  //istanbul ignore else
  if (input.workspaceId) {
    workspaceId =
      input.workspaceId instanceof mongooseTypes.ObjectId
        ? input.workspaceId
        : // @ts-ignore
          new mongooseTypes.ObjectId(input.workspaceId);

    const workspaceExists = await WorkspaceModel.workspaceIdExists(workspaceId);
    if (!workspaceExists)
      throw new error.InvalidArgumentError(
        `A workspace with _id : ${workspaceId} cannot be found`,
        'workspace._id',
        input.workspaceId
      );
  }

  let resourceExists;
  const resourceId =
    input.resource instanceof mongooseTypes.ObjectId
      ? input.resource
      : // @ts-ignore
        new mongooseTypes.ObjectId(input.resource._id);

  switch (input.onModel) {
    case databaseTypes.constants.RESOURCE_MODEL.USER:
      resourceExists = await UserModel.userIdExists(resourceId);
      if (!resourceExists)
        throw new error.InvalidArgumentError(
          `A user resource with _id : ${userId} cannot be found`,
          'user._id',
          (input.resource as databaseTypes.IUser)._id
        );
      break;
    case databaseTypes.constants.RESOURCE_MODEL.PROJECT:
      resourceExists = await ProjectModel.projectIdExists(resourceId);
      if (!resourceExists)
        throw new error.InvalidArgumentError(
          `A project resource with _id : ${resourceId} cannot be found`,
          'project._id',
          (input.resource as databaseTypes.IProject)._id
        );
      break;
    case databaseTypes.constants.RESOURCE_MODEL.STATE:
      resourceExists = await StateModel.stateIdExists(resourceId);
      if (!resourceExists)
        throw new error.InvalidArgumentError(
          `A state resource with _id : ${resourceId} cannot be found`,
          'state._id',
          (input.resource as databaseTypes.IState)._id
        );
      break;
    case databaseTypes.constants.RESOURCE_MODEL.CUSTOMER_PAYMENT:
      resourceExists = await CustomerPaymentModel.customerPaymentIdExists(resourceId);
      if (!resourceExists)
        throw new error.InvalidArgumentError(
          `A customerPayment resource with _id : ${resourceId} cannot be found`,
          'customerPayment._id',
          (input.resource as databaseTypes.ICustomerPayment)._id
        );
      break;
    case databaseTypes.constants.RESOURCE_MODEL.MEMBER:
      resourceExists = await MemberModel.memberIdExists(resourceId);
      if (!resourceExists)
        throw new error.InvalidArgumentError(
          `A member resource with _id : ${resourceId} cannot be found`,
          'member._id',
          (input.resource as databaseTypes.IMember)._id
        );
      break;
    case databaseTypes.constants.RESOURCE_MODEL.PROCESS_TRACKING:
      resourceExists = await ProcessTrackingModel.processTrackingIdExists(resourceId);
      if (!resourceExists)
        throw new error.InvalidArgumentError(
          `A processTracking resource with _id : ${resourceId} cannot be found`,
          'processTracking._id',
          (input.resource as databaseTypes.IProcessTracking)._id
        );
      break;
    case databaseTypes.constants.RESOURCE_MODEL.WEBHOOK:
      resourceExists = await WebhookModel.webhookIdExists(resourceId);
      if (!resourceExists)
        throw new error.InvalidArgumentError(
          `A webhook resource with _id : ${resourceId} cannot be found`,
          'webhook._id',
          (input.resource as databaseTypes.IWebhook)._id
        );
      break;
    case databaseTypes.constants.RESOURCE_MODEL.WORKSPACE:
      resourceExists = await WorkspaceModel.workspaceIdExists(resourceId);
      if (!resourceExists)
        throw new error.InvalidArgumentError(
          `A workspace resource with _id : ${resourceId} cannot be found`,
          'workspace._id',
          (input.resource as databaseTypes.IWorkspace)._id
        );
      break;
  }

  const createDate = new Date();

  const transformedDocument: IActivityLogDocument = {
    createdAt: createDate,
    updatedAt: createDate,
    actor: userId,
    location: input.location,
    userAgent: {...input.userAgent},
    action: input.action,
    onModel: input.onModel,
    resource: resourceId,
    workspaceId: workspaceId,
    projectId: input?.projectId ?? undefined,
  };

  try {
    await ACTIVITY_LOG_MODEL.validate(transformedDocument);
  } catch (err) {
    throw new error.DataValidationError(
      'An error occurred while validating the activityLog document.  See the inner error for additional details.',
      'activityLog',
      transformedDocument,
      err
    );
  }

  try {
    const createdDocument = (
      await ACTIVITY_LOG_MODEL.create([transformedDocument], {
        validateBeforeSave: false,
      })
    )[0];
    return await ACTIVITY_LOG_MODEL.getActivityLogById(createdDocument._id.toString());
  } catch (err) {
    throw new error.DatabaseOperationError(
      'An unexpected error occurred wile creating the activityLog. See the inner error for additional information',
      'mongoDb',
      'create activityLog',
      input,
      err
    );
  }
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['activityLog'];

const ACTIVITY_LOG_MODEL = model<IActivityLogDocument, IActivityLogStaticMethods>('activityLog', SCHEMA);

export {ACTIVITY_LOG_MODEL as ActivityLogModel};
