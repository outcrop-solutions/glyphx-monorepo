// THIS CODE WAS AUTOMATICALLY GENERATED
import {IQueryResult, databaseTypes} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from 'core';
import {
  IActivityLogDocument,
  IActivityLogCreateInput,
  IActivityLogStaticMethods,
  IActivityLogMethods,
} from '../interfaces';
import {UserModel} from './user';
import {WorkspaceModel} from './workspace';
import {ProjectModel} from './project';
import {UserAgentModel} from './userAgent';

const SCHEMA = new Schema<
  IActivityLogDocument,
  IActivityLogStaticMethods,
  IActivityLogMethods
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
  actor: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'user',
  },
  workspace: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'workspace',
  },
  project: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'project',
  },
  location: {
    type: String,
    required: true,
  },
  userAgent: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'useragent',
  },
  action: {
    type: String,
    required: false,
    enum: databaseTypes.ACTION_TYPE,
  },
  onModel: {
    type: String,
    required: false,
    enum: databaseTypes.RESOURCE_MODEL,
  },
});

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
      const foundIds = (await ACTIVITYLOG_MODEL.find(
        {_id: {$in: activityLogIds}},
        ['_id']
      )) as {_id: mongooseTypes.ObjectId}[];

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
          {activityLogIds: activityLogIds},
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
          'User',
          UserModel.userIdExists
        )
      );
    if (activityLog.workspace)
      tasks.push(
        idValidator(
          activityLog.workspace._id as mongooseTypes.ObjectId,
          'Workspace',
          WorkspaceModel.workspaceIdExists
        )
      );
    if (activityLog.project)
      tasks.push(
        idValidator(
          activityLog.project._id as mongooseTypes.ObjectId,
          'Project',
          ProjectModel.projectIdExists
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

// CREATE
SCHEMA.static(
  'createActivityLog',
  async (
    input: IActivityLogCreateInput
  ): Promise<databaseTypes.IActivityLog> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [actor, workspace, project, userAgent] = await Promise.all([
        ACTIVITYLOG_MODEL.validateActor(input.actor),
        ACTIVITYLOG_MODEL.validateWorkspace(input.workspace),
        ACTIVITYLOG_MODEL.validateProject(input.project),
        ACTIVITYLOG_MODEL.validateUserAgent(input.userAgent),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IActivityLogDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        actor: actor,
        workspace: workspace,
        project: project,
        location: input.location,
        userAgent: userAgent,
        action: input.action,
        onModel: input.onModel,
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
        await ACTIVITYLOG_MODEL.create([resolvedInput], {
          validateBeforeSave: false,
        })
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

// READ
SCHEMA.static(
  'getActivityLogById',
  async (activityLogId: mongooseTypes.ObjectId) => {
    try {
      const activityLogDocument = (await ACTIVITYLOG_MODEL.findById(
        activityLogId
      )
        .populate('actor')
        .populate('workspace')
        .populate('project')
        .populate('userAgent')
        .populate('action')
        .populate('onModel')
        .lean()) as databaseTypes.IActivityLog;
      if (!activityLogDocument) {
        throw new error.DataNotFoundError(
          `Could not find a activityLog with the _id: ${activityLogId}`,
          'activityLog_id',
          activityLogId
        );
      }
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      delete (activityLogDocument as any)['__v'];

      delete (activityLogDocument as any).actor?.['__v'];
      delete (activityLogDocument as any).workspace?.['__v'];
      delete (activityLogDocument as any).project?.['__v'];
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
        .populate('workspace')
        .populate('project')
        .populate('userAgent')
        .populate('action')
        .populate('onModel')
        .lean()) as databaseTypes.IActivityLog[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      activityLogDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        delete (doc as any).actor?.['__v'];
        delete (doc as any).workspace?.['__v'];
        delete (doc as any).project?.['__v'];
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

// UPDATE
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
        if (key === 'workspace')
          transformedObject.workspace =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        if (key === 'project')
          transformedObject.project =
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
          {filter: filter, activityLog: activityLog},
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
    await ACTIVITYLOG_MODEL.updateActivityLogWithFilter(
      {_id: activityLogId},
      activityLog
    );
    return await ACTIVITYLOG_MODEL.getActivityLogById(activityLogId);
  }
);

// DELETE
SCHEMA.static(
  'deleteActivityLogById',
  async (activityLogId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await ACTIVITYLOG_MODEL.deleteOne({_id: activityLogId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A activityLog with a _id: ${activityLogId} was not found in the database`,
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
  'addActor',
  async (
    activityLogId: mongooseTypes.ObjectId,
    actor: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog> => {
    try {
      if (!actor)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'actor',
          actor
        );
      const activityLogDocument =
        await ACTIVITYLOG_MODEL.findById(activityLogId);

      if (!activityLogDocument)
        throw new error.DataNotFoundError(
          'A activityLogDocument with _id cannot be found',
          'activityLog._id',
          activityLogId
        );

      const reconciledId = await ACTIVITYLOG_MODEL.validateActor(actor);

      if (activityLogDocument.actor?.toString() !== reconciledId.toString()) {
        const reconciledId = await ACTIVITYLOG_MODEL.validateActor(actor);

        // @ts-ignore
        activityLogDocument.actor = reconciledId;
        await activityLogDocument.save();
      }

      return await ACTIVITYLOG_MODEL.getActivityLogById(activityLogId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the actor. See the inner error for additional information',
          'mongoDb',
          'activityLog.addActor',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeActor',
  async (
    activityLogId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog> => {
    try {
      const activityLogDocument =
        await ACTIVITYLOG_MODEL.findById(activityLogId);
      if (!activityLogDocument)
        throw new error.DataNotFoundError(
          'A activityLogDocument with _id cannot be found',
          'activityLog._id',
          activityLogId
        );

      // @ts-ignore
      activityLogDocument.actor = undefined;
      await activityLogDocument.save();

      return await ACTIVITYLOG_MODEL.getActivityLogById(activityLogId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing the actor. See the inner error for additional information',
          'mongoDb',
          'activityLog.removeActor',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateActor',
  async (
    input: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const actorId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await UserModel.userIdExists(actorId))) {
      throw new error.InvalidArgumentError(
        `The actor: ${actorId} does not exist`,
        'actorId',
        actorId
      );
    }
    return actorId;
  }
);

SCHEMA.static(
  'addWorkspace',
  async (
    activityLogId: mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog> => {
    try {
      if (!workspace)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'workspace',
          workspace
        );
      const activityLogDocument =
        await ACTIVITYLOG_MODEL.findById(activityLogId);

      if (!activityLogDocument)
        throw new error.DataNotFoundError(
          'A activityLogDocument with _id cannot be found',
          'activityLog._id',
          activityLogId
        );

      const reconciledId = await ACTIVITYLOG_MODEL.validateWorkspace(workspace);

      if (
        activityLogDocument.workspace?.toString() !== reconciledId.toString()
      ) {
        const reconciledId =
          await ACTIVITYLOG_MODEL.validateWorkspace(workspace);

        // @ts-ignore
        activityLogDocument.workspace = reconciledId;
        await activityLogDocument.save();
      }

      return await ACTIVITYLOG_MODEL.getActivityLogById(activityLogId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the workspace. See the inner error for additional information',
          'mongoDb',
          'activityLog.addWorkspace',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeWorkspace',
  async (
    activityLogId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog> => {
    try {
      const activityLogDocument =
        await ACTIVITYLOG_MODEL.findById(activityLogId);
      if (!activityLogDocument)
        throw new error.DataNotFoundError(
          'A activityLogDocument with _id cannot be found',
          'activityLog._id',
          activityLogId
        );

      // @ts-ignore
      activityLogDocument.workspace = undefined;
      await activityLogDocument.save();

      return await ACTIVITYLOG_MODEL.getActivityLogById(activityLogId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing the workspace. See the inner error for additional information',
          'mongoDb',
          'activityLog.removeWorkspace',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateWorkspace',
  async (
    input: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const workspaceId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await WorkspaceModel.workspaceIdExists(workspaceId))) {
      throw new error.InvalidArgumentError(
        `The workspace: ${workspaceId} does not exist`,
        'workspaceId',
        workspaceId
      );
    }
    return workspaceId;
  }
);

SCHEMA.static(
  'addProject',
  async (
    activityLogId: mongooseTypes.ObjectId,
    project: databaseTypes.IProject | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog> => {
    try {
      if (!project)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'project',
          project
        );
      const activityLogDocument =
        await ACTIVITYLOG_MODEL.findById(activityLogId);

      if (!activityLogDocument)
        throw new error.DataNotFoundError(
          'A activityLogDocument with _id cannot be found',
          'activityLog._id',
          activityLogId
        );

      const reconciledId = await ACTIVITYLOG_MODEL.validateProject(project);

      if (activityLogDocument.project?.toString() !== reconciledId.toString()) {
        const reconciledId = await ACTIVITYLOG_MODEL.validateProject(project);

        // @ts-ignore
        activityLogDocument.project = reconciledId;
        await activityLogDocument.save();
      }

      return await ACTIVITYLOG_MODEL.getActivityLogById(activityLogId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the project. See the inner error for additional information',
          'mongoDb',
          'activityLog.addProject',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeProject',
  async (
    activityLogId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog> => {
    try {
      const activityLogDocument =
        await ACTIVITYLOG_MODEL.findById(activityLogId);
      if (!activityLogDocument)
        throw new error.DataNotFoundError(
          'A activityLogDocument with _id cannot be found',
          'activityLog._id',
          activityLogId
        );

      // @ts-ignore
      activityLogDocument.project = undefined;
      await activityLogDocument.save();

      return await ACTIVITYLOG_MODEL.getActivityLogById(activityLogId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing the project. See the inner error for additional information',
          'mongoDb',
          'activityLog.removeProject',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateProject',
  async (
    input: databaseTypes.IProject | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const projectId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await ProjectModel.projectIdExists(projectId))) {
      throw new error.InvalidArgumentError(
        `The project: ${projectId} does not exist`,
        'projectId',
        projectId
      );
    }
    return projectId;
  }
);

SCHEMA.static(
  'addUserAgent',
  async (
    activityLogId: mongooseTypes.ObjectId,
    userAgent: databaseTypes.IUserAgent | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog> => {
    try {
      if (!userAgent)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'userAgent',
          userAgent
        );
      const activityLogDocument =
        await ACTIVITYLOG_MODEL.findById(activityLogId);

      if (!activityLogDocument)
        throw new error.DataNotFoundError(
          'A activityLogDocument with _id cannot be found',
          'activityLog._id',
          activityLogId
        );

      const reconciledId = await ACTIVITYLOG_MODEL.validateUserAgent(userAgent);

      if (
        activityLogDocument.userAgent?.toString() !== reconciledId.toString()
      ) {
        const reconciledId =
          await ACTIVITYLOG_MODEL.validateUserAgent(userAgent);

        // @ts-ignore
        activityLogDocument.userAgent = reconciledId;
        await activityLogDocument.save();
      }

      return await ACTIVITYLOG_MODEL.getActivityLogById(activityLogId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the userAgent. See the inner error for additional information',
          'mongoDb',
          'activityLog.addUserAgent',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeUserAgent',
  async (
    activityLogId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IActivityLog> => {
    try {
      const activityLogDocument =
        await ACTIVITYLOG_MODEL.findById(activityLogId);
      if (!activityLogDocument)
        throw new error.DataNotFoundError(
          'A activityLogDocument with _id cannot be found',
          'activityLog._id',
          activityLogId
        );

      // @ts-ignore
      activityLogDocument.userAgent = undefined;
      await activityLogDocument.save();

      return await ACTIVITYLOG_MODEL.getActivityLogById(activityLogId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing the userAgent. See the inner error for additional information',
          'mongoDb',
          'activityLog.removeUserAgent',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateUserAgent',
  async (
    input: databaseTypes.IUserAgent | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const userAgentId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await UserAgentModel.userAgentIdExists(userAgentId))) {
      throw new error.InvalidArgumentError(
        `The userAgent: ${userAgentId} does not exist`,
        'userAgentId',
        userAgentId
      );
    }
    return userAgentId;
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['activityLog'];

const ACTIVITYLOG_MODEL = model<
  IActivityLogDocument,
  IActivityLogStaticMethods
>('activityLog', SCHEMA);

export {ACTIVITYLOG_MODEL as ActivityLogModel};
