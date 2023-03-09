import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  IWorkspaceMethods,
  IWorkspaceStaticMethods,
  IWorkspaceDocument,
} from '../interfaces';
import {error} from '@glyphx/core';
import {UserModel} from './user';
import {MemberModel} from './member';
import {ProjectModel} from './project';

const SCHEMA = new Schema<
  IWorkspaceDocument,
  IWorkspaceStaticMethods,
  IWorkspaceMethods
>({
  workspaceCode: {type: String, required: true},
  inviteCode: {type: String, required: true},
  name: {type: String, required: true},
  slug: {type: String, required: true},
  createdAt: {type: Date, required: true, default: new Date()},
  updatedAt: {type: Date, required: true, default: new Date()},
  deletedAt: {type: Date, required: false},
  description: {type: String, required: false},
  creator: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  members: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'member',
  },
  projects: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'project',
  },
});

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
          {workspaceIds: workspaceIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'validateProjects',
  async (
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
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

SCHEMA.static(
  'validateMembers',
  async (
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const memberIds: mongooseTypes.ObjectId[] = [];
    members.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) memberIds.push(p);
      else memberIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await MemberModel.allMemberIdsExist(memberIds);
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

    return memberIds;
  }
);

SCHEMA.static(
  'validateUser',
  async (
    user: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const userId: mongooseTypes.ObjectId =
      user instanceof mongooseTypes.ObjectId
        ? user
        : (user._id as mongooseTypes.ObjectId);

    console.log({user});
    const idExists = await UserModel.userIdExists(userId);
    if (idExists) return userId;
    else
      throw new error.DataValidationError(
        `the user id : ${userId} does not exist in the database.`,
        'user',
        userId
      );
  }
);
SCHEMA.static(
  'createWorkspace',
  async (
    input: Omit<databaseTypes.IWorkspace, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<databaseTypes.IWorkspace> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;
    try {
      const users = Array.from(input.members) as (
        | databaseTypes.IMember
        | mongooseTypes.ObjectId
      )[];

      const [projects, creator] = await Promise.all([
        WORKSPACE_MODEL.validateProjects(input.projects),
        WORKSPACE_MODEL.validateUser(input.creator),
      ]);
      const createDate = new Date();

      const resolvedInput: IWorkspaceDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        workspaceCode: input.workspaceCode,
        inviteCode: input.inviteCode,
        name: input.name,
        slug: input.slug,
        description: input.description,
        creator: creator,
        members: [creator],
        projects: projects,
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
        await WORKSPACE_MODEL.create([resolvedInput], {
          validateBeforeSave: false,
        })
      )[0];
      id = workspaceDocument._id;
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

    if (id) return await WORKSPACE_MODEL.getWorkspaceById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the workspace may not have been created.  I have no other information to provide.'
      );
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (input: Partial<databaseTypes.IWorkspace>): Promise<boolean> => {
    if (input.projects?.length)
      throw new error.InvalidOperationError(
        "This method cannot be used to alter the workspaces' projects.  Use the add/remove project functions to complete this operation",
        {projects: input.projects}
      );

    if (input.members?.length)
      throw new error.InvalidOperationError(
        "This method cannot be used to alter the users' members.  Use the add/remove members functions to complete this operation",
        {members: input.members}
      );
    if (input._id)
      throw new error.InvalidOperationError(
        "An Workspace's _id is imutable and cannot be changed",
        {
          _id: input._id,
        }
      );
    if (input.createdAt)
      throw new error.InvalidOperationError(
        "An workspace's createdAt date is immutable and cannot be changed",
        {createdAt: input.createdAt}
      );
    if (input.updatedAt)
      throw new error.InvalidOperationError(
        "An workspace's updatedAt date is set internally and cannot be changed externally",
        {updatedAt: input.updatedAt}
      );

    if (
      input.creator?._id &&
      !(await UserModel.userIdExists(input.creator._id))
    )
      throw new error.InvalidOperationError(
        'The creator does not appear to exist in the database',
        {creatorId: input.creator._id}
      );

    return true;
  }
);

SCHEMA.static(
  'updateWorkspaceByFilter',
  async (
    filter: Record<string, unknown>,
    input: Partial<databaseTypes.IWorkspace>
  ): Promise<void> => {
    try {
      await WORKSPACE_MODEL.validateUpdateObject(input);
      const transformedDocument: Partial<databaseTypes.IWorkspace> &
        Record<string, any> = {};
      const updateDate = new Date();
      for (const key in input) {
        const value = (input as Record<string, any>)[key];
        if (key === 'creator') {
          transformedDocument.creator = value._id;
        } else {
          transformedDocument[key] = value;
        }
      }
      transformedDocument.updatedAt = updateDate;
      const updateResult = await WORKSPACE_MODEL.updateOne(
        filter,
        transformedDocument
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No workspace document with filter: ${filter} was found`,
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
          `An unexpected error occurred while updating the workspace with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update user',
          {filter: filter, workspace: input},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateWorkspaceById',
  async (
    id: mongooseTypes.ObjectId,
    input: Partial<databaseTypes.IWorkspace>
  ): Promise<databaseTypes.IWorkspace> => {
    await WORKSPACE_MODEL.updateWorkspaceByFilter({_id: id}, input);
    return await WORKSPACE_MODEL.getWorkspaceById(id);
  }
);

SCHEMA.static(
  'getWorkspaceById',
  async (
    workspaceId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IWorkspace> => {
    try {
      const workspaceDocument = (await WORKSPACE_MODEL.findById(workspaceId)
        .populate('creator')
        .populate('members')
        .populate('projects')
        .lean()) as databaseTypes.IWorkspace;
      if (!workspaceDocument)
        throw new error.DataNotFoundError(
          `Could not find an Workspace with the _id: ${workspaceId}`,
          'workspace._id',
          workspaceId
        );
      delete (workspaceDocument as any)['__v'];
      delete (workspaceDocument as any).creator['__v'];
      workspaceDocument.members.forEach((m: any) => delete (m as any)['__v']);
      workspaceDocument.projects.forEach((p: any) => delete (p as any)['__v']);

      return workspaceDocument;
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while retreiving the workspace from the database.  See the inner error for additional information',
          'mongoDb',
          'getWorkspaceById',
          err
        );
    }
  }
);

SCHEMA.static(
  'queryWorkspaces',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await WORKSPACE_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find workspaces with the filter: ${filter}`,
          'workspace_filter',
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
        .populate('creator')
        .populate('members')
        .populate('projects')
        .lean()) as databaseTypes.IWorkspace[];
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      workspaceDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        delete (doc as any).creator['__v'];
        (doc as any).members.map((mem: any) => delete mem['__v']);
        (doc as any).projects.map((proj: any) => delete proj['__v']);
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
          'An unexpected error occurred while getting the workspace.  See the inner error for additional information',
          'mongoDb',
          'queryWorkspaces',
          err
        );
    }
  }
);

SCHEMA.static(
  'deleteWorkspaceById',
  async (workspaceId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await WORKSPACE_MODEL.deleteOne({_id: workspaceId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `An workspace with a _id: ${workspaceId} was not found in the database`,
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
  'addProjects',
  async (
    workspaceId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one projectId',
          'projects',
          projects
        );
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument)
        throw new error.DataNotFoundError(
          `A Workspace Document with _id : ${workspaceId} cannot be found`,
          'workspace._id',
          workspaceId
        );

      const reconciledIds = await WORKSPACE_MODEL.validateProjects(projects);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !workspaceDocument.projects.find(
            (progId: any) => progId.toString() === p.toString()
          )
        ) {
          dirty = true;
          workspaceDocument.projects.push(
            p as unknown as databaseTypes.IProject
          );
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
          'An unexpected error occurrred while adding the projects. See the innner error for additional information',
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
  async (
    workspaceId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one projectId',
          'projects',
          projects
        );
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument)
        throw new error.DataNotFoundError(
          `An Workspace Document with _id : ${workspaceId} cannot be found`,
          'workspace._id',
          workspaceId
        );

      const reconciledIds = projects.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedProjects = workspaceDocument.projects.filter(p => {
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
        workspaceDocument.projects =
          updatedProjects as unknown as databaseTypes.IProject[];
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
          'An unexpected error occurrred while removing the projects. See the innner error for additional information',
          'mongoDb',
          'workspace.removeProjects',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'addMembers',
  async (
    workspaceId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!members.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one workspaceId',
          'members',
          members
        );
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument)
        throw new error.DataNotFoundError(
          `A Workspace Document with _id : ${workspaceId} cannot be found`,
          'workspace._id',
          workspaceId
        );

      const reconciledIds = await WORKSPACE_MODEL.validateMembers(members);
      let dirty = false;
      reconciledIds.forEach(m => {
        if (
          !workspaceDocument.members.find(
            (memberId: any) => memberId.toString() === m.toString()
          )
        ) {
          dirty = true;
          workspaceDocument.members.push(m as unknown as databaseTypes.IMember);
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
          'An unexpected error occurrred while adding the members. See the innner error for additional information',
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
  async (
    workspaceId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> => {
    try {
      if (!members.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one workspaceId',
          'members',
          members
        );
      const workspaceDocument = await WORKSPACE_MODEL.findById(workspaceId);
      if (!workspaceDocument)
        throw new error.DataNotFoundError(
          `An Workspace Document with _id : ${workspaceId} cannot be found`,
          'workspace._id',
          workspaceId
        );

      const reconciledIds = members.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedMembers = workspaceDocument.members.filter(m => {
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
        workspaceDocument.members =
          updatedMembers as unknown as databaseTypes.IMember[];
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
          'An unexpected error occurrred while removing the members. See the innner error for additional information',
          'mongoDb',
          'workspace.removeMembers',
          err
        );
      }
    }
  }
);
const WORKSPACE_MODEL = model<IWorkspaceDocument, IWorkspaceStaticMethods>(
  'workspace',
  SCHEMA
);

export {WORKSPACE_MODEL as WorkspaceModel};
