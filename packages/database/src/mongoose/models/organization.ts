import {database as databaseTypes} from '@glyphx/types';
import {
  Types as mongooseTypes,
  Model,
  Schema,
  HydratedDocument,
  model,
} from 'mongoose';
import {
  IOrganizationMethods,
  IOrganizationStaticMethods,
  IOrganizationDocument,
} from '../interfaces';
import {error} from '@glyphx/core';
import {UserModel} from './user';

const schema = new Schema<
  IOrganizationDocument,
  IOrganizationStaticMethods,
  IOrganizationMethods
>({
  createdAt: {type: Date, required: true, default: new Date()},
  updatedAt: {type: Date, required: true, default: new Date()},
  name: {type: String, required: true},
  description: {type: String, required: false},
  owner: {type: Schema.Types.ObjectId, required: true},
  members: {type: [Schema.Types.ObjectId], required: true, default: []},
  projects: {type: [Schema.Types.ObjectId], required: true, default: []},
});

schema.static(
  'organizationIdExists',
  async (organizationId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await OrganizationModel.findById(organizationId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the organization.  See the inner error for additional information',
        'mongoDb',
        'organizationIdExists',
        {_id: organizationId},
        err
      );
    }
    return retval;
  }
);

schema.static(
  'validateProjects',
  async (
    projects: databaseTypes.IProject[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    let retval: mongooseTypes.ObjectId[] = [];
    //TODO: blow this out once we have a projects model.
    return retval;
  }
);
schema.static(
  'validateMembers',
  async (
    members: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    let retval: mongooseTypes.ObjectId[] = [];
    //TODO: blow this out once we have a projects model.
    return retval;
  }
);
schema.static(
  'createOrganization',
  async (
    input: Omit<databaseTypes.IOrganization, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<databaseTypes.IOrganization> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;
    try {
      const users = Array.from(input.members) as (
        | databaseTypes.IUser
        | mongooseTypes.ObjectId
      )[];
      users.unshift(input.owner);
      const [members, projects] = await Promise.all([
        OrganizationModel.validateMembers(users),
        OrganizationModel.validateProjects(input.projects),
      ]);
      const createDate = new Date();

      const owner = members.shift() as mongooseTypes.ObjectId;
      let resolvedInput: IOrganizationDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        name: input.name,
        description: input.description,
        owner: owner,
        members: members,
        projects: projects,
      };
      try {
        await OrganizationModel.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IOrganizationDocument',
          resolvedInput,
          err
        );
      }

      const organizationDocument = (
        await OrganizationModel.create([resolvedInput], {
          validateBeforeSave: false,
        })
      )[0];
      id = organizationDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while add the user.  See the inner error for additional details',
          'mongoDb',
          'add User',
          {},
          err
        );
      }
    }

    if (id) return await OrganizationModel.getOrganizationById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the organization may not have been created.  I have no other information to provide.'
      );
  }
);

schema.static(
  'validateUpdateObject',
  async (input: Partial<databaseTypes.IOrganization>): Promise<boolean> => {
    if (input.projects?.length)
      throw new error.InvalidOperationError(
        "This method cannot be used to alter the organizations' projects.  Use the add/remove project functions to complete this operation",
        {projects: input.projects}
      );

    if (input.members?.length)
      throw new error.InvalidOperationError(
        "This method cannot be used to alter the users' members.  Use the add/remove members functions to complete this operation",
        {members: input.members}
      );
    if (input._id)
      throw new error.InvalidOperationError(
        "An Organization's _id is imutable and cannot be changed",
        {
          _id: input._id,
        }
      );
    if (input.createdAt)
      throw new error.InvalidOperationError(
        "An organization's createdAt date is immutable and cannot be changed",
        {createdAt: input.createdAt}
      );
    if (input.updatedAt)
      throw new error.InvalidOperationError(
        "An organization's updatedAt date is set internally and cannot be changed externally",
        {updatedAt: input.updatedAt}
      );

    if (input.owner?._id && !(await UserModel.userIdExists(input.owner._id)))
      throw new error.InvalidOperationError(
        'The owner does not appear to exist in the database',
        {ownerId: input.owner._id}
      );

    return true;
  }
);

schema.static(
  'updateOrganizationByFilter',
  async (
    filter: Record<string, unknown>,
    input: Partial<databaseTypes.IOrganization>
  ): Promise<void> => {
    try {
      await OrganizationModel.validateUpdateObject(input);
      const transformedDocument: Partial<databaseTypes.IOrganization> &
        Record<string, any> = {};
      const updateDate = new Date();
      for (const key in input) {
        const value = (input as Record<string, any>)[key];
        if (key === 'owner') {
          transformedDocument.owner = value._id;
        } else {
          transformedDocument[key] = value;
        }
      }
      transformedDocument.updatedAt = updateDate;
      const updateResult = await OrganizationModel.updateOne(
        filter,
        transformedDocument
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No organization document with filter: ${filter} was found`,
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
          `An unexpected error occurred while updating the organization with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update user',
          {filter: filter, organization: input},
          err
        );
    }
  }
);

schema.static(
  'updateOrganizationById',
  async (
    id: mongooseTypes.ObjectId,
    input: Partial<databaseTypes.IOrganization>
  ): Promise<databaseTypes.IOrganization> => {
    await OrganizationModel.updateOrganizationByFilter({_id: id}, input);
    return await OrganizationModel.getOrganizationById(id);
  }
);

schema.static(
  'getOrganizationById',
  async (organizationId: mongooseTypes.ObjectId) => {}
);

schema.static(
  'deleteOrganizationById',
  async (organizationId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await OrganizationModel.deleteOne({_id: organizationId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `An organization with a _id: ${organizationId} was not found in the database`,
          '_id',
          organizationId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while deleteing the organization from the database. The organization may still exist.  See the inner error for additional information`,
          'mongoDb',
          'delete organization',
          {_id: organizationId},
          err
        );
    }
  }
);
const OrganizationModel = model<
  IOrganizationDocument,
  IOrganizationStaticMethods
>('organization', schema);

export {OrganizationModel};
