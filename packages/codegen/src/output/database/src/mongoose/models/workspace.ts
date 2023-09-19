// THIS CODE WAS AUTOMATICALLY GENERATED
import {IQueryResult, databaseTypes} from 'types'
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from 'core';
import {IWorkspaceDocument, IWorkspaceCreateInput, IWorkspaceStaticMethods, IWorkspaceMethods} from '../interfaces';
import { UserModel} from './user'

const SCHEMA = new Schema<IWorkspaceDocument, IWorkspaceStaticMethods, IWorkspaceMethods>({
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
  workspaceCode: {
    type: String,
    required: true,
      },
  inviteCode: {
    type: String,
    required: true,
      },
  name: {
    type: String,
    required: true,
      },
  slug: {
    type: String,
    required: true,
      },
  tags: {
    type: ITag[],
    required: true,
      },
  description: {
    type: String,
    required: false,
      },
  creator: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'user'
  },
  members: {
    type: IMember[],
    required: true,
      },
  projects: {
    type: IProject[],
    required: true,
      },
  states: {
    type: IState[],
    required: true,
      }
})

SCHEMA.static(
  'workspaceIdExists',
  async (workspaceId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await WORKSPACE_MODEL.findById(workspaceId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the workspace.  See the inner error for additional information',
        'mongoDb',
        'workspaceIdExists',
        {_id: workspaceId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allWorkspaceIdsExist',
  async (workspaceIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await WORKSPACE_MODEL.find({_id: {$in: workspaceIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      workspaceIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more workspaceIds cannot be found in the database.',
          'workspace._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the workspaceIds.  See the inner error for additional information',
          'mongoDb',
          'allWorkspaceIdsExists',
          { workspaceIds: workspaceIds},
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
    workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a workspace with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

        if (workspace.creator)
          tasks.push(
            idValidator(
              workspace.creator._id as mongooseTypes.ObjectId,
              'User',
              UserModel.userIdExists
            )
          );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (workspace.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: workspace.createdAt}
      );
    if (workspace.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: workspace.updatedAt}
      );
    if ((workspace as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The workspace._id is immutable and cannot be changed',
        {_id: (workspace as Record<string, unknown>)['_id']}
      );
  }
);

// CREATE
SCHEMA.static(
  'createWorkspace',
  async (input: IWorkspaceCreateInput): Promise<databaseTypes.IWorkspace> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [ 
          tags,
          creator,
                    members,
          projects,
          states
        ] = await Promise.all([
        WORKSPACE_MODEL.validateTags(input.tags ?? []),
        WORKSPACE_MODEL.validateCreator(input.creator),
                WORKSPACE_MODEL.validateMembers(input.members ?? []),
        WORKSPACE_MODEL.validateProjects(input.projects ?? []),
        WORKSPACE_MODEL.validateStates(input.states ?? []),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IWorkspaceDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        workspaceCode: input.workspaceCode,
                inviteCode: input.inviteCode,
                name: input.name,
                slug: input.slug,
                tags: input.tags,
                description: input.description,
                creator: creator,
        members: input.members,
                projects: input.projects,
                states: input.states
              };
      try {
        await WORKSPACE_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IWorkspaceDocument',
          resolvedInput,
          err
        );
      }
      const workspaceDocument = (
        await WORKSPACE_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = workspaceDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the workspace.  See the inner error for additional details',
          'mongoDb',
          'addWorkspace',
          {},
          err
        );
      }
    }
    if (id) return await WORKSPACE_MODEL.getWorkspaceById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the workspace may not have been created.  I have no other information to provide.'
      );
  }
);

// READ
SCHEMA.static('getWorkspaceById', async (workspaceId: mongooseTypes.ObjectId) => {
  try {
    const workspaceDocument = (await WORKSPACE_MODEL.findById(workspaceId)
      .populate('tags')
      .populate('creator')
      .populate('members')
      .populate('projects')
      .populate('states')
      .lean()) as databaseTypes.IWorkspace;
    if (!workspaceDocument) {
      throw new error.DataNotFoundError(
        `Could not find a workspace with the _id: ${ workspaceId}`,
        'workspace_id',
        workspaceId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (workspaceDocument as any)['__v'];

    workspaceDocument.tags?.forEach((m: any) => delete (m as any)['__v']);
        delete (workspaceDocument as any).creator?.['__v'];
    workspaceDocument.members?.forEach((m: any) => delete (m as any)['__v']);
        workspaceDocument.projects?.forEach((m: any) => delete (m as any)['__v']);
        workspaceDocument.states?.forEach((m: any) => delete (m as any)['__v']);
    
    return workspaceDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getWorkspaceById',
        err
      );
  }
});

SCHEMA.static(
  'queryWorkspaces',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await WORKSPACE_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find workspaces with the filter: ${filter}`,
          'queryWorkspaces',
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

      const workspaceDocuments = (await WORKSPACE_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('tags')
        .populate('creator')
        .populate('members')
        .populate('projects')
        .populate('states')
        .lean()) as databaseTypes.IWorkspace[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      workspaceDocuments.forEach((doc: any) => {
      delete (doc as any)['__v'];
      (doc as any).tags?.forEach((m: any) => delete (m as any)['__v']);
            delete (doc as any).creator?.['__v'];
      (doc as any).members?.forEach((m: any) => delete (m as any)['__v']);
            (doc as any).projects?.forEach((m: any) => delete (m as any)['__v']);
            (doc as any).states?.forEach((m: any) => delete (m as any)['__v']);
            });

      const retval: IQueryResult<databaseTypes.IWorkspace> = {
        results: workspaceDocuments,
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
          'An unexpected error occurred while getting the workspaces.  See the inner error for additional information',
          'mongoDb',
          'queryWorkspaces',
          err
        );
    }
  }
);

// UPDATE
SCHEMA.static(
  'updateWorkspaceWithFilter',
  async (
    filter: Record<string, unknown>,
    workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>
  ): Promise<void> => {
    try {
      await WORKSPACE_MODEL.validateUpdateObject(workspace);
      const updateDate = new Date();
      const transformedObject: Partial<IWorkspaceDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in workspace) {
        const value = (workspace as Record<string, any>)[key];
          if (key === 'creator')
            transformedObject.creator =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await WORKSPACE_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No workspace document with filter: ${filter} was found',
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
          'update workspace',
          {filter: filter, workspace : workspace },
          err
        );
    }
  }
);

SCHEMA.static(
  'updateWorkspaceById',
  async (
    workspaceId: mongooseTypes.ObjectId,
    workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>
  ): Promise<databaseTypes.IWorkspace> => {
    await WORKSPACE_MODEL.updateWorkspaceWithFilter({_id: workspaceId}, workspace);
    return await WORKSPACE_MODEL.getWorkspaceById(workspaceId);
  }
);

// DELETE
SCHEMA.static(
  'deleteWorkspaceById',
  async (workspaceId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await WORKSPACE_MODEL.deleteOne({_id: workspaceId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A workspace with a _id: ${ workspaceId} was not found in the database`,
          '_id',
          workspaceId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the workspace from the database. The workspace may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete workspace',
          {_id: workspaceId},
          err
        );
    }
  }
);



SCHEMA.static(
  'addCreator',
  async (
    workspaceId: mongooseTypes.ObjectId,
    creator: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!creator) throw new error.InvalidArgumentError('You must supply at least one id', 'creator', creator);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);

      if (!workspaceDocument)
        throw new error.DataNotFoundError('A workspaceDocument with _id cannot be found', 'workspace._id', workspaceId);

      const reconciledId = await WORKSPACE_MODEL.validateCreator(creator)

      if (workspaceDocument.creator?.toString() !== reconciledId.toString()) {
      const reconciledId = await WORKSPACE_MODEL.validateCreator(creator);

        // @ts-ignore
        workspaceDocument.creator = reconciledId
        await workspaceDocument.save();
      }
      
      return await WORKSPACE_MODEL.getWorkspaceById(workspaceId);

    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the creator. See the inner error for additional information',
          'mongoDb',
          'workspace.addCreator',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  "removeCreator",
  async (
    workspaceId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IWorkspace> => {
    try {
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument)
        throw new error.DataNotFoundError(
          "A workspaceDocument with _id cannot be found",
          "workspace._id",
          workspaceId
        );

      // @ts-ignore
      workspaceDocument.creator = undefined;
      await workspaceDocument.save();

      return await WORKSPACE_MODEL.getWorkspaceById(workspaceId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          "An unexpected error occurred while removing the creator. See the inner error for additional information",
          "mongoDb",
          "workspace.removeCreator",
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateCreator',
  async (
    input: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const creatorId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (
      !(await UserModel.userIdExists(creatorId))
    ) {
      throw new error.InvalidArgumentError(
        `The creator: ${ creatorId} does not exist`,
        'creatorId',
        creatorId
      );
    }
    return creatorId;
  }
);


// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['workspace'];

const WORKSPACE_MODEL = model<IWorkspaceDocument, IWorkspaceStaticMethods>(
  'workspace',
  SCHEMA
);

export { WORKSPACE_MODEL as WorkspaceModel };
;
