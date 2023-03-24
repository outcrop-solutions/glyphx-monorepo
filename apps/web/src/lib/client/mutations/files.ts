import { web as webTypes } from '@glyphx/types';
// FILE MUTATIONS

/**
 * Adds files
 * @note implements fileIngestion.process()
 * @param files corresponds to an array of file buffers
 */
export const _addFiles = (payload): webTypes.IFetchConfig => {
  return {
    url: `/api/files/ingest`,
    options: {
      method: 'POST',
      body: { payload },
    },
    successMsg: 'File successfully added',
  };
};

/**
 * Append files
 * @note implements fileIngestion.process()
 * @param files corresponds to an array of file buffers
 */
export const _appendFiles = (payload, files): webTypes.IFetchConfig => {
  return {
    url: `/api/files/ingest`,
    options: {
      headers: {
        payload: JSON.stringify(payload),
      },
      method: 'PUT',
      body: JSON.stringify(files),
    },
    successMsg: 'File successfully appended',
  };
};

/**
 * Delete files
 * @note implements fileIngestion.process()
 * @param payload corresponds to IPayload
 */
export const _deleteFiles = (payload): webTypes.IFetchConfig => {
  return {
    url: `/api/files/ingest`,
    options: {
      method: 'DELETE',
      body: JSON.stringify(payload),
    },
    successMsg: 'File successfully deleted',
  };
};
