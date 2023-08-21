import { database as databaseTypes, web as webTypes } from '@glyphx/types';
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
export const _updateConfig = (id: string, config: databaseTypes.IModelConfig): webTypes.IFetchConfig => {
  return {
    url: `/api/config/${id}`,
    options: {
      body: config,
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
