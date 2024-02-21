'use server';
import {error, constants} from 'core';
import {Initializer} from '../init';
import {activityLogService} from '../services';
import {databaseTypes} from 'types';

/**
 * Get Project Logs
 * @param projectId
 * @returns
 */
export const getProjectLogs = async (projectId: string) => {
  try {
    await Initializer.init();
    return await activityLogService.getLogs(projectId, databaseTypes.constants.RESOURCE_MODEL.PROJECT);
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred getting the project logs',
      'projectId',
      projectId,
      err
    );
    e.publish('annotations', constants.ERROR_SEVERITY.ERROR);
    return {error: e};
  }
};

/**
 *  Get Workspace Logs
 * @param workspaceId
 * @returns
 */
export const getWorkspaceLogs = async (workspaceId: string) => {
  try {
    return await activityLogService.getLogs(workspaceId, databaseTypes.constants.RESOURCE_MODEL.WORKSPACE);
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred getting the workspace logs',
      'workspaceId',
      workspaceId,
      err
    );
    e.publish('annotations', constants.ERROR_SEVERITY.ERROR);
  }
};
