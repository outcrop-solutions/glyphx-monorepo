import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {
  IStateMethods,
  IStateStaticMethods,
  IStateDocument,
  IStateCreateInput,
} from '../interfaces';
import {error} from '@glyphx/core';
import {
  aspectSchema,
  cameraSchema,
  fileStatsSchema,
  propertySchema,
} from '../schemas';
import {ProjectModel} from './project';
import {UserModel} from './user';
import {WorkspaceModel} from './workspace';

const SCHEMA = new Schema<IStateDocument, IStateStaticMethods, IStateMethods>({
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
  name: {type: String, required: true, default: 'Untitled'},
  version: {type: Number, required: true, default: 0, min: 0},
  imageHash: {type: String, required: false},
  camera: {type: cameraSchema, required: true},
  static: {type: Boolean, required: true, default: false},
  fileSystemHash: {type: String, required: true},
  payloadHash: {type: String, required: true},
  workspace: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'workspace',
  },
  project: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'project',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  properties: {type: Map, of: propertySchema},
  fileSystem: {type: [fileStatsSchema], required: true, default: []},
});

SCHEMA.static(
  'stateIdExists',
  async (stateId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await STATE_MODEL.findById(stateId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the state.  See the inner error for additional information',
        'mongoDb',
        'stateIdExists',
        {_id: stateId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allStateIdsExist',
  async (stateIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await STATE_MODEL.find({_id: {$in: stateIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      stateIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more stateIds cannot be found in the database.',
          'state._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the stateIds.  See the inner error for additional information',
          'mongoDb',
          'allStateIdsExists',
          {stateIds: stateIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'createState',
  async (input: IStateCreateInput): Promise<databaseTypes.IState> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;
    try {
      const workspaceId =
        input.workspace instanceof mongooseTypes.ObjectId
          ? input.workspace
          : new mongooseTypes.ObjectId(input.workspace._id);

      const workspaceExists = await WorkspaceModel.workspaceIdExists(
        workspaceId
      );
      if (!workspaceExists) {
        throw new error.InvalidArgumentError(
          `The workspace with the id ${workspaceId} cannot be found`,
          'workspace._id',
          workspaceId
        );
      }

      const projectId =
        input.project instanceof mongooseTypes.ObjectId
          ? input.project
          : new mongooseTypes.ObjectId(input.project._id);

      const projectExists = await ProjectModel.projectIdExists(projectId);
      if (!projectExists) {
        throw new error.InvalidArgumentError(
          `The project with the id ${projectId} cannot be found`,
          'project._id',
          projectId
        );
      }

      const userId =
        input.createdBy instanceof mongooseTypes.ObjectId
          ? input.createdBy
          : new mongooseTypes.ObjectId(input.createdBy._id);

      const creatorExists = await UserModel.userIdExists(userId);
      if (!creatorExists) {
        throw new error.InvalidArgumentError(
          `The user with the id ${userId} cannot be found`,
          'user._id',
          userId
        );
      }

      const createDate = new Date();

      const resolvedInput: IStateDocument = {
        name: input.name,
        createdAt: createDate,
        updatedAt: createDate,
        version: input.version,
        static: input.static,
        camera: input.camera,
        imageHash: input.imageHash,
        aspectRatio: input.aspectRatio,
        properties: input.properties ?? [],
        createdBy: userId,
        fileSystemHash: input.fileSystemHash,
        payloadHash: input.payloadHash,
        workspace: workspaceId,
        project: projectId,
        fileSystem: input.fileSystem,
      };
      try {
        await STATE_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IStateDocument',
          resolvedInput,
          err
        );
      }
      const stateDocument = (
        await STATE_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = stateDocument._id;
    } catch (err) {
      if (
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the state.  See the inner error for additional details',
          'mongoDb',
          'add state',
          {},
          err
        );
      }
    }
    //istanbul ignore else
    if (id) return await STATE_MODEL.getStateById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the state may not have been created.  I have no other information to provide.'
      );
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (state: Omit<Partial<databaseTypes.IState>, '_id'>): Promise<void> => {
    if (state.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: state.createdAt}
      );
    if (state.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: state.updatedAt}
      );
    if ((state as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The state._id is immutable and cannot be changed',
        {_id: (state as Record<string, unknown>)['_id']}
      );
  }
);

SCHEMA.static(
  'updateStateWithFilter',
  async (
    filter: Record<string, unknown>,
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<void> => {
    try {
      await STATE_MODEL.validateUpdateObject(state);
      const updateDate = new Date();
      const transformedObject: Partial<IStateDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in state) {
        const value = (state as Record<string, any>)[key];
        if (key === 'workspace')
          transformedObject.workspace =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        else if (key === 'project')
          transformedObject.type =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        else if (key === 'createdBy')
          transformedObject.type =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      transformedObject.updatedAt = updateDate;

      const updateResult = await STATE_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No state document with filter: ${filter} was found`,
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
          `An unexpected error occurred while updating the state with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update state',
          {filter: filter, state: state},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateStateById',
  async (
    stateId: mongooseTypes.ObjectId,
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<databaseTypes.IState> => {
    await STATE_MODEL.updateStateWithFilter({_id: stateId}, state);
    return await STATE_MODEL.getStateById(stateId);
  }
);

SCHEMA.static(
  'deleteStateById',
  async (stateId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await STATE_MODEL.deleteOne({_id: stateId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A state with a _id: ${stateId} was not found in the database`,
          '_id',
          stateId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the state from the database. The state may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete state',
          {_id: stateId},
          err
        );
    }
  }
);

SCHEMA.static('getStateById', async (stateId: mongooseTypes.ObjectId) => {
  try {
    const stateDocument = (await STATE_MODEL.findById(stateId)
      .populate('workspace')
      .populate('project')
      .populate('createdBy')
      .lean()) as databaseTypes.IState;
    if (!stateDocument) {
      throw new error.DataNotFoundError(
        `Could not find a state with the _id: ${stateId}`,
        'state_id',
        stateId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (stateDocument as any)['__v'];
    delete (stateDocument as any).workspace?.__v;
    delete (stateDocument as any).project?.__v;
    delete (stateDocument as any).createdBy?.__v;

    return stateDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the state.  See the inner error for additional information',
        'mongoDb',
        'getStateById',
        err
      );
  }
});

SCHEMA.static(
  'queryStates',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await STATE_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find states with the filter: ${filter}`,
          'queryStates',
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
      const stateDocuments = (await STATE_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('workspace')
        .populate('project')
        .populate('createdBy')
        .lean()) as databaseTypes.IState[];
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      stateDocuments.forEach((doc: any) => {
        delete (doc as any)?.__v;
        delete (doc as any)?.workspace?.__v;
        delete (doc as any)?.project?.__v;
        delete (doc as any)?.createdBy?.__v;
      });

      const retval: IQueryResult<databaseTypes.IState> = {
        results: stateDocuments,
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
          'An unexpected error occurred while getting the states.  See the inner error for additional information',
          'mongoDb',
          'queryStates',
          err
        );
    }
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['state'];

const STATE_MODEL = model<IStateDocument, IStateStaticMethods>('state', SCHEMA);

export {STATE_MODEL as StateModel};
