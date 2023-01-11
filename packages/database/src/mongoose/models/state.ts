import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  IStateMethods,
  IStateStaticMethods,
  IStateDocument,
} from '../interfaces';
import {error} from '@glyphx/core';
import {fileStatsSchema} from '../schemas';

const schema = new Schema<IStateDocument, IStateStaticMethods, IStateMethods>({
  createdAt: {type: Date, required: true, default: () => new Date()},
  updatedAt: {type: Date, required: true, default: () => new Date()},
  version: {type: Number, required: true, default: 0, min: 0},
  static: {type: Boolean, required: true, default: false},
  fileSystemHash: {type: String, required: true},
  projects: {type: [mongooseTypes.ObjectId], required: true, default: []},
  fileSystem: {type: [fileStatsSchema], required: true, default: []},
});

schema.static(
  'stateIdExists',
  async (stateId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await StateModel.findById(stateId, ['_id']);
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

schema.static(
  'validateProjects',
  async (
    projects: databaseTypes.IProject[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    let retval: mongooseTypes.ObjectId[] = [];
    //TODO: blow this out once we have a projects model.
    return retval;
  }
);

schema.static(
  'createState',
  async (
    input: Omit<databaseTypes.IState, '_id'>
  ): Promise<databaseTypes.IState> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;
    try {
      const projects = await StateModel.validateProjects(input.projects);
      const createDate = new Date();

      let resolvedInput: IStateDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        version: input.version,
        static: input.static,
        fileSystemHash: input.fileSystemHash,
        projects: projects,
        fileSystem: input.fileSystem,
      };
      try {
        await StateModel.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IStateDocument',
          resolvedInput,
          err
        );
      }
      const stateDocument = (
        await StateModel.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = stateDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
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
    if (id) return await StateModel.getStateById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the state may not have been created.  I have no other information to provide.'
      );
  }
);

schema.static(
  'validateUpdateObject',
  async (state: Omit<Partial<databaseTypes.IState>, '_id'>): Promise<void> => {
    if (state.projects?.length) {
      throw new error.InvalidOperationError(
        'The projects cannot be updated directly, please use the add/remove project methods',
        {projects: state.projects}
      );
    }
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

schema.static(
  'updateStateWithFilter',
  async (
    filter: Record<string, unknown>,
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<void> => {
    try {
      await StateModel.validateUpdateObject(state);
      const updateDate = new Date();
      const transformedObject: Partial<IStateDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in state) {
        const value = (state as Record<string, any>)[key];
        if (key === 'fileSystem' && state.fileSystem?.length)
          transformedObject.fileSystem = value;
        else if (key !== 'fileSystem') transformedObject[key] = value;
      }
      transformedObject.updatedAt = updateDate;

      const updateResult = await StateModel.updateOne(
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

schema.static(
  'updateStateById',
  async (
    stateId: mongooseTypes.ObjectId,
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<databaseTypes.IState> => {
    await StateModel.updateStateWithFilter({_id: stateId}, state);
    return await StateModel.getStateById(stateId);
  }
);

schema.static('getStateById', async (stateId: mongooseTypes.ObjectId) => {});

const StateModel = model<IStateDocument, IStateStaticMethods>('state', schema);

export {StateModel};
