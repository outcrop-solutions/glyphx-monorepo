// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanProject = (project: databaseTypes.IProject) => {
  const cleanProject = {...project};
  delete cleanProject.createdAt;
  delete cleanProject.updatedAt;
  delete cleanProject.deletedAt;
  delete cleanProject._id;
  return cleanProject;
};

/**
 * Creates Project
 * @returns
 */
export const _createProject = (
  project: databaseTypes.IProject
): webTypes.IFetchConfig => {
  return {
    url: '/api/project/create',
    options: {
      body: project,
      method: 'POST',
    },
    successMsg: 'New project successfully created',
  };
};

/**
 * Updates a Project
 * @param id
 * @param name
 * @returns
 */
export const _updateProject = (
  id: string,
  dirtyProject: databaseTypes.IProject
): webTypes.IFetchConfig => {
  const project = cleanProject(dirtyProject);
  return {
    url: `/api/project/${id}`,
    options: {
      body: {project},
      method: 'PUT',
    },
    successMsg: 'Project updated successfully',
  };
};

/**
 * Deletes a project
 * @param id
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
