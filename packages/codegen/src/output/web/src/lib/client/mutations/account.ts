// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanAccount = (account: databaseTypes.IAccount) => {
  const cleanAccount = {...account };
  delete cleanAccount.createdAt;
  delete cleanAccount.updatedAt;
  delete cleanAccount.deletedAt;
  delete cleanAccount._id;
  return cleanAccount;
};

/**
 * Creates Account
 * @returns
 */
export const _createAccount = (account: databaseTypes.IAccount): webTypes.IFetchConfig => {
  return {
    url: '/api/account/create',
    options: {
      body: account,
      method: 'POST',
    },
    successMsg: 'New account successfully created',
  };
};

/**
 * Updates a Account
 * @param id
 * @param name
 * @returns
 */
export const _updateAccount = (id: string, dirtyAccount: databaseTypes.IAccount): webTypes.IFetchConfig => {
  const account = cleanAccount(dirtyAccount);
  return {
    url: `/api/account/${id}`,
    options: {
      body: { account },
      method: 'PUT',
    },
    successMsg: 'Account updated successfully',
  };
};

/**
 * Deletes a account
 * @param id
 * @returns
 */
export const _deleteAccount = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/account/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'Account successfully deleted.',
  };
};
