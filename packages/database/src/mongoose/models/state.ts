import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  IStateMethods,
  IStateStaticMethods,
  IStateDocument,
  IStateCreateInput,
} from '../interfaces';
import {error} from '@glyphx/core';
import {fileStatsSchema, filterSchema, propertySchema} from '../schemas';
import {ProjectModel} from './project';
import {UserModel} from './user';

const SCHEMA = new Schema<IStateDocument, IStateStaticMethods, IStateMethods>({
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
  version: {type: Number, required: true, default: 0, min: 0},
  camera: {type: Number, required: true, default: 0},
  static: {type: Boolean, required: true, default: false},
  fileSystemHash: {type: String, required: true},
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
  filters: {type: [filterSchema], required: true, default: []},
  properties: {type: [propertySchema], required: true, default: []},
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
  'createState',
  async (input: IStateCreateInput): Promise<databaseTypes.IState> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;
    try {
      const projectId =
        input.project instanceof mongooseTypes.ObjectId
          ? input.project
          : new mongooseTypes.ObjectId(input.project._id);

      const userId =
        input.createdBy instanceof mongooseTypes.ObjectId
          ? input.createdBy
          : new mongooseTypes.ObjectId(input.createdBy._id);

      const projectExists = await ProjectModel.projectIdExists(projectId);
      if (!projectExists) {
        throw new error.InvalidArgumentError(
          `The project with the id ${projectId} cannot be found`,
          'project._id',
          projectId
        );
      }

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
        createdAt: createDate,
        updatedAt: createDate,
        version: input.version,
        static: input.static,
        camera: input.camera,
        properties: input.properties ?? [],
        filters: input.filters ?? [],
        createdBy: userId,
        fileSystemHash: input.fileSystemHash,
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
        'The project._id is immutable and cannot be changed',
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
        //istanbul ignore else
        if (key === 'fileSystem' && state.fileSystem?.length)
          transformedObject.fileSystem = value;
        else if (key !== 'fileSystem') transformedObject[key] = value;
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
        .populate('project')
        .populate('createdBy')
        .lean()) as databaseTypes.IState[];
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      stateDocuments.forEach((doc: any) => {
        delete (doc as any)?.__v;
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

const STATE_MODEL = model<IStateDocument, IStateStaticMethods>('state', SCHEMA);

export {STATE_MODEL as StateModel};
