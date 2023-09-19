// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanUserAgent = (userAgent: databaseTypes.IUserAgent) => {
  const cleanUserAgent = {...userAgent };
  delete cleanUserAgent.createdAt;
  delete cleanUserAgent.updatedAt;
  delete cleanUserAgent.deletedAt;
  delete cleanUserAgent._id;
  return cleanUserAgent;
};

/**
 * Creates UserAgent
 * @returns
 */
export const _createUserAgent = (userAgent: databaseTypes.IUserAgent): webTypes.IFetchConfig => {
  return {
    url: '/api/userAgent/create',
    options: {
      body: userAgent,
      method: 'POST',
    },
    successMsg: 'New userAgent successfully created',
  };
};

/**
 * Updates a UserAgent
 * @param id
 * @param name
 * @returns
 */
export const _updateUserAgent = (id: string, dirtyUserAgent: databaseTypes.IUserAgent): webTypes.IFetchConfig => {
  const userAgent = cleanUserAgent(dirtyUserAgent);
  return {
    url: `/api/userAgent/${id}`,
    options: {
      body: { userAgent },
      method: 'PUT',
    },
    successMsg: 'UserAgent updated successfully',
  };
};

/**
 * Deletes a userAgent
 * @param id
 * @returns
 */
export const _deleteUserAgent = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/userAgent/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'UserAgent successfully deleted.',
  };
};
