import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  IProjectMethods,
  IProjectStaticMethods,
  IProjectDocument,
} from '../interfaces';
import {error} from '@glyphx/core';
import {UserModel} from './user';
import {OrganizationModel} from './organization';
import {fileStatsSchema} from '../schemas';

const schema = new Schema<
  IProjectDocument,
  IProjectStaticMethods,
  IProjectMethods
>({
  //TODO: make sure that our defaults for dates are set to functions and not
  //just calling new Date()
  createdAt: {type: Date, required: true, default: () => new Date()},
  updatedAt: {type: Date, required: true, default: () => new Date()},
  name: {type: String, required: true},
  description: {type: String, required: false},
  sdtPath: {type: String, required: false},
  organization: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'organization',
  },
  slug: {type: String, required: false},
  isTemplate: {type: Boolean, required: true, default: false},
  type: {type: Schema.Types.ObjectId, required: true, ref: 'projecttype'},
  owner: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  state: {type: Schema.Types.ObjectId, required: false, ref: 'state'},
  files: {type: [fileStatsSchema], required: true, default: []},
});

schema.static(
  'projectIdExists',
  async (projectId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await ProjectModel.findById(projectId, ['_id']);
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

schema.static(
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

    if (project.organization)
      tasks.push(
        idValidator(
          project.organization._id as mongooseTypes.ObjectId,
          'Organization',
          OrganizationModel.organizationIdExists
        )
      );

    //TODO: renable this once project types are built;
    // if( project.type )
    // tasks.push( idValidator( project.type._id as mongooseTypes.ObjectId, 'ProjectType', ProjectTypeModel.projectTypeIdExists));

    //TODO: renable once we have built the state model.
    // if( project.state )
    // tasks.push(idvalidator(project.state._id, 'State', StateModel.stateIdExists));

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

schema.static(
  'updateProjectWithFilter',
  async (
    filter: Record<string, unknown>,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<void> => {
    try {
      await ProjectModel.validateUpdateObject(project);
      const updateDate = new Date();
      const transformedObject: Partial<IProjectDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in project) {
        const value = (project as Record<string, any>)[key];
        if (key === 'organization')
          transformedObject.organization = value._id as mongooseTypes.ObjectId;
        else if (key === 'type')
          transformedObject.type = value._id as mongooseTypes.ObjectId;
        else if (key === 'owner')
          transformedObject.owner = value._id as mongooseTypes.ObjectId;
        else if (key === 'state')
          transformedObject.state = value._id as mongooseTypes.ObjectId;
        else transformedObject[key] = value;
      }

      const updateResult = await ProjectModel.updateOne(
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

schema.static(
  'updateProjectById',
  async (
    projectId: mongooseTypes.ObjectId,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<databaseTypes.IProject> => {
    await ProjectModel.updateProjectWithFilter({_id: projectId}, project);
    return await ProjectModel.getProjectById(projectId);
  }
);

schema.static(
  'validateType',
  async (
    input: databaseTypes.IProjectType | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    //TODO: Need to blow this out once we have all of the models built.
    throw 'Not Implimented';
  }
);

schema.static(
  'validateOrganization',
  async (
    input: databaseTypes.IOrganization | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    //TODO: Need to blow this out once we have all of the models built.
    throw 'Not Implimented';
  }
);

schema.static(
  'validateOwner',
  async (
    input: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    //TODO: Need to blow this out once we have all of the models built.
    throw 'Not Implimented';
  }
);

schema.static(
  'validateState',
  async (
    input: databaseTypes.IState | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId | null> => {
    //TODO: Need to blow this out once we have all of the models built.
    throw 'Not Implimented';
  }
);

schema.static(
  'createProject',
  async (
    input: Omit<databaseTypes.IProject, '_id'>
  ): Promise<databaseTypes.IProject> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;
    try {
      const [organization, type, owner, state] = await Promise.all([
        ProjectModel.validateOrganization(input.organization),
        ProjectModel.validateType(input.type),
        ProjectModel.validateOwner(input.owner),
        ProjectModel.validateState(input.state as databaseTypes.IState),
      ]);
      const createDate = new Date();

      let resolvedInput: IProjectDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        name: input.name,
        description: input.description,
        sdtPath: input.sdtPath,
        organization: organization,
        slug: input.slug,
        isTemplate: input.isTemplate,
        type: type,
        owner: owner,
        state: state ?? undefined,
        files: input.files && [],
      };
      try {
        await ProjectModel.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IProjectDocument',
          resolvedInput,
          err
        );
      }
      const projectDocument = (
        await ProjectModel.create([resolvedInput], {validateBeforeSave: false})
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
    if (id) return await ProjectModel.getProjectById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the project may not have been created.  I have no other information to provide.'
      );
  }
);

schema.static(
  'getProjectById',
  async (projectId: mongooseTypes.ObjectId) => {}
);

schema.static(
  'deleteProjectById',
  async (projectId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await ProjectModel.deleteOne({_id: projectId});
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
          `An unexpected error occurred while deleteing the project from the database. The project may still exist.  See the inner error for additional information`,
          'mongoDb',
          'delete project',
          {_id: projectId},
          err
        );
    }
  }
);

const ProjectModel = model<IProjectDocument, IProjectStaticMethods>(
  'project',
  schema
);

export {ProjectModel};
