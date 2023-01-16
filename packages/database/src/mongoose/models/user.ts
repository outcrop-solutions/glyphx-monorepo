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
import {ProjectModel} from './project';
import {AccountModel} from './account';
import {SessionModel} from './session';
import {WebhookModel} from './webhook';
import {OrganizationModel} from './organization';

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
  'allUserIdsExist',
  async (userIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    const retval = true;
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await UserModel.find({_id: {$in: userIds}}, [
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
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    let retval: mongooseTypes.ObjectId[] = [];
    const accountIds: mongooseTypes.ObjectId[] = [];
    accounts.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) accountIds.push(p);
      else accountIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await AccountModel.allAccountIdsExist(accountIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more account ids do not exisit in the database.  See the inner error for additional information',
          'accounts',
          accounts,
          err
        );
      else throw err;
    }

    return accountIds;
  }
);

schema.static(
  'validateSessions',
  async (
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    let retval: mongooseTypes.ObjectId[] = [];
    const sessionIds: mongooseTypes.ObjectId[] = [];
    sessions.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) sessionIds.push(p);
      else sessionIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await SessionModel.allSessionIdsExist(sessionIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more session ids do not exisit in the database.  See the inner error for additional information',
          'session',
          sessions,
          err
        );
      else throw err;
    }

    return sessionIds;
  }
);

schema.static(
  'validateWebhooks',
  async (
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    let retval: mongooseTypes.ObjectId[] = [];
    const webhookIds: mongooseTypes.ObjectId[] = [];
    webhooks.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) webhookIds.push(p);
      else webhookIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await WebhookModel.allWebhookIdsExist(webhookIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more webhook ids do not exisit in the database.  See the inner error for additional information',
          'webhook',
          webhooks,
          err
        );
      else throw err;
    }

    return webhookIds;
  }
);

schema.static(
  'validateOrganizations',
  async (
    organizations: (databaseTypes.IOrganization | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    let retval: mongooseTypes.ObjectId[] = [];
    const organizationIds: mongooseTypes.ObjectId[] = [];
    organizations.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) organizationIds.push(p);
      else organizationIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await OrganizationModel.allOrganizationIdsExist(organizationIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more organization ids do not exisit in the database.  See the inner error for additional information',
          'organization',
          organizations,
          err
        );
      else throw err;
    }

    return organizationIds;
  }
);

//give our user some flexibily to pass object ids instead of a full project.
//TODO: look into our interfaces to allow passing either a full projecty or objectIds.
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
