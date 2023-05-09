import { web as webTypes, database as databaseTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { Session } from 'next-auth';

/******************** INGESTION *********************/
/**
 * Gets signed urls to pass to the Qt engine
 * @note implements s3Manager.getSignedDataUrlPromise concurrently
 * @note requires signed body, so no go for now
 * @param workpaceId
 * @param projectId
 * @param keys
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

/**
 * @note could potentially be changed to multi-part upload in api Content-Type
 * @param acceptedFile
 * @param key
 * @param workspaceId
 * @param projectId
 * @returns
 */
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
 * @note I know it's not great form to put body on a get but we will refactor the query param / routing later
 * @param workpaceId
 * @param projectId
 * @param tableName
 * @param rowIds
 * @returns config
 */
export const _getRowIds = (
  workspaceId: string,
  projectId: string,
  tableName: string,
  rowIds: string[]
): webTypes.IFetchConfig => {
  return {
    url: `/api/data/rows`,
    options: {
      method: 'POST',
      body: {
        workspaceId: workspaceId,
        projectId: projectId,
        tableName: tableName,
        rowIds: rowIds,
      },
    },
    successMsg: 'Rows successfully selected',
  };
};

/**
 * Ingest files
 * @note implements processFiles()
 * @param payload
 */
export const _ingestFiles = (payload: webTypes.IClientSidePayload): webTypes.IFetchConfig => {
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

export const _createModel = (
  axis: webTypes.constants.AXIS,
  column: fileIngestionTypes.IColumn,
  project: databaseTypes.IProject,
  isFilter: boolean,
  fileHash: string
): webTypes.IFetchConfig => {
  return {
    url: `/api/etl/glyphengine`,
    options: {
      method: 'POST',
      body: { axis, column, project, isFilter, fileHash },
    },
    successMsg: 'File successfully added',
  };
};

/**
 * Created signed urls to upload files to S3
 * @note implements s3Manager.getSignedDataUrlPromise concurrently
 */

export const _getSignedDataUrls = (workspaceId: string, projectId: string, fileHash: string): webTypes.IFetchConfig => {
  return {
    url: `/api/etl/sign-data-urls`,
    options: {
      method: 'POST',
      body: { workspaceId, projectId, fileHash },
    },
    successMsg: 'File successfully added',
  };
};

/**
 *
 * @param project
 * @param data
 * @param project
 * @param session
 * @param url
 * @param camera
 * @returns stringified Qt Open Project payload
 */
export const _createOpenProject = (
  data: { sdtUrl: string; sgnUrl: string; sgcUrl: string },
  project: databaseTypes.IProject,
  session: Omit<Session & { status }, 'jwt' | 'user' | 'expires'>,
  url: string,
  camera?: {
    pos: {
      x: number;
      y: number;
      z: number;
    };
    dir: {
      x: number;
      y: number;
      z: number;
    };
  }
) => {
  return JSON.stringify({
    projectId: project?._id,
    workspaceId: project?.workspace._id,
    sdtUrl: data.sdtUrl,
    sgnUrl: data.sgnUrl,
    sgcUrl: data.sgcUrl,
    viewName: project?.viewName,
    camera: camera ?? undefined,
    apiLocation: `${url}/api`,
    sessionInformation:
      session.status === 'unauthenticated'
        ? {
            user: {
              name: 'James Graham',
              email: 'james@glyphx.co',
              userId: '645aa1458d6a87808abf59db',
            },
            expires: '2024-05-10T14:29:38.896Z',
          }
        : session,
  });
};
