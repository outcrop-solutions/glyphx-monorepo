import { databaseTypes, webTypes } from 'types';
// PROJECT MUTATIONS

/**
 * Creates Project
 * @param id
 * @param name
 * @returns
 */
export const _createDefaultProject = (workspaceId: string): webTypes.IFetchConfig => {
  return {
    url: '/api/project/create',
    options: {
      body: { name: 'Untitled', workspaceId },
      method: 'POST',
    },
    successMsg: 'New project successfully created',
  };
};
/**
 * Creates Project
 * @note not active
 * @param id
 * @param name
 * @param description
 * @returns
 */
export const _createProject = (workspaceId: string, name: string, description: string): webTypes.IFetchConfig => {
  return {
    url: '/api/project/create',
    options: {
      body: { name: name, description: description, workspaceId },
      method: 'POST',
    },
    successMsg: 'New project successfully created',
  };
};

/**
 * Creates Project
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const _updateProjectState = (
  id: string,
  state: Omit<
    databaseTypes.IState,
    | 'project'
    | '_id'
    | 'createdAt'
    | 'updatedAt'
    | 'description'
    | 'fileSystemHash'
    | 'payloadHash'
    | 'fileSystem'
    | 'version'
    | 'static'
    | 'camera'
    | 'createdBy'
  >
): webTypes.IFetchConfig => {
  return {
    url: `/api/project/${id}`,
    options: {
      body: { state },
      method: 'PUT',
    },
    successMsg: 'Project updated successfully',
  };
};

/**
 * Deletes a project
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const _deleteProject = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/project/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'Project successfully deleted.',
  };
};

/**
 * Updates Project Name
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const updateProjectName = (id: string, name: string) => {};
