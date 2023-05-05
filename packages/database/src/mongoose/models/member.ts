import {database as databaseTypes, IQueryResult} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {
  IMemberMethods,
  IMemberStaticMethods,
  IMemberDocument,
  IMemberCreateInput,
} from '../interfaces';
import {error} from '@glyphx/core';
import {UserModel} from './user';
import {ProjectModel} from './project';
import {WorkspaceModel} from './workspace';

const SCHEMA = new Schema<
  IMemberDocument,
  IMemberStaticMethods,
  IMemberMethods
>({
  email: {type: String, required: true},
  inviter: {type: String, required: true},
  invitedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  type: {
    type: String,
    required: true,
    enum: databaseTypes.constants.MEMBERSHIP_TYPE,
  },
  joinedAt: {type: Date, required: false},
  deletedAt: {type: Date, required: false},
  updatedAt: {type: Date, required: false},
  createdAt: {type: Date, required: false},
  status: {
    type: String,
    required: true,
    enum: databaseTypes.constants.INVITATION_STATUS,
    default: databaseTypes.constants.INVITATION_STATUS.PENDING,
  },
  teamRole: {
    type: String,
    required: true,
    enum: databaseTypes.constants.ROLE,
    default: databaseTypes.constants.ROLE.MEMBER,
  },
  projectRole: {
    type: String,
    required: false,
    enum: databaseTypes.constants.PROJECT_ROLE,
  },
  member: {type: Schema.Types.ObjectId, required: false, ref: 'user'},
  invitedBy: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  workspace: {type: Schema.Types.ObjectId, required: true, ref: 'workspace'},
  project: {type: Schema.Types.ObjectId, required: false, ref: 'project'},
});

SCHEMA.static(
  'memberIdExists',
  async (memberId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await MEMBER_MODEL.findById(memberId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the member.  See the inner error for additional information',
        'mongoDb',
        'memberIdExists',
        {_id: memberId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'memberExists',
  async (
    memberEmail: string,
    type: databaseTypes.constants.MEMBERSHIP_TYPE,
    workspaceId: mongooseTypes.ObjectId,
    projectId?: mongooseTypes.ObjectId
  ): Promise<boolean> => {
    let retval = false;
    try {
      if (type === databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT) {
        const result = await MEMBER_MODEL.findOne({
          email: memberEmail,
          type: type,
          project: projectId,
        });

        if (result) retval = true;
      } else if (type === databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE) {
        const result = await MEMBER_MODEL.findOne({
          email: memberEmail,
          type: type,
          workspace: workspaceId,
        });

        if (result) retval = true;
      }
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the member.  See the inner error for additional information',
        'mongoDb',
        'memberExists',
        {email: memberEmail, type: type},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allMemberIdsExist',
  async (memberIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await MEMBER_MODEL.find({_id: {$in: memberIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      memberIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more memberIds cannot be found in the database.',
          'member._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the memberIds.  See the inner error for additional information',
          'mongoDb',
          'allMemberIdsExists',
          {memberIds: memberIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'getMemberById',
  async (memberId: mongooseTypes.ObjectId, hasProject?: boolean) => {
    try {
      let memberDocument;
      if (hasProject) {
        memberDocument = (await MEMBER_MODEL.findById(memberId)
          .populate('member')
          .populate('invitedBy')
          .populate('workspace')
          .populate('project')
          .lean()) as databaseTypes.IMember;
      } else {
        memberDocument = (await MEMBER_MODEL.findById(memberId)
          .populate('member')
          .populate('invitedBy')
          .populate('workspace')
          .lean()) as databaseTypes.IMember;
      }
      if (!memberDocument) {
        throw new error.DataNotFoundError(
          `Could not find a member with the _id: ${memberId}`,
          'member_id',
          memberId
        );
      }
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      delete (memberDocument as any)['__v'];
      delete (memberDocument as any).member['__v'];
      delete (memberDocument as any).invitedBy['__v'];
      delete (memberDocument as any).workspace['__v'];
      delete (memberDocument as any)?.project?.__v;

      return memberDocument;
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while getting the member.  See the inner error for additional information',
          'mongoDb',
          'getMemberById',
          err
        );
    }
  }
);

SCHEMA.static(
  'queryMembers',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await MEMBER_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find members with the filter: ${filter}`,
          'member_filter',
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

      const memberDocuments = (await MEMBER_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('member')
        .populate('invitedBy')
        .populate('workspace')
        .lean()) as databaseTypes.IMember[];
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      memberDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        delete (doc as any)?.member?.__v;
        delete (doc as any)?.invitedBy?.__v;
        delete (doc as any)?.workspace?.__v;
      });

      const retval: IQueryResult<databaseTypes.IMember> = {
        results: memberDocuments,
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
          'An unexpected error occurred while querying the members.  See the inner error for additional information',
          'mongoDb',
          'getAccountById',
          err
        );
    }
  }
);

SCHEMA.static(
  'validateProjectMember',
  async (
    member: databaseTypes.IUser | mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId,
    project: databaseTypes.IProject | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IUser> => {
    const userId =
      member instanceof mongooseTypes.ObjectId
        ? member
        : (member._id as mongooseTypes.ObjectId);
    if (!(await UserModel.userIdExists(userId))) {
      throw new error.InvalidArgumentError(
        `The user : ${userId} does not exist`,
        'userId',
        userId
      );
    }
    const projectId =
      project instanceof mongooseTypes.ObjectId
        ? project
        : (project._id as mongooseTypes.ObjectId);
    if (!(await ProjectModel.projectIdExists(projectId))) {
      throw new error.InvalidArgumentError(
        `The project : ${projectId} does not exist`,
        'projectId',
        projectId
      );
    }
    const workspaceId =
      workspace instanceof mongooseTypes.ObjectId
        ? workspace
        : (workspace._id as mongooseTypes.ObjectId);
    if (!(await WorkspaceModel.workspaceIdExists(workspaceId))) {
      throw new error.InvalidArgumentError(
        `The workspace : ${workspaceId} does not exist`,
        'workspaceId',
        workspaceId
      );
    }

    const user = await UserModel.getUserById(userId);

    const memberExists = await MEMBER_MODEL.memberExists(
      user?.email as string,
      databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
      workspaceId,
      projectId
    );

    if (memberExists)
      throw new error.InvalidArgumentError(
        `A member with email : ${
          (user as databaseTypes.IUser).email
        } already exists`,
        'member.email',
        (user as databaseTypes.IUser).email
      );
    return user;
  }
);

SCHEMA.static(
  'validateWorkspaceMember',
  async (
    member: databaseTypes.IUser | mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IUser> => {
    const userId =
      member instanceof mongooseTypes.ObjectId
        ? member
        : (member._id as mongooseTypes.ObjectId);
    if (!(await UserModel.userIdExists(userId))) {
      throw new error.InvalidArgumentError(
        `The user : ${userId} does not exist`,
        'userId',
        userId
      );
    }

    const workspaceId =
      workspace instanceof mongooseTypes.ObjectId
        ? workspace
        : (workspace._id as mongooseTypes.ObjectId);

    const user = await UserModel.getUserById(userId);

    const memberExists = await MEMBER_MODEL.memberExists(
      user?.email as string,
      databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
      workspaceId
    );

    if (memberExists)
      throw new error.InvalidArgumentError(
        `A member with email : ${
          (user as databaseTypes.IUser).email
        } already exists`,
        'member.email',
        (user as databaseTypes.IUser).email
      );
    return user;
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
  'validateProject',
  async (
    input: databaseTypes.IProject | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const projectId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await ProjectModel.projectIdExists(projectId))) {
      throw new error.InvalidArgumentError(
        `The project : ${projectId} does not exist`,
        'projectId',
        projectId
      );
    }
    return projectId;
  }
);

SCHEMA.static(
  'createWorkspaceMember',
  async (input: IMemberCreateInput): Promise<databaseTypes.IMember> => {
    const [workspaceId, invitedBy, member] = await Promise.all([
      MEMBER_MODEL.validateWorkspace(input.workspace),
      MEMBER_MODEL.validateWorkspaceMember(input.invitedBy, input.workspace),
      MEMBER_MODEL.validateWorkspaceMember(input.invitedBy, input.workspace),
    ]);

    const createDate = new Date();

    const transformedDocument: IMemberDocument = {
      email: input.email,
      inviter: input.inviter,
      type: databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
      invitedAt: createDate,
      createdAt: createDate,
      updatedAt: createDate,
      status: input.status ?? databaseTypes.constants.INVITATION_STATUS.PENDING,
      teamRole: input.teamRole ?? databaseTypes.constants.ROLE.MEMBER,
      member: member._id,
      invitedBy: invitedBy._id,
      workspace: workspaceId,
    };

    try {
      await MEMBER_MODEL.validate(transformedDocument);
    } catch (err) {
      throw new error.DataValidationError(
        'An error occurred while validating the member document.  See the inner error for additional details.',
        'member',
        transformedDocument,
        err
      );
    }

    try {
      const createdDocument = (
        await MEMBER_MODEL.create([transformedDocument], {
          validateBeforeSave: false,
        })
      )[0];
      return await MEMBER_MODEL.getMemberById(createdDocument._id, false);
    } catch (err) {
      throw new error.DatabaseOperationError(
        'An unexpected error occurred wile creating the member. See the inner error for additional information',
        'mongoDb',
        'create member',
        input,
        err
      );
    }
  }
);

SCHEMA.static(
  'createProjectMember',
  async (input: IMemberCreateInput): Promise<databaseTypes.IMember> => {
    const [workspaceId, invitedBy, member, projectId] = await Promise.all([
      MEMBER_MODEL.validateWorkspace(input.workspace),
      MEMBER_MODEL.validateProjectMember(
        input.invitedBy,
        input.workspace,
        input.project as unknown as
          | mongooseTypes.ObjectId
          | databaseTypes.IProject
      ),
      MEMBER_MODEL.validateProjectMember(
        input.member,
        input.workspace,
        input.project as unknown as
          | mongooseTypes.ObjectId
          | databaseTypes.IProject
      ),
      MEMBER_MODEL.validateProject(
        input.project as unknown as
          | mongooseTypes.ObjectId
          | databaseTypes.IProject
      ),
    ]);

    const createDate = new Date();

    const transformedDocument: IMemberDocument = {
      email: input.email,
      inviter: input.inviter,
      type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
      invitedAt: createDate,
      createdAt: createDate,
      updatedAt: createDate,
      status: input.status ?? databaseTypes.constants.INVITATION_STATUS.PENDING,
      teamRole: input.teamRole ?? databaseTypes.constants.ROLE.MEMBER,
      projectRole:
        input.projectRole ?? databaseTypes.constants.PROJECT_ROLE.READ_ONLY,
      member: member._id,
      invitedBy: invitedBy._id,
      workspace: workspaceId,
      project: projectId,
    };

    try {
      await MEMBER_MODEL.validate(transformedDocument);
    } catch (err) {
      throw new error.DataValidationError(
        'An error occurred while validating the member document.  See the inner error for additional details.',
        'member',
        transformedDocument,
        err
      );
    }

    try {
      const createdDocument = (
        await MEMBER_MODEL.create([transformedDocument], {
          validateBeforeSave: false,
        })
      )[0];
      return await MEMBER_MODEL.getMemberById(createdDocument._id);
    } catch (err) {
      throw new error.DatabaseOperationError(
        'An unexpected error occurred wile creating the member. See the inner error for additional information',
        'mongoDb',
        'create member',
        input,
        err
      );
    }
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (
    member: Omit<Partial<databaseTypes.IMember>, '_id'>
  ): Promise<void> => {
    if (
      member.member?._id &&
      !(await UserModel.userIdExists(member.member?._id))
    )
      throw new error.InvalidOperationError(
        `A new member with the _id: ${member.member._id} cannot be found`,
        {memberId: member.member._id}
      );
    if (
      member?.project?._id &&
      !(await ProjectModel.projectIdExists(member.project?._id))
    )
      throw new error.InvalidOperationError(
        `A new project with the _id: ${member.project._id} cannot be found`,
        {projectId: member.project._id}
      );
    if (
      member.invitedBy?._id &&
      !(await UserModel.userIdExists(member.invitedBy?._id))
    )
      throw new error.InvalidOperationError(
        `A inviter with the _id: ${member.invitedBy._id} cannot be found`,
        {invitedById: member.invitedBy._id}
      );
    if (
      member.workspace?._id &&
      !(await WorkspaceModel.workspaceIdExists(member.workspace?._id))
    )
      throw new error.InvalidOperationError(
        `A workspace with the _id: ${member.workspace._id} cannot be found`,
        {workpaceId: member.workspace._id}
      );

    if ((member as unknown as databaseTypes.IMember)._id)
      throw new error.InvalidOperationError(
        "A Member's _id is imutable and cannot be changed",
        {
          _id: (member as unknown as databaseTypes.IMember)._id,
        }
      );
  }
);

SCHEMA.static(
  'updateMemberWithFilter',
  async (
    filter: Record<string, unknown>,
    member: Omit<Partial<databaseTypes.IMember>, '_id'>
  ): Promise<boolean> => {
    try {
      await MEMBER_MODEL.validateUpdateObject(member);
      const transformedMember: Partial<IMemberDocument> & Record<string, any> =
        {};
      for (const key in member) {
        const value = (member as Record<string, any>)[key];
        if (
          key === 'member' ||
          key === 'workspace' ||
          key === 'invitedBy' ||
          key === 'project'
        )
          transformedMember[key] = value._id;
        else {
          //we only store the relation ids in our related collections
          transformedMember[key] = value;
        }
      }
      const updateResult = await MEMBER_MODEL.updateOne(
        filter,
        transformedMember
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No member document with filter: ${filter} was found`,
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
          `An unexpected error occurred while updating the member with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update member',
          {filter: filter, member: member},
          err
        );
    }
    return true;
  }
);

SCHEMA.static(
  'updateMemberById',
  async (
    memberId: mongooseTypes.ObjectId,
    member: Omit<Partial<databaseTypes.IMember>, '_id'>
  ): Promise<databaseTypes.IMember> => {
    await MEMBER_MODEL.updateMemberWithFilter({_id: memberId}, member);
    const retval = await MEMBER_MODEL.getMemberById(memberId);
    return retval;
  }
);

SCHEMA.static(
  'deleteMemberById',
  async (memberId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await MEMBER_MODEL.deleteOne({_id: memberId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `An member with a _id: ${memberId} was not found in the database`,
          '_id',
          memberId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleting the member from the database. The member may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete member',
          {_id: memberId},
          err
        );
    }
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['member'];

const MEMBER_MODEL = model<IMemberDocument, IMemberStaticMethods>(
  'member',
  SCHEMA
);

export {MEMBER_MODEL as MemberModel};
