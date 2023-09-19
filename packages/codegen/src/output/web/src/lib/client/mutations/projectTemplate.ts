// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanProjectTemplate = (projectTemplate: databaseTypes.IProjectTemplate) => {
  const cleanProjectTemplate = {...projectTemplate };
  delete cleanProjectTemplate.createdAt;
  delete cleanProjectTemplate.updatedAt;
  delete cleanProjectTemplate.deletedAt;
  delete cleanProjectTemplate._id;
  return cleanProjectTemplate;
};

/**
 * Creates ProjectTemplate
 * @returns
 */
export const _createProjectTemplate = (projectTemplate: databaseTypes.IProjectTemplate): webTypes.IFetchConfig => {
  return {
    url: '/api/projectTemplate/create',
    options: {
      body: projectTemplate,
      method: 'POST',
    },
    successMsg: 'New projectTemplate successfully created',
  };
};

/**
 * Updates a ProjectTemplate
 * @param id
 * @param name
 * @returns
 */
export const _updateProjectTemplate = (id: string, dirtyProjectTemplate: databaseTypes.IProjectTemplate): webTypes.IFetchConfig => {
  const projectTemplate = cleanProjectTemplate(dirtyProjectTemplate);
  return {
    url: `/api/projectTemplate/${id}`,
    options: {
      body: { projectTemplate },
      method: 'PUT',
    },
    successMsg: 'ProjectTemplate updated successfully',
  };
};

/**
 * Deletes a projectTemplate
 * @param id
 * @returns
 */
export const _deleteProjectTemplate = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/projectTemplate/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'ProjectTemplate successfully deleted.',
  };
};
