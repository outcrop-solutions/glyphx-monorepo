// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanState = (state: databaseTypes.IState) => {
  const cleanState = {...state};
  delete cleanState.createdAt;
  delete cleanState.updatedAt;
  delete cleanState.deletedAt;
  delete cleanState._id;
  return cleanState;
};

/**
 * Creates State
 * @returns
 */
export const _createState = (
  state: databaseTypes.IState
): webTypes.IFetchConfig => {
  return {
    url: '/api/state/create',
    options: {
      body: state,
      method: 'POST',
    },
    successMsg: 'New state successfully created',
  };
};

/**
 * Updates a State
 * @param id
 * @param name
 * @returns
 */
export const _updateState = (
  id: string,
  dirtyState: databaseTypes.IState
): webTypes.IFetchConfig => {
  const state = cleanState(dirtyState);
  return {
    url: `/api/state/${id}`,
    options: {
      body: {state},
      method: 'PUT',
    },
    successMsg: 'State updated successfully',
  };
};

/**
 * Deletes a state
 * @param id
 * @returns
 */
export const _deleteState = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/state/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'State successfully deleted.',
  };
};
