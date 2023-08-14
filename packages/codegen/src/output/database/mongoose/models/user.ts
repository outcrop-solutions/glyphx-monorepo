// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {
  IUserDocument,
  IUserCreateInput,
  IUserStaticMethods,
  IUserMethods,
} from '../interfaces';
import {AccountModel} from './account';
import {SessionModel} from './session';
import {MemberModel} from './member';
import {WorkspaceModel} from './workspace';
import {ProjectModel} from './project';
import {CustomerPaymentModel} from './customerPayment';
import {WebhookModel} from './webhook';

const SCHEMA = new Schema<IUserDocument, IUserStaticMethods, IUserMethods>({
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
  userCode: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  gh_username: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Date,
    required: false,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  isVerified: {
    type: Boolean,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  accounts: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'accounts',
  },
  sessions: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'sessions',
  },
  membership: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'membership',
  },
  invitedMembers: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'invitedMembers',
  },
  createdWorkspaces: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'createdWorkspaces',
  },
  projects: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'projects',
  },
  customerPayment: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'customerpayment',
  },
  webhooks: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'webhooks',
  },
  apiKey: {
    type: String,
    required: false,
  },
});

SCHEMA.static(
  'userIdExists',
  async (userId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await USER_MODEL.findById(userId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the user.  See the inner error for additional information',
        'mongoDb',
        'userIdExists',
        {_id: userId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allUserIdsExist',
  async (userIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await USER_MODEL.find({_id: {$in: userIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      userIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more userIds cannot be found in the database.',
          'user._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the userIds.  See the inner error for additional information',
          'mongoDb',
          'allUserIdsExists',
          {userIds: userIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (user: Omit<Partial<databaseTypes.IUser>, '_id'>): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a user with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (user.customerPayment)
      tasks.push(
        idValidator(
          user.customerPayment._id as mongooseTypes.ObjectId,
          'CustomerPayment',
          CustomerPaymentModel.customerPaymentIdExists
        )
      );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (user.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: user.createdAt}
      );
    if (user.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: user.updatedAt}
      );
    if ((user as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The user._id is immutable and cannot be changed',
        {_id: (user as Record<string, unknown>)['_id']}
      );
  }
);

// CREATE
SCHEMA.static(
  'createUser',
  async (input: IUserCreateInput): Promise<databaseTypes.IUser> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [
        accounts,
        sessions,
        membership,
        invitedMembers,
        createdWorkspaces,
        projects,
        customerPayment,
        webhooks,
      ] = await Promise.all([
        USER_MODEL.validateAccounts(input.accounts ?? []),
        USER_MODEL.validateSessions(input.sessions ?? []),
        USER_MODEL.validateMemberships(input.membership ?? []),
        USER_MODEL.validateInvitedMembers(input.invitedMembers ?? []),
        USER_MODEL.validateCreatedWorkspaces(input.createdWorkspaces ?? []),
        USER_MODEL.validateProjects(input.projects ?? []),
        USER_MODEL.validateCustomerPayment(input.customerPayment),
        USER_MODEL.validateWebhooks(input.webhooks ?? []),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IUserDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        userCode: input.userCode,
        name: input.name,
        username: input.username,
        gh_username: input.gh_username,
        email: input.email,
        emailVerified: input.emailVerified,
        isVerified: input.isVerified,
        image: input.image,
        accounts: accounts,
        sessions: sessions,
        membership: membership,
        invitedMembers: invitedMembers,
        createdWorkspaces: createdWorkspaces,
        projects: projects,
        customerPayment: customerPayment,
        webhooks: webhooks,
        apiKey: input.apiKey,
      };
      try {
        await USER_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IUserDocument',
          resolvedInput,
          err
        );
      }
      const userDocument = (
        await USER_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = userDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the user.  See the inner error for additional details',
          'mongoDb',
          'addUser',
          {},
          err
        );
      }
    }
    if (id) return await USER_MODEL.getUserById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the user may not have been created.  I have no other information to provide.'
      );
  }
);

// READ
SCHEMA.static('getUserById', async (userId: mongooseTypes.ObjectId) => {
  try {
    const userDocument = (await USER_MODEL.findById(userId)
      .populate('accounts')
      .populate('sessions')
      .populate('membership')
      .populate('invitedMembers')
      .populate('createdWorkspaces')
      .populate('projects')
      .populate('customerPayment')
      .populate('webhooks')
      .lean()) as databaseTypes.IUser;
    if (!userDocument) {
      throw new error.DataNotFoundError(
        `Could not find a user with the _id: ${userId}`,
        'user_id',
        userId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (userDocument as any)['__v'];

    userDocument.accounts?.forEach((m: any) => delete (m as any)['__v']);
    userDocument.sessions?.forEach((m: any) => delete (m as any)['__v']);
    userDocument.membership?.forEach((m: any) => delete (m as any)['__v']);
    userDocument.invitedMembers?.forEach((m: any) => delete (m as any)['__v']);
    userDocument.createdWorkspaces?.forEach(
      (m: any) => delete (m as any)['__v']
    );
    userDocument.projects?.forEach((m: any) => delete (m as any)['__v']);
    delete (userDocument as any).customerPayment?.['__v'];
    userDocument.webhooks?.forEach((m: any) => delete (m as any)['__v']);

    return userDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getUserById',
        err
      );
  }
});

SCHEMA.static(
  'queryUsers',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await USER_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find users with the filter: ${filter}`,
          'queryUsers',
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

      const userDocuments = (await USER_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('accounts')
        .populate('sessions')
        .populate('membership')
        .populate('invitedMembers')
        .populate('createdWorkspaces')
        .populate('projects')
        .populate('customerPayment')
        .populate('webhooks')
        .lean()) as databaseTypes.IUser[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      userDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        (doc as any).accounts?.forEach((m: any) => delete (m as any)['__v']);
        (doc as any).sessions?.forEach((m: any) => delete (m as any)['__v']);
        (doc as any).membership?.forEach((m: any) => delete (m as any)['__v']);
        (doc as any).invitedMembers?.forEach(
          (m: any) => delete (m as any)['__v']
        );
        (doc as any).createdWorkspaces?.forEach(
          (m: any) => delete (m as any)['__v']
        );
        (doc as any).projects?.forEach((m: any) => delete (m as any)['__v']);
        delete (doc as any).customerPayment?.['__v'];
        (doc as any).webhooks?.forEach((m: any) => delete (m as any)['__v']);
      });

      const retval: IQueryResult<databaseTypes.IUser> = {
        results: userDocuments,
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
          'An unexpected error occurred while getting the users.  See the inner error for additional information',
          'mongoDb',
          'queryUsers',
          err
        );
    }
  }
);

// UPDATE
SCHEMA.static(
  'updateUserWithFilter',
  async (
    filter: Record<string, unknown>,
    user: Omit<Partial<databaseTypes.IUser>, '_id'>
  ): Promise<void> => {
    try {
      await USER_MODEL.validateUpdateObject(user);
      const updateDate = new Date();
      const transformedObject: Partial<IUserDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in user) {
        const value = (user as Record<string, any>)[key];
        if (key === 'customerPayment')
          transformedObject.customerPayment =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await USER_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No user document with filter: ${filter} was found',
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
          'update user',
          {filter: filter, user: user},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateUserById',
  async (
    userId: mongooseTypes.ObjectId,
    user: Omit<Partial<databaseTypes.IUser>, '_id'>
  ): Promise<databaseTypes.IUser> => {
    await USER_MODEL.updateUserWithFilter({_id: userId}, user);
    return await USER_MODEL.getUserById(userId);
  }
);

// DELETE
SCHEMA.static(
  'deleteUserById',
  async (userId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await USER_MODEL.deleteOne({_id: userId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A user with a _id: ${userId} was not found in the database`,
          '_id',
          userId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the user from the database. The user may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete user',
          {_id: userId},
          err
        );
    }
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['user'];

const USER_MODEL = model<IUserDocument, IUserStaticMethods>('user', SCHEMA);

export {USER_MODEL as UserModel};
