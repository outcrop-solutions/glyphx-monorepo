import {webTypes} from 'types';

// WORKSPACE MUTATIONS

/**
 * Creates a new workspace
 * @note uses workspaceService.createWorkspace() in business package
 * @param name corresponds to workspace.name in mongoDB
 */
export const _createWorkspace = (name: string): webTypes.IFetchConfig => {
  return {
    url: '/api/workspace',
    options: {
      body: {name: name},
      method: 'POST',
    },
    successMsg: 'Workspace successfully created',
  };
};

/**
 * Deletes a workspace
 * @note uses workspaceService.deleteWorkspace() in business package
 * @param id corresponds to workspace.id in mongoDB
 */
export const _deleteWorkspace = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'Workspace has been deleted',
  };
};

/**
 * Updates a workspace's name
 * @note uses workspaceService.updateWorkspaceName() in business package
 * @param slug corresponds to workspace.slug in mongoDB
 * @param name corresponds to workspace.name in mongoDB
 */
export const _updateWorkspaceName = ({id, name}: {id: string; name: string}): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/${id}/name`,
    options: {
      body: {name},
      method: 'PUT',
    },
    successMsg: 'Workspace name successfully updated!',
  };
};

/**
 * Updates a workspace's slug
 * @note uses workspaceService.updateWorkspaceSlug() in business package
 * @param slug corresponds to workspace.slug in mongoDB
 * @param newSlug corresponds to workspace.slug in mongoDB
 */
export const _updateWorkspaceSlug = ({
  workspaceId,
  newSlug,
}: {
  workspaceId: string;
  newSlug: string;
}): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/${workspaceId}/slug`,
    options: {
      body: {slug: newSlug},
      method: 'PUT',
    },
    successMsg: 'Workspace slug successfully updated!',
  };
};

/**
 * Updates a workspace's name
 * @note uses workspaceService.joinWorkspace() in business package
 * @param worspaceCode corresponds to workspace.slug in mongoDB
 */
export const _joinWorkspace = (workspaceCode: string): webTypes.IFetchConfig => {
  return {
    url: `/api/workspace/team/join`,
    options: {
      body: {workspaceCode: workspaceCode},
      method: 'POST',
    },
    successMsg: 'Accepted invitation!',
  };
};
