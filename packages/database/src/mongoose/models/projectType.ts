import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  IProjectTypeMethods,
  IProjectTypeStaticMethods,
  IProjectTypeDocument,
} from '../interfaces';
import {error} from '@glyphx/core';
import {ProjectModel} from './project';
import {projectTypeShapeValidator} from '../validators';

const schema = new Schema<
  IProjectTypeDocument,
  IProjectTypeStaticMethods,
  IProjectTypeMethods
>({
  createdAt: {type: Date, required: true, default: () => new Date()},
  updatedAt: {type: Date, required: true, default: () => new Date()},
  name: {type: String, required: true},
  projects: {type: [mongooseTypes.ObjectId], required: true, default: []},
  shape: {
    type: Schema.Types.Mixed,
    required: true,
    validate: projectTypeShapeValidator,
  },
});

schema.static(
  'projectTypeIdExists',
  async (projectTypeId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await ProjectTypeModel.findById(projectTypeId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the projectType.  See the inner error for additional information',
        'mongoDb',
        'projectTypeIdExists',
        {_id: projectTypeId},
        err
      );
    }
    return retval;
  }
);

schema.static(
  'getProjectTypeById',
  async (projectTypeId: mongooseTypes.ObjectId) => {}
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
  'createProjectType',
  async (
    input: Omit<databaseTypes.IProjectType, '_id'>
  ): Promise<databaseTypes.IProjectType> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;
    try {
      const projects = await ProjectTypeModel.validateProjects(input.projects);
      const createDate = new Date();

      let resolvedInput: IProjectTypeDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        name: input.name,
        shape: input.shape,
        projects: projects,
      };
      try {
        await ProjectTypeModel.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IProjectTypeDocument',
          resolvedInput,
          err
        );
      }
      const projectTypeDocument = (
        await ProjectTypeModel.create([resolvedInput], {
          validateBeforeSave: false,
        })
      )[0];
      id = projectTypeDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the projectType.  See the inner error for additional details',
          'mongoDb',
          'add projectType',
          {},
          err
        );
      }
    }
    if (id) return await ProjectTypeModel.getProjectTypeById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the project type may not have been created.  I have no other information to provide.'
      );
  }
);

schema.static(
  'validateUpdateObject',
  (projectType: Omit<Partial<databaseTypes.IProjectType>, '_id'>): void => {
    if (projectType.createdAt) {
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be included in the update set',
        {createdAt: projectType.createdAt}
      );
    }
    if (projectType.updatedAt) {
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be included in the update set',
        {updatedAt: projectType.updatedAt}
      );
    }
    if ((projectType as Record<string, unknown>)['_id']) {
      throw new error.InvalidOperationError(
        'The _id on a projectType is immutable and cannot be changed',
        {_id: (projectType as Record<string, unknown>)['_id']}
      );
    }

    if (projectType.projects?.length) {
      throw new error.InvalidOperationError(
        'Projects cannot be updated directly for a projectType.  Please use the add/remove project functions',
        {projects: projectType.projects}
      );
    }

    if (
      projectType.shape &&
      !projectTypeShapeValidator(projectType.shape as any)
    ) {
      throw new error.InvalidArgumentError(
        'The value of projectType.shape does not appear to be correctly formatted',
        'projectType.shape',
        projectType.shape
      );
    }
  }
);

schema.static(
  'updateProjectTypeWithFilter',
  async (
    filter: Record<string, unknown>,
    projectType: Omit<Partial<databaseTypes.IProjectType>, '_id'>
  ): Promise<void> => {
    try {
      ProjectTypeModel.validateUpdateObject(projectType);
      const updateDate = new Date();
      projectType.updatedAt = updateDate;
      //someone could sneak in an empty array and we do not want to accidently
      //overwrite projects that already exist.
      delete projectType.projects;
      const updateResult = await ProjectTypeModel.updateOne(
        filter,
        projectType
      );

      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No projectType document with filter: ${filter} was found`,
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
          `An unexpected error occurred while updating the projectType with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update projectType',
          {filter: filter, projectType: projectType},
          err
        );
    }
  }
);

schema.static(
  'updateProjectTypeById',
  async (
    projectTypeId: mongooseTypes.ObjectId,
    projectType: Omit<Partial<databaseTypes.IProjectType>, '_id'>
  ): Promise<databaseTypes.IProjectType> => {
    await ProjectTypeModel.updateProjectTypeWithFilter(
      {_id: projectType},
      projectType
    );
    return await ProjectTypeModel.getProjectTypeById(projectTypeId);
  }
);

schema.static(
  'deleteProjectTypeById',
  async (projectTypeId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await ProjectTypeModel.deleteOne({_id: projectTypeId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A project type with an _id: ${projectTypeId} was not found in the database`,
          '_id',
          projectTypeId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while deleteing the projectType from the database. The projectType may still exist.  See the inner error for additional information`,
          'mongoDb',
          'delete projectType',
          {_id: projectTypeId},
          err
        );
    }
  }
);

const ProjectTypeModel = model<IProjectTypeDocument, IProjectTypeStaticMethods>(
  'projecttype',
  schema
);

export {ProjectTypeModel};
