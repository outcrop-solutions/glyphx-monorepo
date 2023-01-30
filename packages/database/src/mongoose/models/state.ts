import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  IStateMethods,
  IStateStaticMethods,
  IStateDocument,
} from '../interfaces';
import {error} from '@glyphx/core';
import {fileStatsSchema} from '../schemas';
import {ProjectModel} from './project';

const schema = new Schema<IStateDocument, IStateStaticMethods, IStateMethods>({
  createdAt: {type: Date, required: true, default: () => new Date()},
  updatedAt: {type: Date, required: true, default: () => new Date()},
  version: {type: Number, required: true, default: 0, min: 0},
  static: {type: Boolean, required: true, default: false},
  fileSystemHash: {type: String, required: true},
  projects: {
    type: [mongooseTypes.ObjectId],
    required: true,
    default: [],
    ref: 'project',
  },
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
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    let retval: mongooseTypes.ObjectId[] = [];
    const projectIds: mongooseTypes.ObjectId[] = [];
    projects.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) projectIds.push(p);
      else projectIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await ProjectModel.allProjectIdsExist(projectIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exisit in the database.  See the inner error for additional information',
          'projects',
          projects,
          err
        );
      else throw err;
    }

    return projectIds;
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

schema.static(
  'deleteStateById',
  async (stateId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await StateModel.deleteOne({_id: stateId});
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
          `An unexpected error occurred while deleteing the state from the database. The state may still exist.  See the inner error for additional information`,
          'mongoDb',
          'delete state',
          {_id: stateId},
          err
        );
    }
  }
);

schema.static('getStateById', async (stateId: mongooseTypes.ObjectId) => {
  try {
    const stateDocument = (await StateModel.findById(stateId)
      .populate('projects')
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
    stateDocument.projects.forEach(p => delete (p as any)['__v']);

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

schema.static(
  'addProjects',
  async (
    stateId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one projectId',
          'projects',
          projects
        );
      const stateDocument = await StateModel.findById(stateId);
      if (!stateDocument)
        throw new error.DataNotFoundError(
          `A State Document with _id : ${stateId} cannot be found`,
          'state._id',
          stateId
        );

      const reconciledIds = await StateModel.validateProjects(projects);
      let dirty = false;
      reconciledIds.forEach(s => {
        if (
          !stateDocument.projects.find(
            progId => progId.toString() === s.toString()
          )
        ) {
          dirty = true;
          stateDocument.projects.push(s as unknown as databaseTypes.IProject);
        }
      });

      if (dirty) await stateDocument.save();

      return await StateModel.getStateById(stateId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while adding the projects. See the innner error for additional information',
          'mongoDb',
          'state.addProjects',
          err
        );
      }
    }
  }
);

schema.static(
  'removeProjects',
  async (
    stateId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one projectId',
          'projects',
          projects
        );
      const stateDocument = await StateModel.findById(stateId);
      if (!stateDocument)
        throw new error.DataNotFoundError(
          `An State Document with _id : ${stateId} cannot be found`,
          'state._id',
          stateId
        );

      const reconciledIds = projects.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedProjects = stateDocument.projects.filter(p => {
        let retval = true;
        if (
          reconciledIds.find(
            r =>
              r.toString() ===
              (p as unknown as mongooseTypes.ObjectId).toString()
          )
        ) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        stateDocument.projects =
          updatedProjects as unknown as databaseTypes.IProject[];
        await stateDocument.save();
      }

      return await StateModel.getStateById(stateId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while removing the projects. See the innner error for additional information',
          'mongoDb',
          'state.removeProjects',
          err
        );
      }
    }
  }
);
const StateModel = model<IStateDocument, IStateStaticMethods>('state', schema);

export {StateModel};
