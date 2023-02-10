import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {IUserMethods, IUserStaticMethods, IUserDocument} from '../interfaces';
import {error} from '@glyphx/core';
import {ProjectModel} from './project';
import {AccountModel} from './account';
import {SessionModel} from './session';
import {WebhookModel} from './webhook';
import {WorkspaceModel} from './workspace';

const SCHEMA = new Schema<IUserDocument, IUserStaticMethods, IUserMethods>({
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
  workspace: {
    type: Schema.Types.ObjectId,
    ref: 'workspace',
    required: false,
  },
  apiKey: {type: String, required: false},
  role: {
    type: Number,
    required: true,
    enum: databaseTypes.constants.ROLE,
    default: databaseTypes.constants.ROLE.MEMBER,
  },
  createdWorkspace: {type: [Schema.Types.ObjectId], default: [], ref: 'workspace'},
  projects: {type: [Schema.Types.ObjectId], default: [], ref: 'project'},
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

    if (user.createdWorkspace?.length)
      throw new error.InvalidOperationError(
        "This method cannot be used to alter the users' ownedWorkspaces.  Use the add/remove workspace functions to complete this operation",
        {workspaces: user.createdWorkspace}
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
SCHEMA.static(
  'updateUserWithFilter',
  async (
    filter: Record<string, unknown>,
    user: Omit<Partial<databaseTypes.IUser>, '_id'>
  ): Promise<boolean> => {
    try {
      USER_MODEL.validateUpdateObject(user);
      const updateResult = await USER_MODEL.updateOne(filter, user);
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

SCHEMA.static(
  'updateUserById',
  async (
    id: mongooseTypes.ObjectId,
    user: Partial<databaseTypes.IUser>
  ): Promise<databaseTypes.IUser> => {
    await USER_MODEL.updateUserWithFilter({_id: id}, user);
    return await USER_MODEL.getUserById(id);
  }
);

SCHEMA.static(
  'validateAccounts',
  async (
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
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

SCHEMA.static(
  'validateSessions',
  async (
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
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

SCHEMA.static(
  'validateWebhooks',
  async (
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
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

SCHEMA.static(
  'validateWorkspaces',
  async (
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const workspaceIds: mongooseTypes.ObjectId[] = [];
    workspaces.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) workspaceIds.push(p);
      else workspaceIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await WorkspaceModel.allWorkspaceIdsExist(workspaceIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more workspace ids do not exisit in the database.  See the inner error for additional information',
          'workspace',
          workspaces,
          err
        );
      else throw err;
    }

    return workspaceIds;
  }
);

//give our user some flexibily to pass object ids instead of a full project.
//TODO: look into our interfaces to allow passing either a full projecty or objectIds.
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

SCHEMA.static('getUserById', async (userId: mongooseTypes.ObjectId) => {
  try {
    const userDocument = (await USER_MODEL.findById(userId)
      .populate('accounts')
      .populate('workspace')
      .populate('sessions')
      .populate('webhooks')
      .populate('createdWorkspace')
      .populate('projects')
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
    delete (userDocument as any).workspace?.['__v'];
    userDocument.accounts.forEach(a => delete (a as any)['__v']);
    userDocument.sessions.forEach(s => delete (s as any)['__v']);
    userDocument.webhooks.forEach(w => delete (w as any)['__v']);
    userDocument.createdWorkspace.forEach(o => delete (o as any)['__v']);
    userDocument.projects.forEach(p => delete (p as any)['__v']);

    return userDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the user.  See the inner error for additional information',
        'mongoDb',
        'getUserById',
        err
      );
  }
});

SCHEMA.static(
  'createUser',
  async (
    input: Omit<databaseTypes.IUser, '_id' | 'createdAt' | 'updatedAt'>
  ) => {
    const orgs = Array.from(
      //istanbul ignore next
      input.createdWorkspace ?? []
    ) as (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[];
    //istanbul ignore else
    if (input.workspace) orgs.unshift(input.workspace);
    let id: undefined | mongooseTypes.ObjectId = undefined;
    try {
      const [accounts, sessions, webhooks, workspaces, projects] =
        await Promise.all([
          USER_MODEL.validateAccounts(
            //istanbul ignore next
            input.accounts ?? []
          ),
          USER_MODEL.validateSessions(
            //istanbul ignore next
            input.sessions ?? []
          ),
          USER_MODEL.validateWebhooks(
            //istanbul ignore next
            input.webhooks ?? []
          ),
          USER_MODEL.validateWorkspaces(
            //istanbul ignore next
            orgs ?? []
          ),
          USER_MODEL.validateProjects(
            //istanbul ignore next
            input.projects ?? []
          ),
        ]);
      const createDate = new Date();
      const org = workspaces.shift() as mongooseTypes.ObjectId;

      const resolvedInput: IUserDocument = {
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
        workspace: org,
        apiKey: input.apiKey,
        role: input.role,
        createdWorkspace: workspaces,
        projects: projects,
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
          'add User',
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

SCHEMA.static(
  'deleteUserById',
  async (id: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await USER_MODEL.deleteOne({_id: id});
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
          'An unexpected error occurred while deleteing the user from the database. The user may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete user',
          {_id: id},
          err
        );
    }
  }
);

SCHEMA.static(
  'addProjects',
  async (
    userId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one projectId',
          'projects',
          projects
        );
      const userDocument = await USER_MODEL.findById(userId);
      if (!userDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${userId} cannot be found`,
          'user._id',
          userId
        );

      const reconciledIds = await USER_MODEL.validateProjects(projects);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !userDocument.projects.find(
            progId => progId.toString() === p.toString()
          )
        ) {
          dirty = true;
          userDocument.projects.push(p as unknown as databaseTypes.IProject);
        }
      });

      if (dirty) await userDocument.save();

      return await USER_MODEL.getUserById(userId);
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
          'user.addProjects',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeProjects',
  async (
    userId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one projectId',
          'projects',
          projects
        );
      const userDocument = await USER_MODEL.findById(userId);
      if (!userDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${userId} cannot be found`,
          'user._id',
          userId
        );

      const reconciledIds = projects.map(i =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedProjects = userDocument.projects.filter(p => {
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
        userDocument.projects =
          updatedProjects as unknown as databaseTypes.IProject[];
        await userDocument.save();
      }

      return await USER_MODEL.getUserById(userId);
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
          'user.removeProjects',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'addAccounts',
  async (
    userId: mongooseTypes.ObjectId,
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> => {
    try {
      if (!accounts.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one accountId',
          'accounts',
          accounts
        );
      const userDocument = await USER_MODEL.findById(userId);
      if (!userDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${userId} cannot be found`,
          'user._id',
          userId
        );

      const reconciledIds = await USER_MODEL.validateAccounts(accounts);
      let dirty = false;
      reconciledIds.forEach(a => {
        if (
          !userDocument.accounts.find(
            acctId => acctId.toString() === a.toString()
          )
        ) {
          dirty = true;
          userDocument.accounts.push(a as unknown as databaseTypes.IAccount);
        }
      });

      if (dirty) await userDocument.save();

      return await USER_MODEL.getUserById(userId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while adding the accounts. See the innner error for additional information',
          'mongoDb',
          'user.addAccounts',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeAccounts',
  async (
    userId: mongooseTypes.ObjectId,
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> => {
    try {
      if (!accounts.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one accountId',
          'accounts',
          accounts
        );
      const userDocument = await USER_MODEL.findById(userId);
      if (!userDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${userId} cannot be found`,
          'user._id',
          userId
        );

      const reconciledIds = accounts.map(i =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedAccounts = userDocument.accounts.filter(a => {
        let retval = true;
        if (
          reconciledIds.find(
            r =>
              r.toString() ===
              (a as unknown as mongooseTypes.ObjectId).toString()
          )
        ) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        userDocument.accounts =
          updatedAccounts as unknown as databaseTypes.IAccount[];
        await userDocument.save();
      }

      return await USER_MODEL.getUserById(userId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while removing the accounts. See the innner error for additional information',
          'mongoDb',
          'user.removeAccounts',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'addSessions',
  async (
    userId: mongooseTypes.ObjectId,
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> => {
    try {
      if (!sessions.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one sessionId',
          'sessions',
          sessions
        );
      const userDocument = await USER_MODEL.findById(userId);
      if (!userDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${userId} cannot be found`,
          'user._id',
          userId
        );

      const reconciledIds = await USER_MODEL.validateSessions(sessions);
      let dirty = false;
      reconciledIds.forEach(s => {
        if (
          !userDocument.sessions.find(
            sessId => sessId.toString() === s.toString()
          )
        ) {
          dirty = true;
          userDocument.sessions.push(s as unknown as databaseTypes.ISession);
        }
      });

      if (dirty) await userDocument.save();

      return await USER_MODEL.getUserById(userId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while adding the sessions. See the innner error for additional information',
          'mongoDb',
          'user.addSessions',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeSessions',
  async (
    userId: mongooseTypes.ObjectId,
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> => {
    try {
      if (!sessions.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one sessionId',
          'sessions',
          sessions
        );
      const userDocument = await USER_MODEL.findById(userId);
      if (!userDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${userId} cannot be found`,
          'user._id',
          userId
        );

      const reconciledIds = sessions.map(i =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedSessions = userDocument.sessions.filter(s => {
        let retval = true;
        if (
          reconciledIds.find(
            r =>
              r.toString() ===
              (s as unknown as mongooseTypes.ObjectId).toString()
          )
        ) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        userDocument.sessions =
          updatedSessions as unknown as databaseTypes.ISession[];
        await userDocument.save();
      }

      return await USER_MODEL.getUserById(userId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while removing the sessions. See the innner error for additional information',
          'mongoDb',
          'user.removeSession',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'addWebhooks',
  async (
    userId: mongooseTypes.ObjectId,
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> => {
    try {
      if (!webhooks.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one webhookId',
          'webhooks',
          webhooks
        );
      const userDocument = await USER_MODEL.findById(userId);
      if (!userDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${userId} cannot be found`,
          'user._id',
          userId
        );

      const reconciledIds = await USER_MODEL.validateWebhooks(webhooks);
      let dirty = false;
      reconciledIds.forEach(w => {
        if (
          !userDocument.webhooks.find(whId => whId.toString() === w.toString())
        ) {
          dirty = true;
          userDocument.webhooks.push(w as unknown as databaseTypes.IWebhook);
        }
      });

      if (dirty) await userDocument.save();

      return await USER_MODEL.getUserById(userId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while adding the webhooks. See the innner error for additional information',
          'mongoDb',
          'user.addWebhooks',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeWebhooks',
  async (
    userId: mongooseTypes.ObjectId,
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> => {
    try {
      if (!webhooks.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one webhookId',
          'sessions',
          webhooks
        );
      const userDocument = await USER_MODEL.findById(userId);
      if (!userDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${userId} cannot be found`,
          'user._id',
          userId
        );

      const reconciledIds = webhooks.map(i =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedWebhooks = userDocument.webhooks.filter(w => {
        let retval = true;
        if (
          reconciledIds.find(
            r =>
              r.toString() ===
              (w as unknown as mongooseTypes.ObjectId).toString()
          )
        ) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        userDocument.webhooks =
          updatedWebhooks as unknown as databaseTypes.IWebhook[];
        await userDocument.save();
      }

      return await USER_MODEL.getUserById(userId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while removing the webhooks. See the innner error for additional information',
          'mongoDb',
          'user.removeWebhook',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'addWorkspaces',
  async (
    userId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> => {
    try {
      if (!workspaces.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one workspaceId',
          'workspaces',
          workspaces
        );
      const userDocument = await USER_MODEL.findById(userId);
      if (!userDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${userId} cannot be found`,
          'user._id',
          userId
        );

      const reconciledIds = await USER_MODEL.validateWorkspaces(
        workspaces
      );
      let dirty = false;
      reconciledIds.forEach(o => {
        if (
          !userDocument.createdWorkspace.find(
            orgId => orgId.toString() === o.toString()
          )
        ) {
          dirty = true;
          userDocument.createdWorkspace.push(
            o as unknown as databaseTypes.IWorkspace
          );
        }
      });

      if (dirty) await userDocument.save();

      return await USER_MODEL.getUserById(userId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while adding the workspaces. See the innner error for additional information',
          'mongoDb',
          'user.addWorkspaces',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeWorkspaces',
  async (
    userId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser> => {
    try {
      if (!workspaces.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one workspaceId',
          'workspaces',
          workspaces
        );
      const userDocument = await USER_MODEL.findById(userId);
      if (!userDocument)
        throw new error.DataNotFoundError(
          `A User Document with _id : ${userId} cannot be found`,
          'user._id',
          userId
        );

      const reconciledIds = workspaces.map(i =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedWorkspaces = userDocument.createdWorkspace.filter(o => {
        let retval = true;
        if (
          reconciledIds.find(
            r =>
              r.toString() ===
              (o as unknown as mongooseTypes.ObjectId).toString()
          )
        ) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        userDocument.createdWorkspace =
          updatedWorkspaces as unknown as databaseTypes.IWorkspace[];
        await userDocument.save();
      }

      return await USER_MODEL.getUserById(userId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while removing the workspaces. See the innner error for additional information',
          'mongoDb',
          'user.removeWorkspaces',
          err
        );
      }
    }
  }
);

const USER_MODEL = model<IUserDocument, IUserStaticMethods>('user', SCHEMA);

export {USER_MODEL as UserModel};
