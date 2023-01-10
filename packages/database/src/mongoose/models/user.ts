import {database as databaseTypes} from '@glyphx/types';
import {
  Types as mongooseTypes,
  Model,
  Schema,
  HydratedDocument,
  model,
} from 'mongoose';
import {IUserMethods, IUserStaticMethods, IUserDocument} from '../interfaces';
import {error} from '@glyphx/core';

const schema = new Schema<IUserDocument, IUserStaticMethods, IUserMethods>({
  name: {type: String, required: true},
  username: {type: String, required: true, unique: true},
  gh_username: {type: String, required: false},
  email: {type: String, required: true, unique: true},
  emailVerified: {type: Date, required: false},
  isVerified: {type: Boolean, required: true, default: false},
  image: {type: String, required: false},
  createdAt: {type: Date, required: true, default: Date.now()},
  updatedAt: {type: Date, required: true, default: Date.now()},
  accounts: {type: [Schema.Types.ObjectId], ref: 'account', default: []},
  sessions: {type: [Schema.Types.ObjectId], ref: 'session', default: []},
  webhooks: {type: [Schema.Types.ObjectId], ref: 'webhook', default: []},
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'organization',
    required: false,
  },
  apiKey: {type: String, required: false},
  role: {
    type: Number,
    required: true,
    enum: databaseTypes.constants.ROLE,
    default: databaseTypes.constants.ROLE.USER,
  },
  ownedOrgs: {type: [Schema.Types.ObjectId], default: []},
  projects: {type: [Schema.Types.ObjectId], default: []},
});
schema.static(
  'userIdExists',
  async (userId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await UserModel.findById(userId, ['_id']);
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
schema.static(
  'validateUpdateObject',
  (user: Omit<Partial<databaseTypes.IUser>, '_id'>) => {
    if (user.accounts?.length)
      throw new error.InvalidOperationError(
        'This method cannot be used to alter the users accounts.  Use the add/remove accounts functions to complete this operation',
        {accounts: user.accounts}
      );

    if (user.sessions?.length)
      throw new error.InvalidOperationError(
        "This method cannot be used to alter the users' sessions.  Use the add/remove session functions to complete this operation",
        {sessions: user.sessions}
      );

    if (user.ownedOrgs?.length)
      throw new error.InvalidOperationError(
        "This method cannot be used to alter the users' ownedOrganizations.  Use the add/remove organization functions to complete this operation",
        {organizations: user.ownedOrgs}
      );

    if (user.projects?.length)
      throw new error.InvalidOperationError(
        "This method cannot be used to alter the users' projects.  Use the add/remove project functions to complete this operation",
        {projects: user.projects}
      );

    if (user.webhooks?.length)
      throw new error.InvalidOperationError(
        "This method cannot be used to alter the users' webhooks.  Use the add/remove webhook functions to complete this operation",
        {webhooks: user.webhooks}
      );
    //this is one of the issues with TypeScript isn't it.  Even though we have set the type on
    //the function parameter, we still can't be sure that someone throgh javascript won't
    //sneak in something unexpected.  So we still need to test for those things
    if ((user as unknown as databaseTypes.IUser)._id)
      throw new error.InvalidOperationError(
        "A User's _id is imutable and cannot be changed",
        {
          _id: (user as unknown as databaseTypes.IUser)._id,
        }
      );

    return true;
  }
);

//TODO: we need to set and validate the updateDate and make the createdDate immutable.
schema.static(
  'updateUserWithFilter',
  async (
    filter: Record<string, unknown>,
    user: Omit<Partial<databaseTypes.IUser>, '_id'>
  ): Promise<boolean> => {
    try {
      UserModel.validateUpdateObject(user);
      const updateResult = await UserModel.updateOne(filter, user);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No user document with filter: ${filter} was found`,
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
          `An unexpected error occurred while updating the user with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update user',
          {filter: filter, user: user},
          err
        );
    }

    return true;
  }
);

schema.static(
  'updateUserById',
  async (
    id: mongooseTypes.ObjectId,
    user: Partial<databaseTypes.IUser>
  ): Promise<databaseTypes.IUser> => {
    await UserModel.updateUserWithFilter({_id: id}, user);
    return await UserModel.getUserById(id);
  }
);

schema.static(
  'validateAccounts',
  async (
    accounts: databaseTypes.IAccount[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const retval: mongooseTypes.ObjectId[] = [];
    //TODO: blow this out once we have an accountModel
    throw 'Not implemented';
    return retval;
  }
);

schema.static(
  'validateSessions',
  async (
    sessions: databaseTypes.ISession[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const retval: mongooseTypes.ObjectId[] = [];
    //TODO: Blow this out once we build a session model.
    return retval;
  }
);

schema.static(
  'validateWebhooks',
  async (
    webhooks: databaseTypes.IWebhook[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const retval: mongooseTypes.ObjectId[] = [];
    //TODO: Blow this our once we create a webhooks model
    return retval;
  }
);

schema.static(
  'validateOrganizations',
  async (
    organization: (databaseTypes.IOrganization | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    let retval: mongooseTypes.ObjectId[] = [];
    //TODO: blow this out once we have an organization model.
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

schema.static('getUserById', async (userId: mongooseTypes.ObjectId) => {});

schema.static(
  'createUser',
  async (
    input: Omit<databaseTypes.IUser, '_id' | 'createdAt' | 'updatedAt'>
  ) => {
    const orgs = Array.from(input.ownedOrgs) as (
      | databaseTypes.IOrganization
      | mongooseTypes.ObjectId
    )[];
    orgs.unshift(input.organization);
    let id: undefined | mongooseTypes.ObjectId = undefined;
    try {
      const [accounts, sessions, webhooks, organizations, projects] =
        await Promise.all([
          UserModel.validateAccounts(input.accounts),
          UserModel.validateSessions(input.sessions),
          UserModel.validateWebhooks(input.webhooks),
          UserModel.validateOrganizations(orgs),
          UserModel.validateProjects(input.projects),
        ]);
      const createDate = new Date();
      const org = organizations.shift() as mongooseTypes.ObjectId;

      let resolvedInput: IUserDocument = {
        name: input.name,
        username: input.username,
        gh_username: input.gh_username,
        email: input.email,
        emailVerified: input.emailVerified,
        isVerified: input.isVerified,
        image: input.image,
        createdAt: createDate,
        updatedAt: createDate,
        accounts: accounts,
        sessions: sessions,
        webhooks: webhooks,
        organization: org,
        apiKey: input.apiKey,
        role: input.role,
        ownedOrgs: organizations,
        projects: projects,
      };
      try {
        await UserModel.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IUserDocument',
          resolvedInput,
          err
        );
      }
      const userDocument = (
        await UserModel.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = userDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the user.  See the inner error for additional details',
          'mongoDb',
          'add User',
          {},
          err
        );
      }
    }
    if (id) return await UserModel.getUserById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the user may not have been created.  I have no other information to provide.'
      );
  }
);

schema.static(
  'deleteUserById',
  async (id: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await UserModel.deleteOne({_id: id});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A user with a _id: ${id} was not found in the database`,
          '_id',
          id
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while deleteing the user from the database. The user may still exist.  See the inner error for additional information`,
          'mongoDb',
          'delete user',
          {_id: id},
          err
        );
    }
  }
);
const UserModel = model<IUserDocument, IUserStaticMethods>('user', schema);

export {UserModel};
