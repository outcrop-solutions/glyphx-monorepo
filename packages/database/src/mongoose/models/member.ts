import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  IMemberMethods,
  IMemberStaticMethods,
  IMemberDocument,
} from '../interfaces';
import {error} from '@glyphx/core';
import {UserModel} from './user';
import {WorkspaceModel} from './workspace';

const SCHEMA = new Schema<
  IMemberDocument,
  IMemberStaticMethods,
  IMemberMethods
>({
  email: {type: String, required: true},
  inviter: {type: String, required: true},
  invitedAt: {type: Date, required: true},
  joinedAt: {type: Date, required: true},
  deletedAt: {type: Date, required: false},
  updatedAt: {type: Date, required: false},
  createdAt: {type: Date, required: false},
  status: {
    type: Number,
    required: true,
    enum: databaseTypes.constants.INVITATION_STATUS,
    default: databaseTypes.constants.INVITATION_STATUS.PENDING,
  },
  teamRole: {
    type: Number,
    required: true,
    enum: databaseTypes.constants.ROLE,
    default: databaseTypes.constants.ROLE.MEMBER,
  },
  member: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  invitedBy: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
  workspace: {type: Schema.Types.ObjectId, required: true, ref: 'workspace'},
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
  'memberEmailExists',
  async (memberEmail: string): Promise<boolean> => {
    let retval = false;
    try {
      const result = await MEMBER_MODEL.findOne({email: memberEmail});
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the member.  See the inner error for additional information',
        'mongoDb',
        'memberEmailExists',
        {email: memberEmail},
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

SCHEMA.static('getMemberById', async (memberId: mongooseTypes.ObjectId) => {
  try {
    const memberDocument = (await MEMBER_MODEL.findById(memberId)
      .populate('member')
      .populate('invitedBy')
      .populate('workspace')
      .lean()) as databaseTypes.IMember;
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
});

SCHEMA.static('getMembers', async (filter: Record<string, unknown> = {}) => {
  try {
    const memberDocuments = (await MEMBER_MODEL.find(filter)
      .populate('customer')
      .lean()) as databaseTypes.ICustomerPayment[];
    if (!memberDocuments) {
      throw new error.DataNotFoundError(
        `Could not find members with the filter: ${filter}`,
        'members',
        filter
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    return memberDocuments.map((doc: any) => {
      delete (doc as any)['__v'];
      delete (doc as any).customer['__v'];
    });
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the members.  See the inner error for additional information',
        'mongoDb',
        'getMembers',
        err
      );
  }
});

SCHEMA.static(
  'createMember',
  async (
    input: Omit<databaseTypes.IMember, '_id'>
  ): Promise<databaseTypes.IMember> => {
    const newMemberExists = await UserModel.userIdExists(
      input.member._id as mongooseTypes.ObjectId
    );
    if (!newMemberExists)
      throw new error.InvalidArgumentError(
        `A new member with _id : ${input.member._id} cannot be found`,
        'member._id',
        input.member._id
      );
    const userExists = await UserModel.userIdExists(
      input.invitedBy._id as mongooseTypes.ObjectId
    );
    if (!userExists)
      throw new error.InvalidArgumentError(
        `A user with _id : ${input.invitedBy._id} cannot be found`,
        'user._id',
        input.invitedBy._id
      );

    const workspaceExists = await WorkspaceModel.workspaceIdExists(
      input.workspace._id as mongooseTypes.ObjectId
    );
    if (!workspaceExists)
      throw new error.InvalidArgumentError(
        `A workspace with _id : ${input.workspace._id} cannot be found`,
        'workspace._id',
        input.workspace._id
      );

    const memberEmailExists = await MEMBER_MODEL.memberEmailExists(
      input.member.email as string
    );
    if (memberEmailExists)
      throw new error.InvalidArgumentError(
        `A member with email : ${input.member.email} already exists`,
        'member.email',
        input.member.email
      );

    const createDate = new Date();

    const transformedDocument: IMemberDocument = {
      email: input.email,
      inviter: input.inviter,
      invitedAt: createDate,
      joinedAt: input.joinedAt,
      createdAt: createDate,
      updatedAt: createDate,
      status: input.status,
      teamRole: input.teamRole,
      member: input.member._id as mongooseTypes.ObjectId,
      invitedBy: input.invitedBy._id as mongooseTypes.ObjectId,
      workspace: input.workspace._id as mongooseTypes.ObjectId,
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
    await MEMBER_MODEL.validateUpdateObject(member);
    try {
      const transformedMember: Partial<IMemberDocument> & Record<string, any> =
        {};
      for (const key in member) {
        const value = (member as Record<string, any>)[key];
        if (key === 'member' || key === 'workspace' || key === 'invitedBy')
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

const MEMBER_MODEL = model<IMemberDocument, IMemberStaticMethods>(
  'member',
  SCHEMA
);

export {MEMBER_MODEL as MemberModel};
