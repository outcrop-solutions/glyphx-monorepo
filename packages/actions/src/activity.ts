'use server';
import {error, constants} from 'core';
import {Initializer} from '../../business/src/init';
import {activityLogService} from '../../business/src/services';
import {databaseTypes} from 'types';
import Gateway from './auth/Gateway';
import {getServerSession} from 'next-auth';
import {authOptions} from './auth';

/**
 * Get Project Logs
 * @param projectId
 * @returns
 */
export const getProjectLogs = async (projectId: string) => {
  try {
    await Initializer.init();
    const session = await getServerSession(authOptions);
    const isAuth = await Gateway.checkProjectAuth(session, projectId, true);
    if (isAuth) {
      return await activityLogService.getLogs(projectId, databaseTypes.constants.RESOURCE_MODEL.PROJECT);
    }
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
    const session = await getServerSession(authOptions);
    const isAuth = await Gateway.checkWorkspaceAuth(session, workspaceId);
    if (isAuth) {
      return await activityLogService.getLogs(workspaceId, databaseTypes.constants.RESOURCE_MODEL.WORKSPACE);
    }
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
