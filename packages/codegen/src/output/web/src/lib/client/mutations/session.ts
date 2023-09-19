// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanSession = (session: databaseTypes.ISession) => {
  const cleanSession = {...session };
  delete cleanSession.createdAt;
  delete cleanSession.updatedAt;
  delete cleanSession.deletedAt;
  delete cleanSession._id;
  return cleanSession;
};

/**
 * Creates Session
 * @returns
 */
export const _createSession = (session: databaseTypes.ISession): webTypes.IFetchConfig => {
  return {
    url: '/api/session/create',
    options: {
      body: session,
      method: 'POST',
    },
    successMsg: 'New session successfully created',
  };
};

/**
 * Updates a Session
 * @param id
 * @param name
 * @returns
 */
export const _updateSession = (id: string, dirtySession: databaseTypes.ISession): webTypes.IFetchConfig => {
  const session = cleanSession(dirtySession);
  return {
    url: `/api/session/${id}`,
    options: {
      body: { session },
      method: 'PUT',
    },
    successMsg: 'Session updated successfully',
  };
};

/**
 * Deletes a session
 * @param id
 * @returns
 */
export const _deleteSession = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/session/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'Session successfully deleted.',
  };
};
