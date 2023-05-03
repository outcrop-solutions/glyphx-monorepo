import { web as webTypes } from '@glyphx/types';

// STATE MUTATIONS

/**
 * Creates a new state
 * @note uses stateService.createState() in business package
 * @param name corresponds to state.name in mongoDB
 */
export const _createState = (name: string): webTypes.IFetchConfig => {
  return {
    url: '/api/state',
    options: {
      body: { name: name },
      method: 'POST',
    },
    successMsg: 'State successfully created',
  };
};

/**
 * Deletes a state
 * @note uses stateService.deleteState() in business package
 * @param slug corresponds to state.slug in mongoDB
 */
export const _deleteState = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/state/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'State has been deleted',
  };
};

/**
 * Updates a state's name
 * @note uses stateService.updateStateName() in business package
 * @param slug corresponds to state.slug in mongoDB
 * @param name corresponds to state.name in mongoDB
 */
export const _updateStateName = ({ id, name }: { id: string; name: string }): webTypes.IFetchConfig => {
  return {
    url: `/api/state/${id}`,
    options: {
      body: { name },
      method: 'PUT',
    },
    successMsg: 'State name successfully updated!',
  };
};
