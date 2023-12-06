// THIS CODE WAS AUTOMATICALLY GENERATED
import {IQueryResult, databaseTypes} from 'types';
import {DBFormatter} from '../../lib/format';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from 'core';
import {IWorkspaceDocument, IWorkspaceCreateInput, IWorkspaceStaticMethods, IWorkspaceMethods} from '../interfaces';
import {TagModel} from './tag';
import {UserModel} from './user';
import {MemberModel} from './member';
import {ProjectModel} from './project';
import {FileStatsModel} from './fileStats';
import {StateModel} from './state';

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
  id: {
    type: String,
    required: false,
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
  tags: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'tags',
    },
  ],
  description: {
    type: String,
    required: false,
  },
  creator: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'user',
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'members',
    },
  ],
  projects: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'projects',
    },
  ],
  filesystem: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'filesystem',
    },
  ],
  states: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'states',
    },
  ],
});

SCHEMA.static('workspaceIdExists', async (workspaceId: mongooseTypes.ObjectId): Promise<boolean> => {
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
});

SCHEMA.static('allWorkspaceIdsExist', async (workspaceIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await WORKSPACE_MODEL.find({_id: {$in: workspaceIds}}, ['_id'])) as {
      _id: mongooseTypes.ObjectId;
    }[];

    workspaceIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
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
        {workspaceIds: workspaceIds},
        err
      );
    }
  }
  return true;
});

SCHEMA.static(
  'validateUpdateObject',
  async (workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>): Promise<void> => {
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
      tasks.push(idValidator(workspace.creator._id as mongooseTypes.ObjectId, 'User', UserModel.userIdExists));

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (workspace.createdAt)
      throw new error.InvalidOperationError('The createdAt date is set internally and cannot be altered externally', {
        createdAt: workspace.createdAt,
      });
    if (workspace.updatedAt)
      throw new error.InvalidOperationError('The updatedAt date is set internally and cannot be altered externally', {
        updatedAt: workspace.updatedAt,
      });
    if ((workspace as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError('The workspace._id is immutable and cannot be changed', {
        _id: (workspace as Record<string, unknown>)['_id'],
      });
  }
);

// CREATE
SCHEMA.static('createWorkspace', async (input: IWorkspaceCreateInput): Promise<databaseTypes.IWorkspace> => {
  let id: undefined | mongooseTypes.ObjectId = undefined;

  try {
    const [tags, creator, members, projects, filesystem, states] = await Promise.all([
      WORKSPACE_MODEL.validateTags(input.tags ?? []),
      WORKSPACE_MODEL.validateCreator(input.creator),
      WORKSPACE_MODEL.validateMembers(input.members ?? []),
      WORKSPACE_MODEL.validateProjects(input.projects ?? []),
      WORKSPACE_MODEL.validateFilesystems(input.filesystem ?? []),
      WORKSPACE_MODEL.validateStates(input.states ?? []),
    ]);

    const createDate = new Date();

    //istanbul ignore next
    const resolvedInput: IWorkspaceDocument = {
      createdAt: createDate,
      updatedAt: createDate,
      id: input.id,
      workspaceCode: input.workspaceCode,
      inviteCode: input.inviteCode,
      name: input.name,
      slug: input.slug,
      tags: tags,
      description: input.description,
      creator: creator,
      members: members,
      projects: projects,
      filesystem: filesystem,
      states: states,
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
    const workspaceDocument = (await WORKSPACE_MODEL.create([resolvedInput], {validateBeforeSave: false}))[0];
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
  if (id) return await WORKSPACE_MODEL.getWorkspaceById(id.toString());
  else
    throw new error.UnexpectedError(
      'An unexpected error has occurred and the workspace may not have been created.  I have no other information to provide.'
    );
});

// READ
SCHEMA.static('getWorkspaceById', async (workspaceId: string) => {
  try {
    const workspaceDocument = (await WORKSPACE_MODEL.findById(workspaceId)
      .populate('tags')
      .populate('creator')
      .populate('members')
      .populate('projects')
      .populate('filesystem')
      .populate('states')
      .lean()) as databaseTypes.IWorkspace;
    if (!workspaceDocument) {
      throw new error.DataNotFoundError(
        `Could not find a workspace with the _id: ${workspaceId}`,
        'workspace_id',
        workspaceId
      );
    }
    const format = new DBFormatter();
    return format.toJS(workspaceDocument);
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

SCHEMA.static('queryWorkspaces', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
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
      .populate('filesystem')
      .populate('states')
      .lean()) as databaseTypes.IWorkspace[];

    const format = new DBFormatter();
    const workspaces = workspaceDocuments?.map((doc: any) => {
      return format.toJS(doc);
    });

    const retval: IQueryResult<databaseTypes.IWorkspace> = {
      results: workspaces as unknown as databaseTypes.IWorkspace[],
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the workspaces.  See the inner error for additional information',
        'mongoDb',
        'queryWorkspaces',
        err
      );
  }
});

// UPDATE
SCHEMA.static(
  'updateWorkspaceWithFilter',
  async (filter: Record<string, unknown>, workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>): Promise<void> => {
    try {
      await WORKSPACE_MODEL.validateUpdateObject(workspace);
      const updateDate = new Date();
      const transformedObject: Partial<IWorkspaceDocument> & Record<string, unknown> = {updatedAt: updateDate};
      for (const key in workspace) {
        const value = (workspace as Record<string, any>)[key];
        if (key === 'creator')
          transformedObject.creator =
            value instanceof mongooseTypes.ObjectId ? value : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await WORKSPACE_MODEL.updateOne(filter, transformedObject);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No workspace document with filter: ${filter} was found',
          'filter',
          filter
        );
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the project with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update workspace',
          {filter: filter, workspace: workspace},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateWorkspaceById',
  async (
    workspaceId: string,
    workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>
  ): Promise<databaseTypes.IWorkspace> => {
    await WORKSPACE_MODEL.updateWorkspaceWithFilter({_id: workspaceId}, workspace);
    return await WORKSPACE_MODEL.getWorkspaceById(workspaceId);
  }
);

// DELETE
SCHEMA.static('deleteWorkspaceById', async (workspaceId: string): Promise<void> => {
  try {
    const results = await WORKSPACE_MODEL.deleteOne({_id: workspaceId});
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `A workspace with a _id: ${workspaceId} was not found in the database`,
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
});

SCHEMA.static(
  'addTags',
  async (workspaceId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!tags.length) throw new error.InvalidArgumentError('You must supply at least one id', 'tags', tags);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument)
        throw new error.DataNotFoundError('A workspaceDocument with _id cannot be found', 'workspace._id', workspaceId);

      const reconciledIds = await WORKSPACE_MODEL.validateTags(tags);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // @ts-ignore
        if (!workspaceDocument.tags.find((id: any) => id.toString() === p.toString())) {
          dirty = true;
          // @ts-ignore
          workspaceDocument.tags.push(p as unknown as databaseTypes.ITag);
        }
      });

      if (dirty) await workspaceDocument.save();

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
          'An unexpected error occurred while adding the Tags. See the inner error for additional information',
          'mongoDb',
          'workspace.addTags',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeTags',
  async (workspaceId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!tags.length) throw new error.InvalidArgumentError('You must supply at least one id', 'tags', tags);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument) throw new error.DataNotFoundError('A Document cannot be found', '._id', workspaceId);

      const reconciledIds = tags.map((i: any) =>
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // @ts-ignore
      const updatedTags = workspaceDocument.tags.filter((p: any) => {
        let retval = true;
        if (reconciledIds.find((r: any) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        // @ts-ignore
        workspaceDocument.tags = updatedTags as unknown as databaseTypes.ITag[];
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
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'workspace.removeTags',
          err
        );
      }
    }
  }
);

SCHEMA.static('validateTags', async (tags: (databaseTypes.ITag | string)[]): Promise<mongooseTypes.ObjectId[]> => {
  const tagsIds: mongooseTypes.ObjectId[] = [];
  tags.forEach((p: any) => {
    if (typeof p === 'string') tagsIds.push(new mongooseTypes.ObjectId(p));
    else tagsIds.push(new mongooseTypes.ObjectId(p.id));
  });
  try {
    await TagModel.allTagIdsExist(tagsIds);
  } catch (err) {
    if (err instanceof error.DataNotFoundError)
      throw new error.DataValidationError(
        'One or more ids do not exist in the database. See the inner error for additional information',
        'tags',
        tags,
        err
      );
    else throw err;
  }

  return tagsIds;
});

SCHEMA.static(
  'addCreator',
  async (workspaceId: string, creator: databaseTypes.IUser | string): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!creator) throw new error.InvalidArgumentError('You must supply at least one id', 'creator', creator);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);

      if (!workspaceDocument)
        throw new error.DataNotFoundError('A workspaceDocument with _id cannot be found', 'workspace._id', workspaceId);

      const reconciledId = await WORKSPACE_MODEL.validateCreator(creator);

      if (workspaceDocument.creator?.toString() !== reconciledId.toString()) {
        const reconciledId = await WORKSPACE_MODEL.validateCreator(creator);

        // @ts-ignore
        workspaceDocument.creator = reconciledId;
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

SCHEMA.static('removeCreator', async (workspaceId: string): Promise<databaseTypes.IWorkspace> => {
  try {
    const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
    if (!workspaceDocument)
      throw new error.DataNotFoundError('A workspaceDocument with _id cannot be found', 'workspace._id', workspaceId);

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
        'An unexpected error occurred while removing the creator. See the inner error for additional information',
        'mongoDb',
        'workspace.removeCreator',
        err
      );
    }
  }
});

SCHEMA.static('validateCreator', async (input: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId> => {
  const creatorId =
    typeof input === 'string' ? new mongooseTypes.ObjectId(input) : new mongooseTypes.ObjectId(input.id);

  if (!(await UserModel.userIdExists(creatorId))) {
    throw new error.InvalidArgumentError(`The creator: ${creatorId} does not exist`, 'creatorId', creatorId);
  }
  return creatorId;
});
SCHEMA.static(
  'addMembers',
  async (workspaceId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!members.length) throw new error.InvalidArgumentError('You must supply at least one id', 'members', members);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument)
        throw new error.DataNotFoundError('A workspaceDocument with _id cannot be found', 'workspace._id', workspaceId);

      const reconciledIds = await WORKSPACE_MODEL.validateMembers(members);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // @ts-ignore
        if (!workspaceDocument.members.find((id: any) => id.toString() === p.toString())) {
          dirty = true;
          // @ts-ignore
          workspaceDocument.members.push(p as unknown as databaseTypes.IMember);
        }
      });

      if (dirty) await workspaceDocument.save();

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
          'An unexpected error occurred while adding the Members. See the inner error for additional information',
          'mongoDb',
          'workspace.addMembers',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeMembers',
  async (workspaceId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!members.length) throw new error.InvalidArgumentError('You must supply at least one id', 'members', members);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument) throw new error.DataNotFoundError('A Document cannot be found', '._id', workspaceId);

      const reconciledIds = members.map((i: any) =>
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // @ts-ignore
      const updatedMembers = workspaceDocument.members.filter((p: any) => {
        let retval = true;
        if (reconciledIds.find((r: any) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        // @ts-ignore
        workspaceDocument.members = updatedMembers as unknown as databaseTypes.IMember[];
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
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'workspace.removeMembers',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateMembers',
  async (members: (databaseTypes.IMember | string)[]): Promise<mongooseTypes.ObjectId[]> => {
    const membersIds: mongooseTypes.ObjectId[] = [];
    members.forEach((p: any) => {
      if (typeof p === 'string') membersIds.push(new mongooseTypes.ObjectId(p));
      else membersIds.push(new mongooseTypes.ObjectId(p.id));
    });
    try {
      await MemberModel.allMemberIdsExist(membersIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'members',
          members,
          err
        );
      else throw err;
    }

    return membersIds;
  }
);
SCHEMA.static(
  'addProjects',
  async (workspaceId: string, projects: (databaseTypes.IProject | string)[]): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'projects', projects);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument)
        throw new error.DataNotFoundError('A workspaceDocument with _id cannot be found', 'workspace._id', workspaceId);

      const reconciledIds = await WORKSPACE_MODEL.validateProjects(projects);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // @ts-ignore
        if (!workspaceDocument.projects.find((id: any) => id.toString() === p.toString())) {
          dirty = true;
          // @ts-ignore
          workspaceDocument.projects.push(p as unknown as databaseTypes.IProject);
        }
      });

      if (dirty) await workspaceDocument.save();

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
          'An unexpected error occurred while adding the Projects. See the inner error for additional information',
          'mongoDb',
          'workspace.addProjects',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeProjects',
  async (workspaceId: string, projects: (databaseTypes.IProject | string)[]): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'projects', projects);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument) throw new error.DataNotFoundError('A Document cannot be found', '._id', workspaceId);

      const reconciledIds = projects.map((i: any) =>
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // @ts-ignore
      const updatedProjects = workspaceDocument.projects.filter((p: any) => {
        let retval = true;
        if (reconciledIds.find((r: any) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        // @ts-ignore
        workspaceDocument.projects = updatedProjects as unknown as databaseTypes.IProject[];
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
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'workspace.removeProjects',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateProjects',
  async (projects: (databaseTypes.IProject | string)[]): Promise<mongooseTypes.ObjectId[]> => {
    const projectsIds: mongooseTypes.ObjectId[] = [];
    projects.forEach((p: any) => {
      if (typeof p === 'string') projectsIds.push(new mongooseTypes.ObjectId(p));
      else projectsIds.push(new mongooseTypes.ObjectId(p.id));
    });
    try {
      await ProjectModel.allProjectIdsExist(projectsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'projects',
          projects,
          err
        );
      else throw err;
    }

    return projectsIds;
  }
);
SCHEMA.static(
  'addFilesystems',
  async (workspaceId: string, fileStats: (databaseTypes.IFileStats | string)[]): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!fileStats.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'fileStats', fileStats);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument)
        throw new error.DataNotFoundError('A workspaceDocument with _id cannot be found', 'workspace._id', workspaceId);

      const reconciledIds = await WORKSPACE_MODEL.validateFilesystems(fileStats);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // @ts-ignore
        if (!workspaceDocument.filesystem.find((id: any) => id.toString() === p.toString())) {
          dirty = true;
          // @ts-ignore
          workspaceDocument.filesystem.push(p as unknown as databaseTypes.IFileStats);
        }
      });

      if (dirty) await workspaceDocument.save();

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
          'An unexpected error occurred while adding the FileStats. See the inner error for additional information',
          'mongoDb',
          'workspace.addFileStats',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeFilesystems',
  async (workspaceId: string, fileStats: (databaseTypes.IFileStats | string)[]): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!fileStats.length)
        throw new error.InvalidArgumentError('You must supply at least one id', 'fileStats', fileStats);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument) throw new error.DataNotFoundError('A Document cannot be found', '._id', workspaceId);

      const reconciledIds = fileStats.map((i: any) =>
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // @ts-ignore
      const updatedFileStats = workspaceDocument.fileStats.filter((p: any) => {
        let retval = true;
        if (reconciledIds.find((r: any) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        // @ts-ignore
        workspaceDocument.fileStats = updatedFileStats as unknown as databaseTypes.IFileStats[];
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
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'workspace.removeFileStats',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateFilesystems',
  async (fileStats: (databaseTypes.IFileStats | string)[]): Promise<mongooseTypes.ObjectId[]> => {
    const fileStatsIds: mongooseTypes.ObjectId[] = [];
    fileStats.forEach((p: any) => {
      if (typeof p === 'string') fileStatsIds.push(new mongooseTypes.ObjectId(p));
      else fileStatsIds.push(new mongooseTypes.ObjectId(p.id));
    });
    try {
      await FileStatsModel.allFileStatsIdsExist(fileStatsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'fileStats',
          fileStats,
          err
        );
      else throw err;
    }

    return fileStatsIds;
  }
);
SCHEMA.static(
  'addStates',
  async (workspaceId: string, states: (databaseTypes.IState | string)[]): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!states.length) throw new error.InvalidArgumentError('You must supply at least one id', 'states', states);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument)
        throw new error.DataNotFoundError('A workspaceDocument with _id cannot be found', 'workspace._id', workspaceId);

      const reconciledIds = await WORKSPACE_MODEL.validateStates(states);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // @ts-ignore
        if (!workspaceDocument.states.find((id: any) => id.toString() === p.toString())) {
          dirty = true;
          // @ts-ignore
          workspaceDocument.states.push(p as unknown as databaseTypes.IState);
        }
      });

      if (dirty) await workspaceDocument.save();

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
          'An unexpected error occurred while adding the States. See the inner error for additional information',
          'mongoDb',
          'workspace.addStates',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeStates',
  async (workspaceId: string, states: (databaseTypes.IState | string)[]): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!states.length) throw new error.InvalidArgumentError('You must supply at least one id', 'states', states);
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument) throw new error.DataNotFoundError('A Document cannot be found', '._id', workspaceId);

      const reconciledIds = states.map((i: any) =>
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // @ts-ignore
      const updatedStates = workspaceDocument.states.filter((p: any) => {
        let retval = true;
        if (reconciledIds.find((r: any) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        // @ts-ignore
        workspaceDocument.states = updatedStates as unknown as databaseTypes.IState[];
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
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'workspace.removeStates',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateStates',
  async (states: (databaseTypes.IState | string)[]): Promise<mongooseTypes.ObjectId[]> => {
    const statesIds: mongooseTypes.ObjectId[] = [];
    states.forEach((p: any) => {
      if (typeof p === 'string') statesIds.push(new mongooseTypes.ObjectId(p));
      else statesIds.push(new mongooseTypes.ObjectId(p.id));
    });
    try {
      await StateModel.allStateIdsExist(statesIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'states',
          states,
          err
        );
      else throw err;
    }

    return statesIds;
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['workspace'];

const WORKSPACE_MODEL = model<IWorkspaceDocument, IWorkspaceStaticMethods>('workspace', SCHEMA);

export {WORKSPACE_MODEL as WorkspaceModel};
