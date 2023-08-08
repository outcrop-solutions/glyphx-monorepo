import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IActivityLogDocument, IActivityLogCreateInput, IActivityLogStaticMethods, IActivityLogMethods} from '../interfaces';
import { UserModel} from './user'
import { UserAgentModel} from './user_agent'

const SCHEMA = new Schema<IActivityLogDocument, IActivityLogStaticMethods, IActivityLogMethods>({
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
  actor: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'user'
  },
  workspaceId: {
    type: string | ObjectId,
    required: false,
      default: false
      },
  projectId: {
    type: string | ObjectId,
    required: false,
      default: false
      },
  location: {
    type: String,
    required: true,
      default: false
      },
  userAgent: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'useragent'
  },
  action: {
    type: String,
    required: false,
    enum: databaseTypes.constants.Action
  },
  onModel: {
    type: String,
    required: false,
    enum: databaseTypes.constants.OnModel
  },
  resource: {
    type: IUser | IState | IProject | ICustomerPayment | IMember | IWebhook | IWorkspace | IProcessTracking,
    required: true,
      default: false
      }
})

SCHEMA.static(
  'activityLogIdExists',
  async (activityLogId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await ACTIVITYLOG_MODEL.findById(activityLogId, ['_id']);
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
  }
);

SCHEMA.static(
  'allActivityLogIdsExist',
  async (activityLogIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await ACTIVITYLOG_MODEL.find({_id: {$in: activityLogIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      activityLogIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
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
          { activityLogIds: activityLogIds},
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
    activityLog: Omit<Partial<databaseTypes.IActivityLog>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a activityLog with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

        if (activityLog.actor)
          tasks.push(
            idValidator(
              activityLog.actor._id as mongooseTypes.ObjectId,
              'Actor',
              ActorModel.actorIdExists
            )
          );
        if (activityLog.userAgent)
          tasks.push(
            idValidator(
              activityLog.userAgent._id as mongooseTypes.ObjectId,
              'UserAgent',
              UserAgentModel.userAgentIdExists
            )
          );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (activityLog.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: activityLog.createdAt}
      );
    if (activityLog.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: activityLog.updatedAt}
      );
    if ((activityLog as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The activityLog._id is immutable and cannot be changed',
        {_id: (activityLog as Record<string, unknown>)['_id']}
      );
  }
);

SCHEMA.static(
  'createActivityLog',
  async (input: IActivityLogCreateInput): Promise<databaseTypes.IActivityLog> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [ 
        ] = await Promise.all([
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IActivityLogDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        actor: input.actor,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        location: input.location,
        userAgent: input.userAgent,
        action: input.action,
        onModel: input.onModel,
        resource: input.resource
      };
      try {
        await ACTIVITYLOG_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IActivityLogDocument',
          resolvedInput,
          err
        );
      }
      const activityLogDocument = (
        await ACTIVITYLOG_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = activityLogDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the activityLog.  See the inner error for additional details',
          'mongoDb',
          'addActivityLog',
          {},
          err
        );
      }
    }
    if (id) return await ACTIVITYLOG_MODEL.getActivityLogById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the activityLog may not have been created.  I have no other information to provide.'
      );
  }
);

SCHEMA.static('getActivityLogById', async (activityLogId: mongooseTypes.ObjectId) => {
  try {
    const activityLogDocument = (await ACTIVITYLOG_MODEL.findById(activityLogId)
      .populate('actor')
      .populate('userAgent')
      .populate('action')
      .populate('onModel')
      .lean()) as databaseTypes.IActivityLog;
    if (!activityLogDocument) {
      throw new error.DataNotFoundError(
        `Could not find a activityLog with the _id: ${ activityLogId}`,
        'activityLog_id',
        activityLogId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (activityLogDocument as any)['__v'];

    delete (activityLogDocument as any).actor?.['__v'];
    delete (activityLogDocument as any).userAgent?.['__v'];

    return activityLogDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getActivityLogById',
        err
      );
  }
});

SCHEMA.static(
  'updateActivityLogWithFilter',
  async (
    filter: Record<string, unknown>,
    activityLog: Omit<Partial<databaseTypes.IActivityLog>, '_id'>
  ): Promise<void> => {
    try {
      await ACTIVITYLOG_MODEL.validateUpdateObject(activityLog);
      const updateDate = new Date();
      const transformedObject: Partial<IActivityLogDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in activityLog) {
        const value = (activityLog as Record<string, any>)[key];
          if (key === 'actor')
            transformedObject.actor =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
          if (key === 'userAgent')
            transformedObject.userAgent =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await ACTIVITYLOG_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No activityLog document with filter: ${filter} was found',
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
          'update activityLog',
          {filter: filter, activityLog : activityLog },
          err
        );
    }
  }
);

SCHEMA.static(
  'queryActivityLogs',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await ACTIVITYLOG_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find activitylogs with the filter: ${filter}`,
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

      const activityLogDocuments = (await ACTIVITYLOG_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('actor')
        .populate('userAgent')
        .populate('action')
        .populate('onModel')
        .lean()) as databaseTypes.IActivityLog[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      activityLogDocuments.forEach((doc: any) => {
      delete (doc as any)['__v'];
      delete (doc as any).actor?.['__v'];
      delete (doc as any).userAgent?.['__v'];
      });

      const retval: IQueryResult<databaseTypes.IActivityLog> = {
        results: activityLogDocuments,
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
          'An unexpected error occurred while getting the activityLogs.  See the inner error for additional information',
          'mongoDb',
          'queryActivityLogs',
          err
        );
    }
  }
);

SCHEMA.static(
  'deleteActivityLogById',
  async (activityLogId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await ACTIVITYLOG_MODEL.deleteOne({_id: activityLogId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A activityLog with a _id: ${ activityLogId} was not found in the database`,
          '_id',
          activityLogId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the activityLog from the database. The activityLog may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete activityLog',
          {_id: activityLogId},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateActivityLogById',
  async (
    activityLogId: mongooseTypes.ObjectId,
    activityLog: Omit<Partial<databaseTypes.IActivityLog>, '_id'>
  ): Promise<databaseTypes.IActivityLog> => {
    await ACTIVITYLOG_MODEL.updateActivityLogWithFilter({_id: activityLogId}, activityLog);
    return await ACTIVITYLOG_MODEL.getActivityLogById(activityLogId);
  }
);






// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['activityLog'];

const ACTIVITYLOG_MODEL = model<IActivityLogDocument, IActivityLogStaticMethods>(
  'activityLog',
  SCHEMA
);

export { ACTIVITYLOG_MODEL as ActivityLogModel };
;
