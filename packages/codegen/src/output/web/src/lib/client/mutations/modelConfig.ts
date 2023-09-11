// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes, webTypes} from 'types';

const cleanModelConfig = (modelConfig: databaseTypes.IModelConfig) => {
  const cleanModelConfig = {...modelConfig};
  delete cleanModelConfig.createdAt;
  delete cleanModelConfig.updatedAt;
  delete cleanModelConfig.deletedAt;
  delete cleanModelConfig._id;
  return cleanModelConfig;
};

/**
 * Creates ModelConfig
 * @returns
 */
export const _createModelConfig = (
  modelConfig: databaseTypes.IModelConfig
): webTypes.IFetchConfig => {
  return {
    url: '/api/modelConfig/create',
    options: {
      body: modelConfig,
      method: 'POST',
    },
    successMsg: 'New modelConfig successfully created',
  };
};

/**
 * Updates a ModelConfig
 * @param id
 * @param name
 * @returns
 */
export const _updateModelConfig = (
  id: string,
  dirtyModelConfig: databaseTypes.IModelConfig
): webTypes.IFetchConfig => {
  const modelConfig = cleanModelConfig(dirtyModelConfig);
  return {
    url: `/api/modelConfig/${id}`,
    options: {
      body: {modelConfig},
      method: 'PUT',
    },
    successMsg: 'ModelConfig updated successfully',
  };
};

/**
 * Deletes a modelConfig
 * @param id
 * @returns
 */
export const _deleteModelConfig = (id: string): webTypes.IFetchConfig => {
  return {
    url: `/api/modelConfig/${id}`,
    options: {
      method: 'DELETE',
    },
    successMsg: 'ModelConfig successfully deleted.',
  };
};
