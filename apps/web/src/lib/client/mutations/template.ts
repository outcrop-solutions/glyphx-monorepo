import { web as webTypes } from '@glyphx/types';
/**
 * Creates Project Template from a project
 * @param id
 * @param properties // Property[]
 * @returns
 */
export const _createProjectTemplate = (
  projectId: string,
  projectName: string,
  projectDesc: string,
  properties: Record<string, webTypes.Property>
): webTypes.IFetchConfig => {
  return {
    url: '/api/template/create',
    options: {
      body: { projectId, projectName, projectDesc, properties },
      method: 'POST',
    },
    successMsg: 'New project template successfully created',
  };
};
