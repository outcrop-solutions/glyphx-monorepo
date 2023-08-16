// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {
  IStateDocument,
  IStateCreateInput,
  IStateStaticMethods,
  IStateMethods,
} from '../interfaces';
import {UserModel} from './user';
// eslint-disable-next-line import/no-duplicates
import {cameraSchema} from '../schemas';
// eslint-disable-next-line import/no-duplicates
import {aspectRatioSchema} from '../schemas';
import {ProjectModel} from './project';
import {WorkspaceModel} from './workspace';

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
  deletedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'user',
  },
  name: {
    type: String,
    required: true,
  },
  version: {
    type: Number,
    required: true,
  },
  static: {
    type: Boolean,
    required: true,
  },
  imageHash: {
    type: String,
    required: false,
  },
  camera: {
    type: cameraSchema,
    required: false,
    default: {},
  },
  aspectRatio: {
    type: aspectRatioSchema,
    required: false,
    default: {},
  },
  properties: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
  fileSystemHash: {
    type: String,
    required: true,
  },
  payloadHash: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  project: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'project',
  },
  workspace: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'workspace',
  },
  fileSystem: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
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
  'validateUpdateObject',
  async (state: Omit<Partial<databaseTypes.IState>, '_id'>): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a state with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (state.createdBy)
      tasks.push(
        idValidator(
          state.createdBy._id as mongooseTypes.ObjectId,
          'User',
          UserModel.userIdExists
        )
      );
    if (state.project)
      tasks.push(
        idValidator(
          state.project._id as mongooseTypes.ObjectId,
          'Project',
          ProjectModel.projectIdExists
        )
      );
    if (state.workspace)
      tasks.push(
        idValidator(
          state.workspace._id as mongooseTypes.ObjectId,
          'Workspace',
          WorkspaceModel.workspaceIdExists
        )
      );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

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

// CREATE
SCHEMA.static(
  'createState',
  async (input: IStateCreateInput): Promise<databaseTypes.IState> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [createdBy, project, workspace] = await Promise.all([
        STATE_MODEL.validateCreatedBy(input.createdBy),
        STATE_MODEL.validateProject(input.project),
        STATE_MODEL.validateWorkspace(input.workspace),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IStateDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        createdBy: createdBy,
        name: input.name,
        version: input.version,
        static: input.static,
        imageHash: input.imageHash,
        camera: input.camera,
        aspectRatio: input.aspectRatio,
        properties: input.properties,
        fileSystemHash: input.fileSystemHash,
        payloadHash: input.payloadHash,
        description: input.description,
        project: project,
        workspace: workspace,
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
          'addState',
          {},
          err
        );
      }
    }
    if (id) return await STATE_MODEL.getStateById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the state may not have been created.  I have no other information to provide.'
      );
  }
);

// READ
SCHEMA.static('getStateById', async (stateId: mongooseTypes.ObjectId) => {
  try {
    const stateDocument = (await STATE_MODEL.findById(stateId)
      .populate('createdBy')
      .populate('camera')
      .populate('aspectRatio')
      .populate('properties')
      .populate('project')
      .populate('workspace')
      .populate('fileSystem')
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

    delete (stateDocument as any).createdBy?.['__v'];
    delete (stateDocument as any).project?.['__v'];
    delete (stateDocument as any).workspace?.['__v'];

    return stateDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
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
        .populate('createdBy')
        .populate('camera')
        .populate('aspectRatio')
        .populate('properties')
        .populate('project')
        .populate('workspace')
        .populate('fileSystem')
        .lean()) as databaseTypes.IState[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      stateDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        delete (doc as any).createdBy?.['__v'];
        delete (doc as any).project?.['__v'];
        delete (doc as any).workspace?.['__v'];
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

// UPDATE
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
        if (key === 'createdBy')
          transformedObject.createdBy =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        if (key === 'project')
          transformedObject.project =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        if (key === 'workspace')
          transformedObject.workspace =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await STATE_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No state document with filter: ${filter} was found',
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

// DELETE
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

SCHEMA.static(
  'addCreatedBy',
  async (
    stateId: mongooseTypes.ObjectId,
    createdBy: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IState> => {
    try {
      if (!createdBy)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'createdBy',
          createdBy
        );
      const stateDocument = await STATE_MODEL.findById(stateId);

      if (!stateDocument)
        throw new error.DataNotFoundError(
          'A stateDocument with _id cannot be found',
          'state._id',
          stateId
        );

      const reconciledId = await STATE_MODEL.validateCreatedBy(createdBy);

      if (stateDocument.createdBy?.toString() !== reconciledId.toString()) {
        const reconciledId = await STATE_MODEL.validateCreatedBy(createdBy);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        stateDocument.createdBy = reconciledId;
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
          'An unexpected error occurred while adding the createdBy. See the inner error for additional information',
          'mongoDb',
          'state.addCreatedBy',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeCreatedBy',
  async (stateId: mongooseTypes.ObjectId): Promise<databaseTypes.IState> => {
    try {
      const stateDocument = await STATE_MODEL.findById(stateId);
      if (!stateDocument)
        throw new error.DataNotFoundError(
          'A stateDocument with _id cannot be found',
          'state._id',
          stateId
        );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      stateDocument.createdBy = undefined;
      await stateDocument.save();

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
          'An unexpected error occurred while removing the createdBy. See the inner error for additional information',
          'mongoDb',
          'state.removeCreatedBy',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateCreatedBy',
  async (
    input: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const createdById =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await UserModel.userIdExists(createdById))) {
      throw new error.InvalidArgumentError(
        `The createdBy: ${createdById} does not exist`,
        'createdById',
        createdById
      );
    }
    return createdById;
  }
);

SCHEMA.static(
  'addProject',
  async (
    stateId: mongooseTypes.ObjectId,
    project: databaseTypes.IProject | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IState> => {
    try {
      if (!project)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'project',
          project
        );
      const stateDocument = await STATE_MODEL.findById(stateId);

      if (!stateDocument)
        throw new error.DataNotFoundError(
          'A stateDocument with _id cannot be found',
          'state._id',
          stateId
        );

      const reconciledId = await STATE_MODEL.validateProject(project);

      if (stateDocument.project?.toString() !== reconciledId.toString()) {
        const reconciledId = await STATE_MODEL.validateProject(project);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        stateDocument.project = reconciledId;
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
          'An unexpected error occurred while adding the project. See the inner error for additional information',
          'mongoDb',
          'state.addProject',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeProject',
  async (stateId: mongooseTypes.ObjectId): Promise<databaseTypes.IState> => {
    try {
      const stateDocument = await STATE_MODEL.findById(stateId);
      if (!stateDocument)
        throw new error.DataNotFoundError(
          'A stateDocument with _id cannot be found',
          'state._id',
          stateId
        );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      stateDocument.project = undefined;
      await stateDocument.save();

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
          'An unexpected error occurred while removing the project. See the inner error for additional information',
          'mongoDb',
          'state.removeProject',
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
  'addWorkspace',
  async (
    stateId: mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IState> => {
    try {
      if (!workspace)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'workspace',
          workspace
        );
      const stateDocument = await STATE_MODEL.findById(stateId);

      if (!stateDocument)
        throw new error.DataNotFoundError(
          'A stateDocument with _id cannot be found',
          'state._id',
          stateId
        );

      const reconciledId = await STATE_MODEL.validateWorkspace(workspace);

      if (stateDocument.workspace?.toString() !== reconciledId.toString()) {
        const reconciledId = await STATE_MODEL.validateWorkspace(workspace);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        stateDocument.workspace = reconciledId;
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
          'An unexpected error occurred while adding the workspace. See the inner error for additional information',
          'mongoDb',
          'state.addWorkspace',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeWorkspace',
  async (stateId: mongooseTypes.ObjectId): Promise<databaseTypes.IState> => {
    try {
      const stateDocument = await STATE_MODEL.findById(stateId);
      if (!stateDocument)
        throw new error.DataNotFoundError(
          'A stateDocument with _id cannot be found',
          'state._id',
          stateId
        );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      stateDocument.workspace = undefined;
      await stateDocument.save();

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
          'An unexpected error occurred while removing the workspace. See the inner error for additional information',
          'mongoDb',
          'state.removeWorkspace',
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

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['state'];

const STATE_MODEL = model<IStateDocument, IStateStaticMethods>('state', SCHEMA);

export {STATE_MODEL as StateModel};