// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanUser = (user: databaseTypes.IUser) => {
  const cleanUser = {...user };
  delete cleanUser.createdAt;
  delete cleanUser.updatedAt;
  delete cleanUser.deletedAt;
  delete cleanUser._id;
  return cleanUser;
};

/**
 * Creates User
 * @returns
 */
export const _createUser = (user: databaseTypes.IUser): webTypes.IFetchConfig => {
  return {
    url: '/api/user/create',
    options: {
      body: user,
      method: 'POST',
    },
    successMsg: 'New user successfully created',
  };
};

/**
 * Updates a User
 * @param id
 * @param name
 * @returns
 */
export const _updateUser = (id: string, dirtyUser: databaseTypes.IUser): webTypes.IFetchConfig => {
  const user = cleanUser(dirtyUser);
  return {
    url: `/api/user/${id}`,
    options: {
      body: { user },
      method: 'PUT',
    },
    successMsg: 'User updated successfully',
  };
};

/**
 * Deletes a user
 * @param id
 * @returns
 */
export const _deleteUser = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/user/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'User successfully deleted.',
  };
};
