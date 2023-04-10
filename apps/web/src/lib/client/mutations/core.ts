import { web as webTypes, fileIngestion as fileIngestionTypes, database as databaseTypes } from '@glyphx/types';
import { getUrl } from 'config/constants';

/******************** INGESTION *********************/
/**
 * Gets signed urls to pass to the Qt engine
 * @note implements s3Manager.getSignedDataUrlPromise concurrently
 * @note requires signed body, so no go for nwo
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
    url: `/api/etl/upload?workspaceId=${workspaceId}&projectId=${projectId}&key=${key}`,
    options: {
      method: 'POST',
      body: acceptedFile,
    },
    successMsg: 'File successfully added',
  };
};

/**
 * @note I know it's not great form to put body on a get but we will refactor the query param / routing later
 * @param workpaceId
 * @param projectId
 * @param tableName
 * @returns config
 */
export const _getDataGrid = (workspaceId: string, projectId: string, tableName: string): webTypes.IFetchConfig => {
  return {
    url: `/api/data/grid`,
    options: {
      method: 'POST',
      body: {
        workspaceId: workspaceId,
        projectId: projectId,
        tableName: tableName,
      },
    },
    successMsg: 'File successfully loaded',
  };
};

/**
 * Ingest files
 * @note implements fileIngestion.process()
 * @param files corresponds to an array of file buffers
 */
export const _ingestFiles = (payload): webTypes.IFetchConfig => {
  return {
    url: `/api/etl/ingest`,
    options: {
      method: 'POST',
      body: { payload },
    },
    successMsg: 'File successfully added',
  };
};

/******************** ETL *********************/

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
 *
 * @param project
 * @param data
 * @returns stringified Qt Open Project payload
 */
export const _createOpenProject = (data, project, session) => {
  console.log({
    projectId: project?._id,
    workspaceId: project?.workspace._id,
    sdtUrl: data.sdtUrl,
    sgnUrl: data.sgnUrl,
    sgcUrl: data.sgcUrl,
    viewName: project?.viewName,
    apiLocation: `${getUrl()}/api`,
    sessionInformation:
      session.status === 'unauthenticated'
        ? {
            user: {
              email: 'jp@glyphx.co',
              userId: '642ed599d2c489175363dd8b',
            },
            expires: '2023-05-10T14:29:38.896Z',
          }
        : session,
  });
  return JSON.stringify({
    projectId: project?._id,
    workspaceId: project?.workspace._id,
    sdtUrl: data.sdtUrl,
    sgnUrl: data.sgnUrl,
    sgcUrl: data.sgcUrl,
    viewName: project?.viewName,
    apiLocation: `${getUrl()}/api`,
    sessionInformation:
      session.status === 'unauthenticated'
        ? {
            user: {
              name: 'James Graham',
              email: 'jp@glyphx.co',
              userId: '642ed599d2c489175363dd8b',
            },
            expires: '2023-05-10T14:29:38.896Z',
          }
        : session,
  });
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
