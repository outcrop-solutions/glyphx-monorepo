import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes, Schema, model} from 'mongoose';
import {
  IAccountMethods,
  IAccountStaticMethods,
  IAccountDocument,
} from '../interfaces';
import {error} from '@glyphx/core';
import {UserModel} from './user';

const schema = new Schema<
  IAccountDocument,
  IAccountStaticMethods,
  IAccountMethods
>({
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

schema.static(
  'accountIdExists',
  async (accountId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await AccountModel.findById(accountId, ['_id']);
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
schema.static(
  'getAccountById',
  async (accountId: mongooseTypes.ObjectId) => {}
);

schema.static(
  'validateUpdateObject',
  async (
    account: Omit<Partial<databaseTypes.IAccount>, '_id'>
  ): Promise<void> => {
    if (account.user?._id && !(await UserModel.userIdExists(account.user?._id)))
      throw new error.InvalidOperationError(
        `A User with the _id: ${account.user._id} cannot be found`,
        {userId: account.user._id}
      );

    if ((account as unknown as databaseTypes.IAccount)._id)
      throw new error.InvalidOperationError(
        "An Account's _id is imutable and cannot be changed",
        {
          _id: (account as unknown as databaseTypes.IAccount)._id,
        }
      );
  }
);

schema.static(
  'updateAccountWithFilter',
  async (
    filter: Record<string, unknown>,
    account: Omit<Partial<databaseTypes.IAccount>, '_id'>
  ): Promise<boolean> => {
    //TODO: we need to set and validate the updateDate and make the createdDate immutable.
    await AccountModel.validateUpdateObject(account);
    try {
      const transformedAccount: Partial<IAccountDocument> &
        Record<string, any> = {};
      for (const key in account) {
        const value = (account as Record<string, any>)[key];
        if (key !== 'user') transformedAccount[key] = value;
        else {
          //we only store the user id in our account collection
          transformedAccount[key] = value._id;
        }
      }
      const updateResult = await AccountModel.updateOne(
        filter,
        transformedAccount
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No account document with filter: ${filter} was found`,
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

schema.static(
  'updateAccountById',
  async (
    accountId: mongooseTypes.ObjectId,
    account: Omit<Partial<databaseTypes.IAccount>, '_id'>
  ): Promise<databaseTypes.IAccount> => {
    await AccountModel.updateAccountWithFilter({_id: accountId}, account);
    const retval = await AccountModel.getAccountById(accountId);
    return retval;
  }
);

schema.static(
  'createAccount',
  async (
    input: Omit<databaseTypes.IAccount, '_id'>
  ): Promise<databaseTypes.IAccount> => {
    const userExists = await UserModel.userIdExists(
      input.user._id as mongooseTypes.ObjectId
    );
    if (!userExists)
      throw new error.InvalidArgumentError(
        `A user with _id : ${input.user._id} cannot be found`,
        'user._id',
        input.user._id
      );

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
      user: input.user._id as mongooseTypes.ObjectId,
    };

    try {
      await AccountModel.validate(transformedDocument);
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
        await AccountModel.create([
          transformedDocument,
          {validateBeforeSave: false},
        ])
      )[0];
      return await AccountModel.getAccountById(createdDocument._id);
    } catch (err) {
      throw new error.DatabaseOperationError(
        'An unexpected error occurred wile creating the account. See the inner error for additional information',
        'mongoDb',
        'create account',
        input,
        err
      );
    }
  }
);

schema.static(
  'deleteAccountById',
  async (accountId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await AccountModel.deleteOne({_id: accountId});
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
          `An unexpected error occurred while deleteing the account from the database. The account may still exist.  See the inner error for additional information`,
          'mongoDb',
          'delete account',
          {_id: accountId},
          err
        );
    }
  }
);

const AccountModel = model<IAccountDocument, IAccountStaticMethods>(
  'account',
  schema
);

export {AccountModel};
