// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanProcessTracking = (processTracking: databaseTypes.IProcessTracking) => {
  const cleanProcessTracking = {...processTracking };
  delete cleanProcessTracking.createdAt;
  delete cleanProcessTracking.updatedAt;
  delete cleanProcessTracking.deletedAt;
  delete cleanProcessTracking._id;
  return cleanProcessTracking;
};

/**
 * Creates ProcessTracking
 * @returns
 */
export const _createProcessTracking = (processTracking: databaseTypes.IProcessTracking): webTypes.IFetchConfig => {
  return {
    url: '/api/processTracking/create',
    options: {
      body: processTracking,
      method: 'POST',
    },
    successMsg: 'New processTracking successfully created',
  };
};

/**
 * Updates a ProcessTracking
 * @param id
 * @param name
 * @returns
 */
export const _updateProcessTracking = (id: string, dirtyProcessTracking: databaseTypes.IProcessTracking): webTypes.IFetchConfig => {
  const processTracking = cleanProcessTracking(dirtyProcessTracking);
  return {
    url: `/api/processTracking/${id}`,
    options: {
      body: { processTracking },
      method: 'PUT',
    },
    successMsg: 'ProcessTracking updated successfully',
  };
};

/**
 * Deletes a processTracking
 * @param id
 * @returns
 */
export const _deleteProcessTracking = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/processTracking/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'ProcessTracking successfully deleted.',
  };
};
