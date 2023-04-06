import { web as webTypes, fileIngestion as fileIngestionTypes, database as databaseTypes } from '@glyphx/types';
import { getUrl } from 'config/constants';
// FILE MUTATIONS

/**
 * Calls the glyph engine to create data files
 * @note implements glyphengine.process()
 * @param payload corresponds to the glyph engine payload
 */

export const _createModel = (axis, column, project: databaseTypes.IProject): webTypes.IFetchConfig => {
  return {
    url: `/api/etl/glyphengine`,
    options: {
      method: 'POST',
      body: { axis, column, project },
    },
    successMsg: 'File successfully added',
  };
};

/**
 *
 * @param project
 * @param data
 * @returns stringified Qt Open Project payload
 */
export const _createOpenProject = (data, project, session) => {
  return JSON.stringify({
    projectId: project?._id,
    workspaceId: project?.workspace._id,
    sdtUrl: data.sdturl,
    sgnUrl: data.sgnurl,
    sgcUrl: data.sgcurl,
    viewName: project?.viewName,
    apiLocation: `${getUrl()}/api`,
    sessionInformation: session,
  });
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

export const _uploadFile = (
  acceptedFile: ArrayBuffer,
  key: string,
  workspaceId: string,
  projectId: string
): webTypes.IFetchConfig => {
  return {
    url: `/api/etl/upload`,
    options: {
      headers: {
        key: key,
        workspaceId: workspaceId,
        projectId: projectId,
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
