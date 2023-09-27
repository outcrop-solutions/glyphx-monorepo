import {IQueryResult, databaseTypes} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {IProjectMethods, IProjectStaticMethods, IProjectDocument, IProjectCreateInput} from '../interfaces';
import {error} from 'core';
import {WorkspaceModel} from './workspace';
import {StateModel} from './state';
import {MemberModel} from './member';
import {ProjectTemplateModel} from './projectTemplate';
import {aspectSchema, fileStatsSchema} from '../schemas';
import {embeddedStateSchema} from '../schemas/embeddedState';
import {TagModel} from './tag';
import {DBFormatter} from '../../lib/format';

const SCHEMA = new Schema<IProjectDocument, IProjectStaticMethods, IProjectMethods>({
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
  name: {type: String, required: true},
  imageHash: {type: String, required: false},
  aspectRatio: {type: aspectSchema, required: false},
  description: {type: String, required: false},
  sdtPath: {type: String, required: false},
  currentVersion: {type: Number, required: true, default: 0},
  workspace: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'workspace',
  },
  lastOpened: {type: Date, required: false},
  slug: {type: String, required: false},
  template: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'projecttemplate',
  },
  state: {type: embeddedStateSchema, required: false, default: {}},
  stateHistory: {
    type: [Schema.Types.ObjectId],
    default: [],
    ref: 'state',
  },
  members: {
    type: [Schema.Types.ObjectId],
    default: [],
    ref: 'member',
  },
  tags: {
    type: [Schema.Types.ObjectId],
    default: [],
    ref: 'tag',
  },
  files: {type: [fileStatsSchema], required: true, default: []},
  viewName: {type: String, required: true},
});

SCHEMA.static('projectIdExists', async (projectId: mongooseTypes.ObjectId): Promise<boolean> => {
  let retval = false;
  try {
    const result = await PROJECT_MODEL.findById(projectId, ['_id']);
    if (result) retval = true;
  } catch (err) {
    throw new error.DatabaseOperationError(
      'an unexpected error occurred while trying to find the project.  See the inner error for additional information',
      'mongoDb',
      'projectIdExists',
      {_id: projectId},
      err
    );
  }
  return retval;
});

SCHEMA.static('allProjectIdsExist', async (projectIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await PROJECT_MODEL.find({_id: {$in: projectIds}}, ['_id'])) as {_id: mongooseTypes.ObjectId}[];

    projectIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
    });

    if (notFoundIds.length) {
      throw new error.DataNotFoundError(
        'One or more projectIds cannot be found in the database.',
        'project._id',
        notFoundIds
      );
    }
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the projectIds.  See the inner error for additional information',
        'mongoDb',
        'allProjectIdsExists',
        {projectIds: projectIds},
        err
      );
    }
  }
  return true;
});

SCHEMA.static(
  'validateMembers',
  async (members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]> => {
    const memberIds: mongooseTypes.ObjectId[] = [];
    members.forEach((m) => {
      if (m instanceof mongooseTypes.ObjectId) memberIds.push(m);
      else memberIds.push(m._id as mongooseTypes.ObjectId);
    });
    try {
      await MemberModel.allMemberIdsExist(memberIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more member ids do not exisit in the database.  See the inner error for additional information',
          'member',
          members,
          err
        );
      else throw err;
    }

    return memberIds;
  }
);

SCHEMA.static(
  'addMembers',
  async (
    projectId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!members.length)
        throw new error.InvalidArgumentError('You must supply at least one memberId', 'members', members);
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${projectId} cannot be found`,
          'user._id',
          projectId
        );

      const reconciledIds = await PROJECT_MODEL.validateMembers(members);
      let dirty = false;

      reconciledIds.forEach((m) => {
        if (!projectDocument.members.find((mhId: any) => mhId.toString() === m.toString())) {
          dirty = true;
          projectDocument.members.push(m as unknown as databaseTypes.IMember);
        }
      });

      if (dirty) await projectDocument.save();

      return await PROJECT_MODEL.getProjectById(projectId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while adding the Members. See the innner error for additional information',
          'mongoDb',
          'project.addMembers',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeMembers',
  async (
    projectId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!members.length)
        throw new error.InvalidArgumentError('You must supply at least one memberId', 'memebrship', members);
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${projectId} cannot be found`,
          'user._id',
          projectId
        );

      const reconciledIds = members.map((i) =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedMemberships = projectDocument.members.filter((w: any) => {
        let retval = true;
        if (reconciledIds.find((r) => r.toString() === (w as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        projectDocument.members = updatedMemberships as unknown as databaseTypes.IMember[];
        await projectDocument.save();
      }

      return await PROJECT_MODEL.getProjectById(projectId);
    } catch (err) {
      if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while removing the members. See the innner error for additional information',
          'mongoDb',
          'project.removeMember',
          err
        );
      }
    }
  }
);

SCHEMA.static('validateUpdateObject', async (project: Omit<Partial<databaseTypes.IProject>, '_id'>): Promise<void> => {
  const idValidator = async (
    id: mongooseTypes.ObjectId,
    objectType: string,
    validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
  ) => {
    const result = await validator(id);
    if (!result) {
      throw new error.InvalidOperationError(
        `A ${objectType} with an id: ${id} cannot be found.  You cannot update a project with an invalid ${objectType} id`,
        {objectType: objectType, id: id}
      );
    }
  };

  const tasks: Promise<void>[] = [];

  if (project.workspace)
    tasks.push(
      idValidator(project.workspace._id as mongooseTypes.ObjectId, 'Workspace', WorkspaceModel.workspaceIdExists)
    );

  if (project.template)
    tasks.push(
      idValidator(
        project.template._id as mongooseTypes.ObjectId,
        'ProjectTemplate',
        ProjectTemplateModel.projectTemplateIdExists
      )
    );

  if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

  if (project.createdAt)
    throw new error.InvalidOperationError('The createdAt date is set internally and cannot be altered externally', {
      createdAt: project.createdAt,
    });
  if (project.updatedAt)
    throw new error.InvalidOperationError('The updatedAt date is set internally and cannot be altered externally', {
      updatedAt: project.updatedAt,
    });
  if ((project as Record<string, unknown>)['_id'])
    throw new error.InvalidOperationError('The project._id is immutable and cannot be changed', {
      _id: (project as Record<string, unknown>)['_id'],
    });
});

SCHEMA.static(
  'updateProjectWithFilter',
  async (filter: Record<string, unknown>, project: Omit<Partial<databaseTypes.IProject>, '_id'>): Promise<void> => {
    try {
      await PROJECT_MODEL.validateUpdateObject(project);
      const updateDate = new Date();
      const transformedObject: Partial<IProjectDocument> & Record<string, unknown> = {updatedAt: updateDate};
      for (const key in project) {
        const value = (project as Record<string, any>)[key];
        if (key === 'workspace')
          transformedObject.workspace =
            value instanceof mongooseTypes.ObjectId ? value : (value._id as mongooseTypes.ObjectId);
        else if (key === 'template')
          transformedObject.template =
            value instanceof mongooseTypes.ObjectId ? value : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await PROJECT_MODEL.updateOne(filter, transformedObject);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(`No project document with filter: ${filter} was found`, 'filter', filter);
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the project with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update project',
          {filter: filter, project: project},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateProjectById',
  async (
    projectId: mongooseTypes.ObjectId,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<databaseTypes.IProject> => {
    await PROJECT_MODEL.updateProjectWithFilter({_id: projectId}, project);
    return await PROJECT_MODEL.getProjectById(projectId);
  }
);

SCHEMA.static(
  'validateTemplate',
  async (input: databaseTypes.IProjectTemplate | mongooseTypes.ObjectId): Promise<mongooseTypes.ObjectId> => {
    const projectTemplateId = input instanceof mongooseTypes.ObjectId ? input : (input._id as mongooseTypes.ObjectId);
    if (!(await ProjectTemplateModel.projectTemplateIdExists(projectTemplateId))) {
      throw new error.InvalidArgumentError(
        `The project template : ${projectTemplateId} does not exist`,
        'projectTemplateId',
        projectTemplateId
      );
    }
    return projectTemplateId;
  }
);

SCHEMA.static(
  'validateWorkspace',
  async (input: databaseTypes.IWorkspace | mongooseTypes.ObjectId): Promise<mongooseTypes.ObjectId> => {
    const workspaceId = input instanceof mongooseTypes.ObjectId ? input : (input._id as mongooseTypes.ObjectId);
    if (!(await WorkspaceModel.workspaceIdExists(workspaceId))) {
      throw new error.InvalidArgumentError(`The workspace : ${workspaceId} does not exist`, 'workspaceId', workspaceId);
    }
    return workspaceId;
  }
);

SCHEMA.static(
  'validateStates',
  async (states: (databaseTypes.IState | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]> => {
    const stateIds: mongooseTypes.ObjectId[] = [];
    states.forEach((m) => {
      if (m instanceof mongooseTypes.ObjectId) stateIds.push(m);
      else stateIds.push(m._id as mongooseTypes.ObjectId);
    });
    try {
      await StateModel.allStateIdsExist(stateIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more state ids do not exisit in the database.  See the inner error for additional information',
          'state',
          states,
          err
        );
      else throw err;
    }

    return stateIds;
  }
);

SCHEMA.static(
  'validateTags',
  async (tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]> => {
    const tagIds: mongooseTypes.ObjectId[] = [];
    tags.forEach((m) => {
      if (m instanceof mongooseTypes.ObjectId) tagIds.push(m);
      else tagIds.push(m._id as mongooseTypes.ObjectId);
    });
    try {
      await TagModel.allTagIdsExist(tagIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more tag ids do not exisit in the database.  See the inner error for additional information',
          'tag',
          tags,
          err
        );
      else throw err;
    }

    return tagIds;
  }
);

SCHEMA.static(
  'addStates',
  async (
    projectId: mongooseTypes.ObjectId,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!states.length)
        throw new error.InvalidArgumentError('You must supply at least one stateId', 'states', states);
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          `A Project Document with _id : ${projectId} cannot be found`,
          'project._id',
          projectId
        );

      const reconciledIds = await PROJECT_MODEL.validateStates(states);
      let dirty = false;

      reconciledIds.forEach((s) => {
        if (!projectDocument.stateHistory.find((sId: any) => sId.toString() === s.toString())) {
          dirty = true;
          projectDocument.stateHistory.push(s as unknown as databaseTypes.IState);
        }
      });

      if (dirty) await projectDocument.save();

      return await PROJECT_MODEL.getProjectById(projectId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while adding the States. See the innner error for additional information',
          'mongoDb',
          'project.addStates',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeStates',
  async (
    projectId: mongooseTypes.ObjectId,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!states.length)
        throw new error.InvalidArgumentError('You must supply at least one stateId', 'states', states);
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          `A Project Document with _id : ${projectId} cannot be found`,
          'project._id',
          projectId
        );

      const reconciledIds = states.map((i) =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedStates = projectDocument.stateHistory.filter((s: any) => {
        let retval = true;
        if (reconciledIds.find((r) => r.toString() === (s as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        projectDocument.stateHistory = updatedStates as unknown as databaseTypes.IState[];
        await projectDocument.save();
      }

      return await PROJECT_MODEL.getProjectById(projectId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while removing the states. See the innner error for additional information',
          'mongoDb',
          'project.removeStates',
          err
        );
      }
    }
  }
);

SCHEMA.static('createProject', async (input: IProjectCreateInput): Promise<databaseTypes.IProject> => {
  let id: undefined | mongooseTypes.ObjectId = undefined;

  try {
    const [workspace, members, tags] = await Promise.all([
      PROJECT_MODEL.validateWorkspace(input.workspace),
      PROJECT_MODEL.validateMembers(input.members ?? []),
      PROJECT_MODEL.validateTags(input.tags ?? []),
    ]);

    const createDate = new Date();

    const template: {template: mongooseTypes.ObjectId} = input.template
      ? {template: input.template as mongooseTypes.ObjectId}
      : ({} as {template: mongooseTypes.ObjectId});

    //istanbul ignore next
    const resolvedInput: IProjectDocument = {
      createdAt: createDate,
      updatedAt: createDate,
      name: input.name,
      description: input.description ?? ' ',
      sdtPath: input.sdtPath,
      currentVersion: input.currentVersion ?? 0,
      state: input.state,
      members: members ?? [],
      tags: tags ?? [],
      stateHistory: [],
      workspace: workspace,
      slug: input.slug,
      files: input.files ?? [],
      viewName: input.viewName ?? ' ',
      ...template,
    };
    try {
      await PROJECT_MODEL.validate(resolvedInput);
    } catch (err) {
      throw new error.DataValidationError(
        'An error occurred while validating the document before creating it.  See the inner error for additional information',
        'IProjectDocument',
        resolvedInput,
        err
      );
    }
    const projectDocument = (await PROJECT_MODEL.create([resolvedInput], {validateBeforeSave: false}))[0];
    id = projectDocument._id;
  } catch (err) {
    if (err instanceof error.DataValidationError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'An Unexpected Error occurred while adding the project.  See the inner error for additional details',
        'mongoDb',
        'add Project',
        {},
        err
      );
    }
  }
  if (id) return await PROJECT_MODEL.getProjectById(id);
  else
    throw new error.UnexpectedError(
      'An unexpected error has occurred and the project may not have been created.  I have no other information to provide.'
    );
});

SCHEMA.static('getProjectById', async (projectId: mongooseTypes.ObjectId) => {
  try {
    const projectDocument = (await PROJECT_MODEL.findById(projectId)
      .populate('workspace')
      .populate('members')
      .populate('template')
      .populate('tags')
      .populate({
        path: 'stateHistory',
        populate: {path: 'camera'},
      })
      .lean()) as databaseTypes.IProject;
    if (!projectDocument) {
      throw new error.DataNotFoundError(`Could not find a project with the _id: ${projectId}`, 'project_id', projectId);
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (projectDocument as any)['__v'];
    delete (projectDocument as any).workspace?.['__v'];
    delete (projectDocument as any).template?.['__v'];

    projectDocument.members?.forEach((m: any) => delete (m as any)['__v']);
    projectDocument.tags?.forEach((t: any) => delete (t as any)['__v']);
    projectDocument.stateHistory?.forEach((s: any) => {
      delete (s as any)['__v'];
      delete (s as any).camera?.__v;
    });

    return projectDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getProjectById',
        err
      );
  }
});

SCHEMA.static('queryProjects', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
  try {
    const count = await PROJECT_MODEL.count(filter);

    if (!count) {
      throw new error.DataNotFoundError(`Could not find projects with the filter: ${filter}`, 'queryProjects', filter);
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

    const projectDocuments = (await PROJECT_MODEL.find(filter, null, {
      skip: skip,
      limit: itemsPerPage,
    })
      .populate('workspace')
      .populate('template')
      .lean()) as databaseTypes.IProject[];

    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    projectDocuments.forEach((doc: any) => {
      delete (doc as any)['__v'];
      delete (doc as any)?.workspace?.__v;
      delete (doc as any)?.template?.__v;
    });

    const retval: IQueryResult<databaseTypes.IProject> = {
      results: projectDocuments,
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the projects.  See the inner error for additional information',
        'mongoDb',
        'queryProjects',
        err
      );
  }
});

SCHEMA.static('deleteProjectById', async (projectId: mongooseTypes.ObjectId): Promise<void> => {
  try {
    const results = await PROJECT_MODEL.deleteOne({_id: projectId});
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `A project with a _id: ${projectId} was not found in the database`,
        '_id',
        projectId
      );
  } catch (err) {
    if (err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while deleteing the project from the database. The project may still exist.  See the inner error for additional information',
        'mongoDb',
        'delete project',
        {_id: projectId},
        err
      );
  }
});

SCHEMA.virtual('id').get(function () {
  // In the getter function, `this` is the document. Don't use arrow
  // functions for virtual getters!
  return this._id.toString();
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['project'];

const PROJECT_MODEL = model<IProjectDocument, IProjectStaticMethods>('project', SCHEMA);

export {PROJECT_MODEL as ProjectModel};
