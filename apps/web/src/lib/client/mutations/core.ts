import { web as webTypes } from '@glyphx/types';
// FILE MUTATIONS

/**
 * Adds files
 * @note implements fileIngestion.process()
 * @param files corresponds to an array of file buffers
 */

export const _createModel = (payload: webTypes.ICreateModelPayload): webTypes.IFetchConfig => {
  return {
    url: `/api/etl/glyphengine`,
    options: {
      method: 'POST',
      body: { ...payload },
    },
    successMsg: 'File successfully added',
  };
};
