import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  IProjectMethods,
  IProjectStaticMethods,
  IProjectDocument,
  IProjectCreateInput,
} from '../interfaces';
import {error} from '@glyphx/core';
import {UserModel} from './user';
import {WorkspaceModel} from './workspace';
import {ProjectTypeModel} from './projectType';
import {fileStatsSchema} from '../schemas';
import {embeddedStateSchema} from '../schemas/embeddedState';

const SCHEMA = new Schema<
  IProjectDocument,
  IProjectStaticMethods,
  IProjectMethods
>({
  //TODO: make sure that our defaults for dates are set to functions and not
  //just calling new Date()
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
  name: {type: String, required: true},
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
  isTemplate: {type: Boolean, required: true, default: false},
  type: {type: Schema.Types.ObjectId, required: false, ref: 'projecttype'},
  owner: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  state: {type: embeddedStateSchema, required: false, default: {}},
  files: {type: [fileStatsSchema], required: true, default: []},
  viewName: {type: String, required: true},
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

    if (project.owner)
      tasks.push(
        idValidator(
          project.owner._id as mongooseTypes.ObjectId,
          'Owner',
          UserModel.userIdExists
        )
      );

    if (project.workspace)
      tasks.push(
        idValidator(
          project.workspace._id as mongooseTypes.ObjectId,
          'Workspace',
          WorkspaceModel.workspaceIdExists
        )
      );

    if (project.type)
      tasks.push(
        idValidator(
          project.type._id as mongooseTypes.ObjectId,
          'ProjectType',
          ProjectTypeModel.projectTypeIdExists
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
        else if (key === 'type')
          transformedObject.type =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        else if (key === 'owner')
          transformedObject.owner =
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
          `No project document with filter: ${filter} was found`,
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

SCHEMA.static(
  'validateType',
  async (
    input: databaseTypes.IProjectType | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const projectTypeId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await ProjectTypeModel.projectTypeIdExists(projectTypeId))) {
      throw new error.InvalidArgumentError(
        `The project type : ${projectTypeId} does not exist`,
        'projectTypeId',
        projectTypeId
      );
    }
    return projectTypeId;
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
        `The workspace : ${workspaceId} does not exist`,
        'workspaceId',
        workspaceId
      );
    }
    return workspaceId;
  }
);

SCHEMA.static(
  'validateOwner',
  async (
    input: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const userId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await UserModel.userIdExists(userId))) {
      throw new error.InvalidArgumentError(
        `The user : ${userId} does not exist`,
        'userId',
        userId
      );
    }
    return userId;
  }
);

SCHEMA.static(
  'createProject',
  async (input: IProjectCreateInput): Promise<databaseTypes.IProject> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [workspace, owner] = await Promise.all([
        PROJECT_MODEL.validateWorkspace(input.workspace),
        PROJECT_MODEL.validateOwner(input.owner),
      ]);

      const createDate = new Date();

      const resolvedInput: IProjectDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        name: input.name,
        description: input.description ?? ' ',
        sdtPath: input.sdtPath,
        currentVersion: input.currentVersion ?? 0,
        state: input.state,
        workspace: workspace,
        slug: input.slug,
        isTemplate: input.isTemplate,
        owner: owner,
        files: input.files ?? [],
        viewName: input.viewName ?? ' ',
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
  }
);

SCHEMA.static('getProjectById', async (projectId: mongooseTypes.ObjectId) => {
  try {
    const projectDocument = (await PROJECT_MODEL.findById(projectId)
      .populate('owner')
      .populate('workspace')
      .populate('type')
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
    delete (projectDocument as any).owner?.['__v'];
    delete (projectDocument as any).type?.['__v'];
    delete (projectDocument as any).workspace?.['__v'];

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
        .populate('owner')
        .populate('type')
        .lean()) as databaseTypes.IProject[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      projectDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        delete (doc as any)?.workspace?.__v;
        delete (doc as any)?.owner?.__v;
        delete (doc as any)?.type?.__v;
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

const PROJECT_MODEL = model<IProjectDocument, IProjectStaticMethods>(
  'project',
  SCHEMA
);

export {PROJECT_MODEL as ProjectModel};
