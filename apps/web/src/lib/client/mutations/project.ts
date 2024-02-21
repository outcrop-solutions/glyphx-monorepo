import {databaseTypes, webTypes} from 'types';
// PROJECT MUTATIONS

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
      body: {state},
      method: 'PUT',
    },
    successMsg: 'Project updated successfully',
  };
};
