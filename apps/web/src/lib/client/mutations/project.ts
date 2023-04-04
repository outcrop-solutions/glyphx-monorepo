import { database as databaseTypes, web as webTypes } from '@glyphx/types';
// PROJECT MUTATIONS

/**
 * Creates Project
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const _createDefaultProject = (workspaceId: string): webTypes.IFetchConfig => {
  return {
    url: '/api/project',
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
 * Duplicates existing project
 * @note not active
 * @param id // existing project id
 * @returns
 */
export const forkProject = () => {};

/**
 * Updates Project Name
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const updateProjectName = (id: string, name: string) => {};

/**
 * Updates Project Name
 * @note not active
 * @param id
 * @param description
 * @param members
 * @returns
 */
export const updateProject = (id: string, input: Partial<databaseTypes.IProject>) => {};

/**
 * Removes filter from a project
 * @note not active
 * @param id
 * @param
 * @returns
 */
export const removeFilter = (id: string) => {};

/**
 * Apply filter to a state
 * @note not active
 * @param id
 * @param
 * @returns
 */
export const applyFilter = (id: string) => {};
