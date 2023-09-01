import { databaseTypes, webTypes } from 'types';

const cleanConfig = (config) => {
  const cleanConfig = { ...config };
  delete cleanConfig.createdAt;
  delete cleanConfig.updatedAt;
  delete cleanConfig.deletedAt;
  delete cleanConfig._id;
  return cleanConfig;
};

// CONFIG MUTATIONS
/**
 * Creates Config
 * @note not active
 * @returns
 */
export const _createConfig = (config): webTypes.IFetchConfig => {
  return {
    url: '/api/config/create',
    options: {
      body: config,
      method: 'POST',
    },
    successMsg: 'New config successfully created',
  };
};

/**
 * Creates Config
 * @note not active
 * @param id
 * @param name
 * @returns
 */
export const _updateConfig = (id: string, dirtyConfig: databaseTypes.IModelConfig): webTypes.IFetchConfig => {
  const config = cleanConfig(dirtyConfig);
  return {
    url: `/api/config/${id}`,
    options: {
      body: { config },
      method: 'PUT',
    },
    successMsg: 'Config updated successfully',
  };
};

/**
 * Deletes a config
 * @note not active
 * @param id
 * @returns
 */
export const _deleteConfig = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/config/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'Config successfully deleted.',
  };
};
