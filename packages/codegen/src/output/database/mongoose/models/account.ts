// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {
  IAccountDocument,
  IAccountCreateInput,
  IAccountStaticMethods,
  IAccountMethods,
} from '../interfaces';
import {UserModel} from './user';

const SCHEMA = new Schema<
  IAccountDocument,
  IAccountStaticMethods,
  IAccountMethods
>({
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
  type: {
    type: String,
    required: false,
    enum: databaseTypes.ACCOUNT_TYPE,
  },
  userId: {
    type: String,
    required: false,
  },
  provider: {
    type: String,
    required: false,
    enum: databaseTypes.ACCOUNT_PROVIDER,
  },
  providerAccountId: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  refresh_token_expires_in: {
    type: Number,
    required: true,
  },
  access_token: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Number,
    required: true,
  },
  token_type: {
    type: String,
    required: false,
    enum: databaseTypes.TOKEN_TYPE,
  },
  scope: {
    type: String,
    required: true,
  },
  id_token: {
    type: String,
    required: true,
  },
  session_state: {
    type: String,
    required: false,
    enum: databaseTypes.SESSION_STATE,
  },
  oauth_token_secret: {
    type: String,
    required: true,
  },
  oauth_token: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'user',
  },
});

SCHEMA.static(
  'accountIdExists',
  async (accountId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await ACCOUNT_MODEL.findById(accountId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the account.  See the inner error for additional information',
        'mongoDb',
        'accountIdExists',
        {_id: accountId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allAccountIdsExist',
  async (accountIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await ACCOUNT_MODEL.find({_id: {$in: accountIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      accountIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more accountIds cannot be found in the database.',
          'account._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the accountIds.  See the inner error for additional information',
          'mongoDb',
          'allAccountIdsExists',
          {accountIds: accountIds},
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
    account: Omit<Partial<databaseTypes.IAccount>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a account with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (account.user)
      tasks.push(
        idValidator(
          account.user._id as mongooseTypes.ObjectId,
          'User',
          UserModel.userIdExists
        )
      );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (account.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: account.createdAt}
      );
    if (account.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: account.updatedAt}
      );
    if ((account as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The account._id is immutable and cannot be changed',
        {_id: (account as Record<string, unknown>)['_id']}
      );
  }
);

// CREATE
SCHEMA.static(
  'createAccount',
  async (input: IAccountCreateInput): Promise<databaseTypes.IAccount> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [user] = await Promise.all([
        ACCOUNT_MODEL.validateUser(input.user),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IAccountDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        type: input.type,
        userId: input.userId,
        provider: input.provider,
        providerAccountId: input.providerAccountId,
        refresh_token: input.refresh_token,
        refresh_token_expires_in: input.refresh_token_expires_in,
        access_token: input.access_token,
        expires_at: input.expires_at,
        token_type: input.token_type,
        scope: input.scope,
        id_token: input.id_token,
        session_state: input.session_state,
        oauth_token_secret: input.oauth_token_secret,
        oauth_token: input.oauth_token,
        user: user,
      };
      try {
        await ACCOUNT_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IAccountDocument',
          resolvedInput,
          err
        );
      }
      const accountDocument = (
        await ACCOUNT_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = accountDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the account.  See the inner error for additional details',
          'mongoDb',
          'addAccount',
          {},
          err
        );
      }
    }
    if (id) return await ACCOUNT_MODEL.getAccountById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the account may not have been created.  I have no other information to provide.'
      );
  }
);

// READ
SCHEMA.static('getAccountById', async (accountId: mongooseTypes.ObjectId) => {
  try {
    const accountDocument = (await ACCOUNT_MODEL.findById(accountId)
      .populate('type')
      .populate('provider')
      .populate('token_type')
      .populate('session_state')
      .populate('user')
      .lean()) as databaseTypes.IAccount;
    if (!accountDocument) {
      throw new error.DataNotFoundError(
        `Could not find a account with the _id: ${accountId}`,
        'account_id',
        accountId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (accountDocument as any)['__v'];

    delete (accountDocument as any).user?.['__v'];

    return accountDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getAccountById',
        err
      );
  }
});

SCHEMA.static(
  'queryAccounts',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await ACCOUNT_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find accounts with the filter: ${filter}`,
          'queryAccounts',
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

      const accountDocuments = (await ACCOUNT_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('type')
        .populate('provider')
        .populate('token_type')
        .populate('session_state')
        .populate('user')
        .lean()) as databaseTypes.IAccount[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      accountDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        delete (doc as any).user?.['__v'];
      });

      const retval: IQueryResult<databaseTypes.IAccount> = {
        results: accountDocuments,
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
          'An unexpected error occurred while getting the accounts.  See the inner error for additional information',
          'mongoDb',
          'queryAccounts',
          err
        );
    }
  }
);

// UPDATE
SCHEMA.static(
  'updateAccountWithFilter',
  async (
    filter: Record<string, unknown>,
    account: Omit<Partial<databaseTypes.IAccount>, '_id'>
  ): Promise<void> => {
    try {
      await ACCOUNT_MODEL.validateUpdateObject(account);
      const updateDate = new Date();
      const transformedObject: Partial<IAccountDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in account) {
        const value = (account as Record<string, any>)[key];
        if (key === 'user')
          transformedObject.user =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await ACCOUNT_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No account document with filter: ${filter} was found',
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
          'update account',
          {filter: filter, account: account},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateAccountById',
  async (
    accountId: mongooseTypes.ObjectId,
    account: Omit<Partial<databaseTypes.IAccount>, '_id'>
  ): Promise<databaseTypes.IAccount> => {
    await ACCOUNT_MODEL.updateAccountWithFilter({_id: accountId}, account);
    return await ACCOUNT_MODEL.getAccountById(accountId);
  }
);

// DELETE
SCHEMA.static(
  'deleteAccountById',
  async (accountId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await ACCOUNT_MODEL.deleteOne({_id: accountId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A account with a _id: ${accountId} was not found in the database`,
          '_id',
          accountId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the account from the database. The account may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete account',
          {_id: accountId},
          err
        );
    }
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['account'];

const ACCOUNT_MODEL = model<IAccountDocument, IAccountStaticMethods>(
  'account',
  SCHEMA
);

export {ACCOUNT_MODEL as AccountModel};
