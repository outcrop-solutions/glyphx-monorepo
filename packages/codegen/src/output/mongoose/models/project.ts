import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IProjectDocument, IProjectCreateInput, IProjectStaticMethods, IProjectMethods} from '../interfaces';
import { WorkspaceModel} from './workspace'
import { aspectSchema } from '../schemas'
import { ProjectTemplateModel} from './project_template'
import { MemberModel} from './member'
import { TagModel} from './tag'
import { omitSchema } from '../schemas'
import { StateModel} from './state'
import { FileStatModel} from './file_stat'

const SCHEMA = new Schema<IProjectDocument, IProjectStaticMethods, IProjectMethods>({
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
  name: {
    type: String,
    required: true,
      default: false
      },
  description: {
    type: String,
    required: false,
      default: false
      },
  sdtPath: {
    type: String,
    required: false,
      default: false
      },
  workspace: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'workspace'
  },
  lastOpened: {
    type: Date,
    required: false,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  imageHash: {
    type: String,
    required: false,
      default: false
      },
  aspectRatio: {
    type: aspectRatioSchema,
    required: false,
    default: {}
  },
  slug: {
    type: String,
    required: false,
      default: false
      },
  template: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'projecttemplate'
  },
  members: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'members'
  },
  tags: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'tags'
  },
  currentVersion: {
    type: Number,
    required: false,
      default: false
      },
  state: {
    type: stateSchema,
    required: false,
    default: {}
  },
  stateHistory: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'stateHistory'
  },
  files: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'files'
  },
  viewName: {
    type: String,
    required: false,
      default: false
      }
})

SCHEMA.static(
  'projectIdExists',
  async (projectId: mongooseTypes.ObjectId): Promise<boolean> => {
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
  }
);

SCHEMA.static(
  'allProjectIdsExist',
  async (projectIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await PROJECT_MODEL.find({_id: {$in: projectIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      projectIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
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
          { projectIds: projectIds},
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
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<void> => {
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
            idValidator(
              project.workspace._id as mongooseTypes.ObjectId,
              'Workspace',
              WorkspaceModel.workspaceIdExists
            )
          );
        if (project.template)
          tasks.push(
            idValidator(
              project.template._id as mongooseTypes.ObjectId,
              'Template',
              TemplateModel.templateIdExists
            )
          );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (project.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: project.createdAt}
      );
    if (project.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: project.updatedAt}
      );
    if ((project as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The project._id is immutable and cannot be changed',
        {_id: (project as Record<string, unknown>)['_id']}
      );
  }
);

SCHEMA.static(
  'createProject',
  async (input: IProjectCreateInput): Promise<databaseTypes.IProject> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [ 
          members,
          tags,
          stateHistory,
          files,
        ] = await Promise.all([
        PROJECT_MODEL.validateMembers(input.workspace ?? []),
        PROJECT_MODEL.validateTags(input.workspace ?? []),
        PROJECT_MODEL.validateStateHistories(input.workspace ?? []),
        PROJECT_MODEL.validateFiles(input.workspace ?? []),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IProjectDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        name: input.name,
        description: input.description,
        sdtPath: input.sdtPath,
        workspace: input.workspace,
        lastOpened: input.lastOpened,
        imageHash: input.imageHash,
        aspectRatio: input.aspectRatio,
        slug: input.slug,
        template: input.template,
        members: input.members,
        tags: input.tags,
        currentVersion: input.currentVersion,
        state: input.state,
        stateHistory: input.stateHistory,
        files: input.files,
        viewName: input.viewName
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
      const projectDocument = (
        await PROJECT_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = projectDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the project.  See the inner error for additional details',
          'mongoDb',
          'addProject',
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
  }
);

SCHEMA.static('getProjectById', async (projectId: mongooseTypes.ObjectId) => {
  try {
    const projectDocument = (await PROJECT_MODEL.findById(projectId)
      .populate('workspace')
      .populate('aspectRatio')
      .populate('template')
      .populate('members')
      .populate('tags')
      .populate('state')
      .populate('stateHistory')
      .populate('files')
      .lean()) as databaseTypes.IProject;
    if (!projectDocument) {
      throw new error.DataNotFoundError(
        `Could not find a project with the _id: ${ projectId}`,
        'project_id',
        projectId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (projectDocument as any)['__v'];

    delete (projectDocument as any).workspace?.['__v'];
    delete (projectDocument as any).template?.['__v'];
    projectDocument.members?.forEach((m: any) => delete (m as any)['__v']);
        projectDocument.tags?.forEach((m: any) => delete (m as any)['__v']);
        projectDocument.stateHistory?.forEach((m: any) => delete (m as any)['__v']);
        projectDocument.files?.forEach((m: any) => delete (m as any)['__v']);
    
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

SCHEMA.static(
  'updateProjectWithFilter',
  async (
    filter: Record<string, unknown>,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<void> => {
    try {
      await PROJECT_MODEL.validateUpdateObject(project);
      const updateDate = new Date();
      const transformedObject: Partial<IProjectDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in project) {
        const value = (project as Record<string, any>)[key];
          if (key === 'workspace')
            transformedObject.workspace =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
          if (key === 'template')
            transformedObject.template =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await PROJECT_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No project document with filter: ${filter} was found',
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
          'update project',
          {filter: filter, project : project },
          err
        );
    }
  }
);

SCHEMA.static(
  'queryProjects',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await PROJECT_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find projects with the filter: ${filter}`,
          'queryProjects',
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

      const projectDocuments = (await PROJECT_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('workspace')
        .populate('aspectRatio')
        .populate('template')
        .populate('members')
        .populate('tags')
        .populate('state')
        .populate('stateHistory')
        .populate('files')
        .lean()) as databaseTypes.IProject[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      projectDocuments.forEach((doc: any) => {
      delete (doc as any)['__v'];
      delete (doc as any).workspace?.['__v'];
      delete (doc as any).template?.['__v'];
      (doc as any).members?.forEach((m: any) => delete (m as any)['__v']);
            (doc as any).tags?.forEach((m: any) => delete (m as any)['__v']);
            (doc as any).stateHistory?.forEach((m: any) => delete (m as any)['__v']);
            (doc as any).files?.forEach((m: any) => delete (m as any)['__v']);
            });

      const retval: IQueryResult<databaseTypes.IProject> = {
        results: projectDocuments,
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
          'An unexpected error occurred while getting the projects.  See the inner error for additional information',
          'mongoDb',
          'queryProjects',
          err
        );
    }
  }
);

SCHEMA.static(
  'deleteProjectById',
  async (projectId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await PROJECT_MODEL.deleteOne({_id: projectId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A project with a _id: ${ projectId} was not found in the database`,
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
    'addMembers',
    async (
    projectId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!members.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'members',
          members
        );
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A projectDocument with _id cannot be found',
          'project._id',
          projectId
        );

      const reconciledIds = await PROJECT_MODEL.validateMember(members);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        if (
          !projectDocument.members.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          projectDocument.members.push(
            p as unknown as databaseTypes.IMember
          );
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
          'An unexpected error occurred while adding the Members. See the inner error for additional information',
          'mongoDb',
          'project.addMembers',
          err
        );
      }
    }
})

SCHEMA.static(
    'removeMembers',
    async (
     projectId: mongooseTypes.ObjectId, 
     members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!members.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'members',
          members
        );
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          projectId
        );

      const reconciledIds = members.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedMembers = projectDocument.members.filter((p: any) => {
        let retval = true;
        if (
          reconciledIds.find(
            (r: any) =>
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
        projectDocument.members =
          updatedMembers as unknown as databaseTypes.IMember[];
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
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'project.removeMembers',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    'validateMembers', 
    async (
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const membersIds: mongooseTypes.ObjectId[] = [];
    members.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) membersIds.push(p);
      else membersIds.push(p._id as mongooseTypes.ObjectId);
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
  })

SCHEMA.static(
    'addTags',
    async (
    projectId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!tags.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'tags',
          tags
        );
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A projectDocument with _id cannot be found',
          'project._id',
          projectId
        );

      const reconciledIds = await PROJECT_MODEL.validateTag(tags);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        if (
          !projectDocument.tags.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          projectDocument.tags.push(
            p as unknown as databaseTypes.ITag
          );
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
          'An unexpected error occurred while adding the Tags. See the inner error for additional information',
          'mongoDb',
          'project.addTags',
          err
        );
      }
    }
})

SCHEMA.static(
    'removeTags',
    async (
     projectId: mongooseTypes.ObjectId, 
     tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!tags.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'tags',
          tags
        );
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          projectId
        );

      const reconciledIds = tags.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedTags = projectDocument.tags.filter((p: any) => {
        let retval = true;
        if (
          reconciledIds.find(
            (r: any) =>
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
        projectDocument.tags =
          updatedTags as unknown as databaseTypes.ITag[];
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
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'project.removeTags',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    'validateTags', 
    async (
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const tagsIds: mongooseTypes.ObjectId[] = [];
    tags.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) tagsIds.push(p);
      else tagsIds.push(p._id as mongooseTypes.ObjectId);
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
  })

SCHEMA.static(
    'addStateHistories',
    async (
    projectId: mongooseTypes.ObjectId,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!states.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'states',
          states
        );
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A projectDocument with _id cannot be found',
          'project._id',
          projectId
        );

      const reconciledIds = await PROJECT_MODEL.validateState(states);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        if (
          !projectDocument.states.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          projectDocument.states.push(
            p as unknown as databaseTypes.IState
          );
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
          'An unexpected error occurred while adding the States. See the inner error for additional information',
          'mongoDb',
          'project.addStates',
          err
        );
      }
    }
})

SCHEMA.static(
    'removeStateHistories',
    async (
     projectId: mongooseTypes.ObjectId, 
     states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!states.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'states',
          states
        );
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          projectId
        );

      const reconciledIds = states.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedStates = projectDocument.states.filter((p: any) => {
        let retval = true;
        if (
          reconciledIds.find(
            (r: any) =>
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
        projectDocument.states =
          updatedStates as unknown as databaseTypes.IState[];
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
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'project.removeStates',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    'validateStateHistories', 
    async (
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const statesIds: mongooseTypes.ObjectId[] = [];
    states.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) statesIds.push(p);
      else statesIds.push(p._id as mongooseTypes.ObjectId);
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
  })

SCHEMA.static(
    'addFiles',
    async (
    projectId: mongooseTypes.ObjectId,
    fileStats: (databaseTypes.IFileStats | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!fileStats.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'fileStats',
          fileStats
        );
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A projectDocument with _id cannot be found',
          'project._id',
          projectId
        );

      const reconciledIds = await PROJECT_MODEL.validateFileStats(fileStats);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        if (
          !projectDocument.fileStats.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          projectDocument.fileStats.push(
            p as unknown as databaseTypes.IFile_stats
          );
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
          'An unexpected error occurred while adding the FileStats. See the inner error for additional information',
          'mongoDb',
          'project.addFileStats',
          err
        );
      }
    }
})

SCHEMA.static(
    'removeFiles',
    async (
     projectId: mongooseTypes.ObjectId, 
     fileStats: (databaseTypes.IFileStats | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!fileStats.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'fileStats',
          fileStats
        );
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          projectId
        );

      const reconciledIds = fileStats.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedFileStats = projectDocument.fileStats.filter((p: any) => {
        let retval = true;
        if (
          reconciledIds.find(
            (r: any) =>
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
        projectDocument.fileStats =
          updatedFileStats as unknown as databaseTypes.IFileStats[];
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
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'project.removeFileStats',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    'validateFiles', 
    async (
    fileStats: (databaseTypes.IFileStats | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const file_statsIds: mongooseTypes.ObjectId[] = [];
    file_stats.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) file_statsIds.push(p);
      else file_statsIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await File_statsModel.allFile_statsIdsExist(file_statsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'file_stats',
          file_stats,
          err
        );
      else throw err;
    }

    return file_statsIds;
  })


// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['project'];

const PROJECT_MODEL = model<IProjectDocument, IProjectStaticMethods>(
  'project',
  SCHEMA
);

export { PROJECT_MODEL as ProjectModel };
;
