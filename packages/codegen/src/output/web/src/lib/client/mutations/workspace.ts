// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanWorkspace = (workspace: databaseTypes.IWorkspace) => {
  const cleanWorkspace = {...workspace};
  delete cleanWorkspace.createdAt;
  delete cleanWorkspace.updatedAt;
  delete cleanWorkspace.deletedAt;
  delete cleanWorkspace._id;
  return cleanWorkspace;
};

/**
 * Creates Workspace
 * @returns
 */
export const _createWorkspace = (
  workspace: databaseTypes.IWorkspace
): webTypes.IFetchConfig => {
  return {
    url: '/api/workspace/create',
    options: {
      body: workspace,
      method: 'POST',
    },
    successMsg: 'New workspace successfully created',
  };
};

/**
 * Updates a Workspace
 * @param id
 * @param name
 * @returns
 */
export const _updateWorkspace = (
  id: string,
  dirtyWorkspace: databaseTypes.IWorkspace
): webTypes.IFetchConfig => {
  const workspace = cleanWorkspace(dirtyWorkspace);
  return {
    url: `/api/workspace/${id}`,
    options: {
      body: {workspace},
      method: 'PUT',
    },
    successMsg: 'Workspace updated successfully',
  };
};

/**
 * Deletes a workspace
 * @param id
 * @returns
 */
export const _deleteWorkspace = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'Workspace successfully deleted.',
  };
};
