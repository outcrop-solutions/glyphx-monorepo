import { web as webTypes } from '@glyphx/types';
// FILE MUTATIONS

/**
 * Calls the glyph engine to create data files
 * @note implements glyphengine.process()
 * @param payload corresponds to the glyph engine payload
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

/**
 * Calls the glyph engine to create data files
 * @note implements glyphengine.process()
 * @param payload corresponds to the glyph engine payload
 */

export const _getSignedDataUrls = (workspaceId: string, projectId: string): webTypes.IFetchConfig => {
  return {
    url: `/api/etl/sign-data-urls`,
    options: {
      method: 'POST',
      body: { workspaceId, projectId },
    },
    successMsg: 'File successfully added',
  };
};
/**
 * Calls the glyph engine to create data files
 * @note implements glyphengine.process()
 * @param payload corresponds to the glyph engine payload
 */

export const _getSignedUploadUrls = (workspaceId: string, projectId: string, keys: string[]): webTypes.IFetchConfig => {
  return {
    url: `/api/etl/sign-upload-urls`,
    options: {
      method: 'POST',
      body: { workspaceId, projectId, keys },
    },
    successMsg: 'File successfully added',
  };
};

export const _uploadFile = (acceptedFile: File, signedUrl: string): webTypes.IFetchConfig => {
  return {
    url: signedUrl,
    options: {
      method: 'PUT',
      body: acceptedFile,
    },
    successMsg: 'File successfully added',
  };
};
