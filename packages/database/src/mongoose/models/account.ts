import {databaseTypes, IQueryResult} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {IAccountMethods, IAccountStaticMethods, IAccountDocument, IAccountCreateInput} from '../interfaces';
import {error} from 'core';
import {UserModel} from './user';
import {DBFormatter} from '../../lib/format';

const SCHEMA = new Schema<IAccountDocument, IAccountStaticMethods, IAccountMethods>({
  type: {
    type: Number,
    required: true,
    enum: databaseTypes.constants.ACCOUNT_TYPE,
    default: databaseTypes.constants.ACCOUNT_TYPE.CUSTOMER,
  },
  provider: {
    type: Number,
    required: true,
    enum: databaseTypes.constants.ACCOUNT_PROVIDER,
    default: databaseTypes.constants.ACCOUNT_PROVIDER.COGNITO,
  },
  userId: {type: String, required: false},
  providerAccountId: {type: String, required: true},
  refresh_token: {type: String, required: false},
  refresh_token_expires_in: {type: Number, required: false},
  access_token: {type: String, required: false},
  expires_at: {type: Number, required: false},
  token_type: {
    type: Number,
    required: false,
    enum: databaseTypes.constants.TOKEN_TYPE,
    default: databaseTypes.constants.TOKEN_TYPE.ACCESS,
  },
  scope: {type: String, required: false},
  id_token: {type: String, required: false},
  session_state: {
    type: Number,
    required: true,
    enum: databaseTypes.constants.SESSION_STATE,
    default: databaseTypes.constants.SESSION_STATE.NEW,
  },
  oauth_token_secret: {type: String, required: true},
  oauth_token: {type: String, required: true},
  user: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
});

SCHEMA.static('accountIdExists', async (accountId: mongooseTypes.ObjectId): Promise<boolean> => {
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
});

SCHEMA.static('allAccountIdsExist', async (accountIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await ACCOUNT_MODEL.find({_id: {$in: accountIds}}, ['_id'])) as {_id: mongooseTypes.ObjectId}[];

    accountIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
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
});

SCHEMA.static('getAccountById', async (accountId: string) => {
  try {
    const accountDocument = (await ACCOUNT_MODEL.findById(accountId).populate('user').lean()) as databaseTypes.IAccount;
    if (!accountDocument) {
      throw new error.DataNotFoundError(`Could not find a account with the _id: ${accountId}`, 'account_id', accountId);
    }

    const format = new DBFormatter();
    return format.toJS(accountDocument);
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the account.  See the inner error for additional information',
        'mongoDb',
        'getAccountById',
        err
      );
  }
});

SCHEMA.static('queryAccounts', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
  try {
    const count = await ACCOUNT_MODEL.count(filter);

    if (!count) {
      throw new error.DataNotFoundError(`Could not find accounts with the filter: ${filter}`, 'queryAccounts', filter);
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
      .populate('user')
      .lean()) as databaseTypes.IAccount[];

    const format = new DBFormatter();
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    const formattedAccounts = accountDocuments?.map((doc: databaseTypes.IAccount) => {
      return format.toJS(doc);
    });

    const retval: IQueryResult<databaseTypes.IAccount> = {
      results: formattedAccounts as unknown as databaseTypes.IAccount[],
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while querying the accounts.  See the inner error for additional information',
        'mongoDb',
        'queryProjectTemplates',
        err
      );
  }
});

SCHEMA.static('validateUpdateObject', async (account: Omit<Partial<databaseTypes.IAccount>, '_id'>): Promise<void> => {
  if (account.user?._id && !(await UserModel.userIdExists(account.user?._id)))
    throw new error.InvalidOperationError(`A User with the _id: ${account.user._id} cannot be found`, {
      userId: account.user._id,
    });

  if ((account as unknown as databaseTypes.IAccount)._id)
    throw new error.InvalidOperationError("An Account's _id is imutable and cannot be changed", {
      _id: (account as unknown as databaseTypes.IAccount)._id,
    });
});

SCHEMA.static(
  'updateAccountWithFilter',
  async (filter: Record<string, unknown>, account: Omit<Partial<databaseTypes.IAccount>, '_id'>): Promise<boolean> => {
    //TODO: we need to set and validate the updateDate and make the createdDate immutable.
    await ACCOUNT_MODEL.validateUpdateObject(account);
    try {
      const transformedAccount: Partial<IAccountDocument> & Record<string, any> = {};
      for (const key in account) {
        const value = (account as Record<string, any>)[key];
        if (key !== 'user') transformedAccount[key] = value;
        else {
          //we only store the user id in our account collection
          transformedAccount[key] = value._id;
        }
      }
      const updateResult = await ACCOUNT_MODEL.updateOne(filter, transformedAccount);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(`No account document with filter: ${filter} was found`, 'filter', filter);
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the account with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update account',
          {filter: filter, account: account},
          err
        );
    }
    return true;
  }
);

SCHEMA.static(
  'updateAccountById',
  async (accountId: string, account: Omit<Partial<databaseTypes.IAccount>, '_id'>): Promise<databaseTypes.IAccount> => {
    await ACCOUNT_MODEL.updateAccountWithFilter({_id: accountId}, account);
    const retval = await ACCOUNT_MODEL.getAccountById(accountId);
    const format = new DBFormatter();
    return format.toJS(retval);
  }
);

SCHEMA.static('createAccount', async (input: IAccountCreateInput): Promise<databaseTypes.IAccount> => {
  const userId =
    typeof input.user === 'string' ? new mongooseTypes.ObjectId(input.user) : new mongooseTypes.ObjectId(input.user.id);

  const userExists = await UserModel.userIdExists(userId);
  if (!userExists)
    throw new error.InvalidArgumentError(`A user with _id : ${userId} cannot be found`, 'user._id', input.userId);

  const transformedDocument: IAccountDocument = {
    type: input.type,
    provider: input.provider,
    providerAccountId: input.providerAccountId,
    refresh_token: input.refresh_token,
    refresh_token_expires_in: input.refresh_token_expires_in,
    access_token: input.refresh_token,
    expires_at: input.expires_at,
    token_type: input.token_type,
    scope: input.scope,
    id_token: input.id_token,
    session_state: input.session_state,
    oauth_token: input.oauth_token,
    oauth_token_secret: input.oauth_token_secret,
    user: userId,
  };

  try {
    await ACCOUNT_MODEL.validate(transformedDocument);
  } catch (err) {
    throw new error.DataValidationError(
      'An error occurred while validating the account document.  See the inner error for additional details.',
      'account',
      transformedDocument,
      err
    );
  }

  try {
    const createdDocument = (
      await ACCOUNT_MODEL.create([transformedDocument], {
        validateBeforeSave: false,
      })
    )[0];
    return await ACCOUNT_MODEL.getAccountById(createdDocument._id.toString());
  } catch (err) {
    throw new error.DatabaseOperationError(
      'An unexpected error occurred wile creating the account. See the inner error for additional information',
      'mongoDb',
      'create account',
      input,
      err
    );
  }
});

SCHEMA.static('deleteAccountById', async (accountId: string): Promise<void> => {
  try {
    const results = await ACCOUNT_MODEL.deleteOne({_id: accountId});
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `An account with a _id: ${accountId} was not found in the database`,
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
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['account'];

const ACCOUNT_MODEL = model<IAccountDocument, IAccountStaticMethods>('account', SCHEMA);

export {ACCOUNT_MODEL as AccountModel};
