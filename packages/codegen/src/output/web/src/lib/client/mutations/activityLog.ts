// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanActivityLog = (activityLog: databaseTypes.IActivityLog) => {
  const cleanActivityLog = {...activityLog };
  delete cleanActivityLog.createdAt;
  delete cleanActivityLog.updatedAt;
  delete cleanActivityLog.deletedAt;
  delete cleanActivityLog._id;
  return cleanActivityLog;
};

/**
 * Creates ActivityLog
 * @returns
 */
export const _createActivityLog = (activityLog: databaseTypes.IActivityLog): webTypes.IFetchConfig => {
  return {
    url: '/api/activityLog/create',
    options: {
      body: activityLog,
      method: 'POST',
    },
    successMsg: 'New activityLog successfully created',
  };
};

/**
 * Updates a ActivityLog
 * @param id
 * @param name
 * @returns
 */
export const _updateActivityLog = (id: string, dirtyActivityLog: databaseTypes.IActivityLog): webTypes.IFetchConfig => {
  const activityLog = cleanActivityLog(dirtyActivityLog);
  return {
    url: `/api/activityLog/${id}`,
    options: {
      body: { activityLog },
      method: 'PUT',
    },
    successMsg: 'ActivityLog updated successfully',
  };
};

/**
 * Deletes a activityLog
 * @param id
 * @returns
 */
export const _deleteActivityLog = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/activityLog/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'ActivityLog successfully deleted.',
  };
};
