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
import {ProjectModel} from './project';

const schema = new Schema<
  IOrganizationDocument,
  IOrganizationStaticMethods,
  IOrganizationMethods
>({
  createdAt: {type: Date, required: true, default: new Date()},
  updatedAt: {type: Date, required: true, default: new Date()},
  name: {type: String, required: true},
  description: {type: String, required: false},
  owner: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  members: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'user',
  },
  projects: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'project',
  },
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
  'allOrganizationIdsExist',
  async (organizationIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    const retval = true;
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await OrganizationModel.find(
        {_id: {$in: organizationIds}},
        ['_id']
      )) as {_id: mongooseTypes.ObjectId}[];

      organizationIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more organizationIds cannot be found in the database.',
          'organization._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the organizationIds.  See the inner error for additional information',
          'mongoDb',
          'allOrganizationIdsExists',
          {organizationIds: organizationIds},
          err
        );
      }
    }
    return true;
  }
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
  'validateMembers',
  async (
    members: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    let retval: mongooseTypes.ObjectId[] = [];
    const userIds: mongooseTypes.ObjectId[] = [];
    members.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) userIds.push(p);
      else userIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await UserModel.allUserIdsExist(userIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more member ids do not exisit in the database.  See the inner error for additional information',
          'members',
          members,
          err
        );
      else throw err;
    }

    return userIds;
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
  async (
    organizationId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IOrganization> => {
    try {
      const organizationDocument = (await OrganizationModel.findById(
        organizationId
      )
        .populate('owner')
        .populate('members')
        .populate('projects')
        .lean()) as databaseTypes.IOrganization;
      if (!organizationDocument)
        throw new error.DataNotFoundError(
          `Could not find an Organization with the _id: ${organizationId}`,
          'organization._id',
          organizationId
        );
      delete (organizationDocument as any)['__v'];
      delete (organizationDocument as any).owner['__v'];
      organizationDocument.members.forEach(m => delete (m as any)['__v']);
      organizationDocument.projects.forEach(p => delete (p as any)['__v']);

      return organizationDocument;
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while retreiving the organization from the database.  See the inner error for additional information',
          'mongoDb',
          'getOrganizationById',
          err
        );
    }
  }
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

schema.static(
  'addProjects',
  async (
    organizationId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IOrganization> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one projectId',
          'projects',
          projects
        );
      const organizationDocument = await OrganizationModel.findById(
        organizationId
      );
      if (!organizationDocument)
        throw new error.DataNotFoundError(
          `A Organization Document with _id : ${organizationId} cannot be found`,
          'organization._id',
          organizationId
        );

      const reconciledIds = await OrganizationModel.validateProjects(projects);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !organizationDocument.projects.find(
            progId => progId.toString() === p.toString()
          )
        ) {
          dirty = true;
          organizationDocument.projects.push(
            p as unknown as databaseTypes.IProject
          );
        }
      });

      if (dirty) await organizationDocument.save();

      return await OrganizationModel.getOrganizationById(organizationId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while adding the projects. See the innner error for additional information',
          'mongoDb',
          'organization.addProjects',
          err
        );
      }
    }
  }
);

schema.static(
  'removeProjects',
  async (
    organizationId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IOrganization> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one projectId',
          'projects',
          projects
        );
      const organizationDocument = await OrganizationModel.findById(
        organizationId
      );
      if (!organizationDocument)
        throw new error.DataNotFoundError(
          `An Organization Document with _id : ${organizationId} cannot be found`,
          'organization._id',
          organizationId
        );

      const reconciledIds = projects.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedProjects = organizationDocument.projects.filter(p => {
        let retval = true;
        if (
          reconciledIds.find(
            r =>
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
        organizationDocument.projects =
          updatedProjects as unknown as databaseTypes.IProject[];
        await organizationDocument.save();
      }

      return await OrganizationModel.getOrganizationById(organizationId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while removing the projects. See the innner error for additional information',
          'mongoDb',
          'organization.removeProjects',
          err
        );
      }
    }
  }
);

schema.static(
  'addMembers',
  async (
    organizationId: mongooseTypes.ObjectId,
    members: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IOrganization> => {
    try {
      if (!members.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one userId',
          'members',
          members
        );
      const organizationDocument = await OrganizationModel.findById(
        organizationId
      );
      if (!organizationDocument)
        throw new error.DataNotFoundError(
          `A Organization Document with _id : ${organizationId} cannot be found`,
          'organization._id',
          organizationId
        );

      const reconciledIds = await OrganizationModel.validateMembers(members);
      let dirty = false;
      reconciledIds.forEach(m => {
        if (
          !organizationDocument.members.find(
            userId => userId.toString() === m.toString()
          )
        ) {
          dirty = true;
          organizationDocument.members.push(
            m as unknown as databaseTypes.IUser
          );
        }
      });

      if (dirty) await organizationDocument.save();

      return await OrganizationModel.getOrganizationById(organizationId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while adding the members. See the innner error for additional information',
          'mongoDb',
          'organization.addMembers',
          err
        );
      }
    }
  }
);

schema.static(
  'removeMembers',
  async (
    organizationId: mongooseTypes.ObjectId,
    members: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IOrganization> => {
    try {
      if (!members.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one userId',
          'members',
          members
        );
      const organizationDocument = await OrganizationModel.findById(
        organizationId
      );
      if (!organizationDocument)
        throw new error.DataNotFoundError(
          `An Organization Document with _id : ${organizationId} cannot be found`,
          'organization._id',
          organizationId
        );

      const reconciledIds = members.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedMembers = organizationDocument.members.filter(m => {
        let retval = true;
        if (
          reconciledIds.find(
            r =>
              r.toString() ===
              (m as unknown as mongooseTypes.ObjectId).toString()
          )
        ) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        organizationDocument.members =
          updatedMembers as unknown as databaseTypes.IUser[];
        await organizationDocument.save();
      }

      return await OrganizationModel.getOrganizationById(organizationId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while removing the members. See the innner error for additional information',
          'mongoDb',
          'organization.removeMembers',
          err
        );
      }
    }
  }
);
const OrganizationModel = model<
  IOrganizationDocument,
  IOrganizationStaticMethods
>('organization', schema);

export {OrganizationModel};
