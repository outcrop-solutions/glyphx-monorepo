import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  IStateMethods,
  IStateStaticMethods,
  IStateDocument,
  IStateCreateInput,
} from '../interfaces';
import {error} from '@glyphx/core';
import {fileStatsSchema} from '../schemas';
import {ProjectModel} from './project';

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
  'validateProjects',
  async (
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
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

SCHEMA.static(
  'createState',
  async (input: IStateCreateInput): Promise<databaseTypes.IState> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;
    try {
      const projects = await STATE_MODEL.validateProjects(input.projects);
      const createDate = new Date();

      const resolvedInput: IStateDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        version: input.version,
        static: input.static,
        fileSystemHash: input.fileSystemHash,
        projects: projects,
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
        .populate('projects')
        .lean()) as databaseTypes.IState[];
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      stateDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        (doc as any).projects.forEach((p: any) => delete (p as any)['__v']);
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

SCHEMA.static(
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
      const stateDocument = await STATE_MODEL.findById(stateId);
      if (!stateDocument)
        throw new error.DataNotFoundError(
          `A State Document with _id : ${stateId} cannot be found`,
          'state._id',
          stateId
        );

      const reconciledIds = await STATE_MODEL.validateProjects(projects);
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

      return await STATE_MODEL.getStateById(stateId);
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

SCHEMA.static(
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
      const stateDocument = await STATE_MODEL.findById(stateId);
      if (!stateDocument)
        throw new error.DataNotFoundError(
          `An State Document with _id : ${stateId} cannot be found`,
          'state._id',
          stateId
        );
      const reconciledIds = projects.map(i =>
        //istanbul ignore next
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

      return await STATE_MODEL.getStateById(stateId);
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
const STATE_MODEL = model<IStateDocument, IStateStaticMethods>('state', SCHEMA);

export {STATE_MODEL as StateModel};
