import { database as databaseTypes, web as webTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';
// PROJECT MUTATIONS

/**
 * Duplicates existing project
 * @note not active
 * @param id // existing project id
 * @returns
 */
export const forkProject = () => {};

/**
 * Creates Project
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const _createDefaultProject = (
  workspaceId: string | mongooseTypes.ObjectId
): webTypes.IFetchConfig => {
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
 * Updates Project Name
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const updateProjectName = (id: string | mongooseTypes.ObjectId, name: string) => {};

/**
 * Updates Project Name
 * @note not active
 * @param id
 * @param description
 * @param members
 * @returns
 */
export const updateProject = (id: string | mongooseTypes.ObjectId, input: Partial<databaseTypes.IProject>) => {};

/**
 * Deletes a project
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const deleteProject = (id: string | mongooseTypes.ObjectId, name: string) => {};

/**
 * Removes filter from a project
 * @note not active
 * @param id
 * @param
 * @returns
 */
export const removeFilter = (id: string | mongooseTypes.ObjectId) => {};

/**
 * Apply filter to a state
 * @note not active
 * @param id
 * @param
 * @returns
 */
export const applyFilter = (id: string | mongooseTypes.ObjectId) => {};
