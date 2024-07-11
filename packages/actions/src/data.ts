'use server';
import {error, constants} from 'core';
import {dataService, projectService} from '../../business/src/services';
import {generalPurposeFunctions as sharedFunctions} from 'core';
import {formatGridData} from './utils/formatGridData';
import {getServerSession} from 'next-auth';
import {authOptions} from './auth';

/**
 * Get Data by Row Id
 * @param workspaceId
 * @param projectId
 * @param tableName
 * @param rowIds
 * @param isExport
 * @param pageSize
 * @param pageNumber
 */
export const getDataByRowId = async (
  workspaceId: string,
  projectId: string,
  tableName: string,
  rowIds: number[],
  isExport: boolean,
  pageSize: number,
  pageNumber: number
) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const fullTableName = sharedFunctions.fileIngestion.getFullTableName(workspaceId, projectId, tableName);
      const data = await dataService.getDataByGlyphxIds(projectId, fullTableName, rowIds, undefined, undefined, true);
      const project = await projectService.getProject(projectId);

      if (project) {
        const columns = project.files.filter((file) => file.tableName === tableName)[0].columns;
        const formattedData = formatGridData(data, columns);
        if (!formattedData.rows.length) {
          return {error: `No data found`};
        } else {
          const start = pageNumber * pageSize;
          const end = start + pageSize;
          const paginatedRows = isExport ? formattedData.rows : formattedData.rows.slice(start, end);

          return {
            data: {...formattedData, rows: paginatedRows},
            totalPages: Math.ceil(formattedData.rows.length / pageSize),
            currentPage: pageNumber,
          };
        }
      }
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred getting the data by rowId',
      'data',
      {workspaceId, projectId, tableName, rowIds, isExport, pageSize, pageNumber},
      err
    );
    e.publish('data', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Gets data by table name
 * @param workspaceId
 * @param projectId
 * @param tableName
 * @param pageSize
 * @param pageNumber
 * @returns
 */
export const getDataByTableName = async (
  workspaceId: string,
  projectId: string,
  tableName: string,
  pageSize: number,
  pageNumber: number
) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const table = sharedFunctions.fileIngestion.getFullTableName(workspaceId, projectId, tableName);

      const data = await dataService.getDataByTableName(table, pageSize, pageNumber);
      const project = await projectService.getProject(projectId);

      if (project) {
        const columns = project.files.filter((file) => file.tableName === tableName)[0].columns;

        const formattedData = formatGridData(data, columns);
        if (!formattedData.rows.length) {
          return {error: `No data found`};
        } else {
          return {
            data: {...formattedData},
            totalPages: Math.ceil(formattedData.rows.length / pageSize),
            currentPage: pageNumber,
          };
        }
      }
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred getting the data by table name',
      'data',
      {workspaceId, projectId, tableName, pageSize, pageNumber},
      err
    );
    e.publish('data', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};
