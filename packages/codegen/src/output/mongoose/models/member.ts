import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IMemberDocument, IMemberCreateInput, IMemberStaticMethods, IMemberMethods} from '../interfaces';
import { UserModel} from './user'
import { UserModel} from './user'
import { WorkspaceModel} from './workspace'
import { ProjectModel} from './project'

const SCHEMA = new Schema<IMemberDocument, IMemberStaticMethods, IMemberMethods>({
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
  email: {
    type: String,
    required: true,
      default: false
      },
  inviter: {
    type: String,
    required: true,
      default: false
      },
  type: {
    type: String,
    required: false,
    enum: databaseTypes.constants.Type
  },
  invitedAt: {
    type: Date,
    required: false,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  joinedAt: {
    type: Date,
    required: false,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  status: {
    type: String,
    required: false,
    enum: databaseTypes.constants.Status
  },
  teamRole: {
    type: String,
    required: false,
    enum: databaseTypes.constants.TeamRole
  },
  projectRole: {
    type: String,
    required: false,
    enum: databaseTypes.constants.ProjectRole
  },
  member: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'user'
  },
  invitedBy: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'user'
  },
  workspace: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'workspace'
  },
  project: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'project'
  }
})

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
          { memberIds: memberIds},
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
    member: Omit<Partial<databaseTypes.IMember>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a member with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

        if (member.member)
          tasks.push(
            idValidator(
              member.member._id as mongooseTypes.ObjectId,
              'Member',
              MemberModel.memberIdExists
            )
          );
        if (member.invitedBy)
          tasks.push(
            idValidator(
              member.invitedBy._id as mongooseTypes.ObjectId,
              'InvitedBy',
              InvitedByModel.invitedByIdExists
            )
          );
        if (member.workspace)
          tasks.push(
            idValidator(
              member.workspace._id as mongooseTypes.ObjectId,
              'Workspace',
              WorkspaceModel.workspaceIdExists
            )
          );
        if (member.project)
          tasks.push(
            idValidator(
              member.project._id as mongooseTypes.ObjectId,
              'Project',
              ProjectModel.projectIdExists
            )
          );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (member.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: member.createdAt}
      );
    if (member.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: member.updatedAt}
      );
    if ((member as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The member._id is immutable and cannot be changed',
        {_id: (member as Record<string, unknown>)['_id']}
      );
  }
);

SCHEMA.static(
  'createMember',
  async (input: IMemberCreateInput): Promise<databaseTypes.IMember> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [ 
        ] = await Promise.all([
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IMemberDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        email: input.email,
        inviter: input.inviter,
        type: input.type,
        invitedAt: input.invitedAt,
        joinedAt: input.joinedAt,
        status: input.status,
        teamRole: input.teamRole,
        projectRole: input.projectRole,
        member: input.member,
        invitedBy: input.invitedBy,
        workspace: input.workspace,
        project: input.project
      };
      try {
        await MEMBER_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IMemberDocument',
          resolvedInput,
          err
        );
      }
      const memberDocument = (
        await MEMBER_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = memberDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the member.  See the inner error for additional details',
          'mongoDb',
          'addMember',
          {},
          err
        );
      }
    }
    if (id) return await MEMBER_MODEL.getMemberById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the member may not have been created.  I have no other information to provide.'
      );
  }
);

SCHEMA.static('getMemberById', async (memberId: mongooseTypes.ObjectId) => {
  try {
    const memberDocument = (await MEMBER_MODEL.findById(memberId)
      .populate('type')
      .populate('status')
      .populate('teamRole')
      .populate('projectRole')
      .populate('member')
      .populate('invitedBy')
      .populate('workspace')
      .populate('project')
      .lean()) as databaseTypes.IMember;
    if (!memberDocument) {
      throw new error.DataNotFoundError(
        `Could not find a member with the _id: ${ memberId}`,
        'member_id',
        memberId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (memberDocument as any)['__v'];

    delete (memberDocument as any).member?.['__v'];
    delete (memberDocument as any).invitedBy?.['__v'];
    delete (memberDocument as any).workspace?.['__v'];
    delete (memberDocument as any).project?.['__v'];

    return memberDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getMemberById',
        err
      );
  }
});

SCHEMA.static(
  'updateMemberWithFilter',
  async (
    filter: Record<string, unknown>,
    member: Omit<Partial<databaseTypes.IMember>, '_id'>
  ): Promise<void> => {
    try {
      await MEMBER_MODEL.validateUpdateObject(member);
      const updateDate = new Date();
      const transformedObject: Partial<IMemberDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in member) {
        const value = (member as Record<string, any>)[key];
          if (key === 'member')
            transformedObject.member =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
          if (key === 'invitedBy')
            transformedObject.invitedBy =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
          if (key === 'workspace')
            transformedObject.workspace =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
          if (key === 'project')
            transformedObject.project =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await MEMBER_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No member document with filter: ${filter} was found',
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
          'update member',
          {filter: filter, member : member },
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
          'queryMembers',
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
        .populate('type')
        .populate('status')
        .populate('teamRole')
        .populate('projectRole')
        .populate('member')
        .populate('invitedBy')
        .populate('workspace')
        .populate('project')
        .lean()) as databaseTypes.IMember[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      memberDocuments.forEach((doc: any) => {
      delete (doc as any)['__v'];
      delete (doc as any).member?.['__v'];
      delete (doc as any).invitedBy?.['__v'];
      delete (doc as any).workspace?.['__v'];
      delete (doc as any).project?.['__v'];
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
          'An unexpected error occurred while getting the members.  See the inner error for additional information',
          'mongoDb',
          'queryMembers',
          err
        );
    }
  }
);

SCHEMA.static(
  'deleteMemberById',
  async (memberId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await MEMBER_MODEL.deleteOne({_id: memberId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A member with a _id: ${ memberId} was not found in the database`,
          '_id',
          memberId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the member from the database. The member may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete member',
          {_id: memberId},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateMemberById',
  async (
    memberId: mongooseTypes.ObjectId,
    member: Omit<Partial<databaseTypes.IMember>, '_id'>
  ): Promise<databaseTypes.IMember> => {
    await MEMBER_MODEL.updateMemberWithFilter({_id: memberId}, member);
    return await MEMBER_MODEL.getMemberById(memberId);
  }
);








// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['member'];

const MEMBER_MODEL = model<IMemberDocument, IMemberStaticMethods>(
  'member',
  SCHEMA
);

export { MEMBER_MODEL as MemberModel };
;
