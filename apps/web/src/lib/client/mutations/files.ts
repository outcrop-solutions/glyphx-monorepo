import { web as webTypes } from '@glyphx/types';
// FILE MUTATIONS

/**
 * Ingest files
 * @note implements fileIngestion.process()
 * @param files corresponds to an array of file buffers
 */
export const _ingestFiles = (payload): webTypes.IFetchConfig => {
  return {
    url: `/api/files/ingest`,
    options: {
      method: 'POST',
      body: { payload },
    },
    successMsg: 'File successfully added',
  };
};
