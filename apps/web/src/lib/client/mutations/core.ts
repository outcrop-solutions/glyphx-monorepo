import {webTypes, databaseTypes, fileIngestionTypes} from 'types';

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
      body: {workspaceId, projectId, keys},
    },
    successMsg: 'File successfully added',
  };
};

/**
 * @note could potentially be changed to multi-part upload in api Content-Type
 * @param acceptedFile
 * @param url
 * @returns
 */
export const _uploadFile = (acceptedFile: ArrayBuffer, url: string): webTypes.IFetchConfig => {
  return {
    url: url,
    options: {
      method: 'PUT',
      body: acceptedFile,
    },
    successMsg: 'File successfully uploaded',
  };
};

/**
 * @param workpaceId
 * @param projectId
 * @param tableName
 * @returns config
 */
export const _getDataGrid = (workspaceId: string, projectId: string, tableName: string): webTypes.IFetchConfig => {
  console.log({
    url: `/api/data/rows`,
    options: {
      method: 'POST',
      body: {
        workspaceId: workspaceId,
        projectId: projectId,
        tableName: tableName,
      },
    },
    successMsg: 'Rows successfully selected',
  });

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
  console.log({
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
  });

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
      body: {payload},
    },
    successMsg: 'File successfully ingested',
  };
};

/******************** ETL *********************/

/**
 * Calls the glyph engine to create data files
 * @note implements glyphengine.process()
 * @param payload corresponds to the glyph engine payload
 */

// iState should include a filehash, to determine whether filtering is available via checking against current fileHash

// modal state should also include a payload hash in order to uniquely store the data, as subsequent create state calls with the same fileSystem will override privious states with the same file system

export const _createModel = (
  project: Partial<databaseTypes.IProject>,
  isFilter: boolean,
  payloadHash: string
): webTypes.IFetchConfig => {
  const cleanProject = {
    ...project,
    stateHistory: [],
  };

  return {
    url: `/api/etl/glyphengine`,
    options: {
      method: 'POST',
      body: {project: cleanProject, isFilter, payloadHash},
    },
    successMsg: 'Model successfully generated!',
  };
};

/**
 * Created signed urls to upload files to S3
 * @note implements s3Manager.getSignedDataUrlPromise concurrently
 */

export const _getSignedDataUrls = (
  workspaceId: string,
  projectId: string,
  payloadHash: string
): webTypes.IFetchConfig => {
  return {
    url: `/api/etl/sign-data-urls`,
    options: {
      method: 'POST',
      body: {workspaceId, projectId, payloadHash},
    },
    successMsg: 'Signed data packets',
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
  data: {sdtUrl: string; sgnUrl: string; sgcUrl: string},
  project: databaseTypes.IProject,
  session: Omit<databaseTypes.ISession & {status}, 'jwt' | 'user' | 'expires' | 'sessionToken'>,
  url: string,
  isCreate: boolean,
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
  const cam = camera || {};
  console.log({camera});
  console.log('createOpenProject');

  return JSON.stringify({
    camera: {...cam},
    projectId: project?.id,
    workspaceId: project?.workspace.id,
    sdtUrl: data.sdtUrl,
    sgnUrl: data.sgnUrl,
    sgcUrl: data.sgcUrl,
    viewName: project?.viewName,
    isCreate,
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
