import {webTypes, databaseTypes} from 'types';
/******************** INGESTION *********************/

/**
 * This is still necessary because we are sending to s3
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
/******************** ETL *********************/
/**
 * Calls the glyph engine to create data files
 * @note implements glyphengine.process()
 * @param payload corresponds to the glyph engine payload
 */
// iState should include a filehash, to determine whether filtering is available via checking against current fileHash
// modal state should also include a payload hash in order to uniquely store the data, as subsequent create state calls with the same fileSystem will override privious states with the same file system

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
  data: {sdtUrl: string; sgnUrl: string; sgcUrl: string; isCreate: boolean},
  project: databaseTypes.IProject,
  rowIds: any[],
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
    center?: {
      x: number;
      y: number;
      z: number;
    };
  }
) => {
  const cam = camera || {};
  const rows = rowIds || [];
  console.log('open project call', {
    camera: {...cam},
    projectId: project?.id,
    workspaceId: project?.workspace.id,
    sdtUrl: data.sdtUrl,
    sgnUrl: data.sgnUrl,
    sgcUrl: data.sgcUrl,
    viewName: project?.viewName,
    isCreate: data.isCreate,
    rowIds: rows,
  });

  return JSON.stringify({
    camera: {...cam},
    projectId: project?.id,
    workspaceId: project?.workspace.id,
    sdtUrl: data.sdtUrl,
    sgnUrl: data.sgnUrl,
    sgcUrl: data.sgcUrl,
    viewName: project?.viewName,
    isCreate: data.isCreate,
    rowIds: rows,
  });
};
