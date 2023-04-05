import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
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
 * Created signed urls to upload files to S3
 * @note implements s3Manager.getSignedDataUrlPromise concurrently
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
 * Gets signed urls to pass to the Qt engine
 * @note implements s3Manager.getSignedDataUrlPromise concurrently
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

export const _uploadFile = (acceptedFile, key: string): webTypes.IFetchConfig => {
  return {
    url: `/api/etl/upload`,
    options: {
      headers: {
        key: key,
      },
      method: 'POST',
      body: acceptedFile,
    },
    successMsg: 'File successfully added',
  };
};

// TODO: fix cors error to use this
// export const _uploadFile = (acceptedFile: File, signedUrl: string): webTypes.IFetchConfig => {
//   return {
//     url: signedUrl,
//     options: {
//       method: 'POST',
//       body: acceptedFile,
//     },
//     successMsg: 'File successfully added',
//   };
// };
