// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {
  IProjectDocument,
  IProjectCreateInput,
  IProjectStaticMethods,
  IProjectMethods,
} from '../interfaces';
import {WorkspaceModel} from './workspace';
// eslint-disable-next-line import/no-duplicates
import {aspectRatioSchema} from '../schemas';
import {ProjectTemplateModel} from './projectTemplate';
import {MemberModel} from './member';
import {TagModel} from './tag';
import {StateModel} from './state';

const SCHEMA = new Schema<
  IProjectDocument,
  IProjectStaticMethods,
  IProjectMethods
>({
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
  },
  description: {
    type: String,
    required: false,
  },
  sdtPath: {
    type: String,
    required: false,
  },
  workspace: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'workspace',
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
  },
  aspectRatio: {
    type: aspectRatioSchema,
    required: false,
    default: {},
  },
  slug: {
    type: String,
    required: false,
  },
  template: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'projecttemplate',
  },
  members: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'members',
  },
  tags: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'tags',
  },
  currentVersion: {
    type: Number,
    required: false,
  },
  state: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
  states: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'states',
  },
  files: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
  viewName: {
    type: String,
    required: false,
  },
});

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
          {projectIds: projectIds},
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
          'ProjectTemplate',
          ProjectTemplateModel.projectTemplateIdExists
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

// CREATE
SCHEMA.static(
  'createProject',
  async (input: IProjectCreateInput): Promise<databaseTypes.IProject> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [workspace, template, members, tags, states] = await Promise.all([
        PROJECT_MODEL.validateWorkspace(input.workspace),
        PROJECT_MODEL.validateTemplate(input.template),
        PROJECT_MODEL.validateMembers(input.members ?? []),
        PROJECT_MODEL.validateTags(input.tags ?? []),
        PROJECT_MODEL.validateStates(input.states ?? []),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IProjectDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        name: input.name,
        description: input.description,
        sdtPath: input.sdtPath,
        workspace: workspace,
        lastOpened: input.lastOpened,
        imageHash: input.imageHash,
        aspectRatio: input.aspectRatio,
        slug: input.slug,
        template: template,
        members: members,
        tags: tags,
        currentVersion: input.currentVersion,
        state: input.state,
        states: states,
        files: input.files,
        viewName: input.viewName,
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

// READ
SCHEMA.static('getProjectById', async (projectId: mongooseTypes.ObjectId) => {
  try {
    const projectDocument = (await PROJECT_MODEL.findById(projectId)
      .populate('workspace')
      .populate('aspectRatio')
      .populate('template')
      .populate('members')
      .populate('tags')
      .populate('state')
      .populate('states')
      .populate('files')
      .lean()) as databaseTypes.IProject;
    if (!projectDocument) {
      throw new error.DataNotFoundError(
        `Could not find a project with the _id: ${projectId}`,
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
    projectDocument.states?.forEach((m: any) => delete (m as any)['__v']);

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
        .populate('states')
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
        (doc as any).states?.forEach((m: any) => delete (m as any)['__v']);
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

// UPDATE
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

// DELETE
SCHEMA.static(
  'deleteProjectById',
  async (projectId: mongooseTypes.ObjectId): Promise<void> => {
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
  }
);

SCHEMA.static(
  'addWorkspace',
  async (
    projectId: mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!workspace)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'workspace',
          workspace
        );
      const projectDocument = await PROJECT_MODEL.findById(projectId);

      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A projectDocument with _id cannot be found',
          'project._id',
          projectId
        );

      const reconciledId = await PROJECT_MODEL.validateWorkspace(workspace);

      if (projectDocument.workspace?.toString() !== reconciledId.toString()) {
        const reconciledId = await PROJECT_MODEL.validateWorkspace(workspace);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        projectDocument.workspace = reconciledId;
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
          'An unexpected error occurred while adding the workspace. See the inner error for additional information',
          'mongoDb',
          'project.addWorkspace',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeWorkspace',
  async (
    projectId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProject> => {
    try {
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A projectDocument with _id cannot be found',
          'project._id',
          projectId
        );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      projectDocument.workspace = undefined;
      await projectDocument.save();

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
          'An unexpected error occurred while removing the workspace. See the inner error for additional information',
          'mongoDb',
          'project.removeWorkspace',
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

SCHEMA.static(
  'addTemplate',
  async (
    projectId: mongooseTypes.ObjectId,
    template: databaseTypes.IProjectTemplate | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProject> => {
    try {
      if (!template)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'template',
          template
        );
      const projectDocument = await PROJECT_MODEL.findById(projectId);

      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A projectDocument with _id cannot be found',
          'project._id',
          projectId
        );

      const reconciledId = await PROJECT_MODEL.validateTemplate(template);

      if (projectDocument.template?.toString() !== reconciledId.toString()) {
        const reconciledId = await PROJECT_MODEL.validateTemplate(template);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        projectDocument.template = reconciledId;
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
          'An unexpected error occurred while adding the template. See the inner error for additional information',
          'mongoDb',
          'project.addTemplate',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeTemplate',
  async (
    projectId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProject> => {
    try {
      const projectDocument = await PROJECT_MODEL.findById(projectId);
      if (!projectDocument)
        throw new error.DataNotFoundError(
          'A projectDocument with _id cannot be found',
          'project._id',
          projectId
        );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      projectDocument.template = undefined;
      await projectDocument.save();

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
          'An unexpected error occurred while removing the template. See the inner error for additional information',
          'mongoDb',
          'project.removeTemplate',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateTemplate',
  async (
    input: databaseTypes.IProjectTemplate | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const templateId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await ProjectTemplateModel.projectTemplateIdExists(templateId))) {
      throw new error.InvalidArgumentError(
        `The template: ${templateId} does not exist`,
        'templateId',
        templateId
      );
    }
    return templateId;
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

      const reconciledIds = await PROJECT_MODEL.validateMembers(members);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (
          !projectDocument.members.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          projectDocument.members.push(p as unknown as databaseTypes.IMember);
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
);

SCHEMA.static(
  'validateMembers',
  async (
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const membersIds: mongooseTypes.ObjectId[] = [];
    members.forEach((p: any) => {
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
  }
);
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

      const reconciledIds = await PROJECT_MODEL.validateTags(tags);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (
          !projectDocument.tags.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          projectDocument.tags.push(p as unknown as databaseTypes.ITag);
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
  }
);

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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        projectDocument.tags = updatedTags as unknown as databaseTypes.ITag[];
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
);

SCHEMA.static(
  'validateTags',
  async (
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const tagsIds: mongooseTypes.ObjectId[] = [];
    tags.forEach((p: any) => {
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

      const reconciledIds = await PROJECT_MODEL.validateStates(states);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (
          !projectDocument.states.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          projectDocument.states.push(p as unknown as databaseTypes.IState);
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
);

SCHEMA.static(
  'validateStates',
  async (
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const statesIds: mongooseTypes.ObjectId[] = [];
    states.forEach((p: any) => {
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
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['project'];

const PROJECT_MODEL = model<IProjectDocument, IProjectStaticMethods>(
  'project',
  SCHEMA
);

export {PROJECT_MODEL as ProjectModel};
