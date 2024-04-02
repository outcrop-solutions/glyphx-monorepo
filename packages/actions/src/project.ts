'use server';
import {error, constants} from 'core';
import {getServerSession} from 'next-auth';
import {projectService, activityLogService} from '../../business/src/services';
import {databaseTypes} from 'types';
import {revalidatePath} from 'next/cache';
import {authOptions} from './auth';
import {redirect} from 'next/navigation';

/**
 * Create Default Project
 * @param name
 * @param workspaceId
 * @param description
 * @param docId
 */
export const createProject = async (name: string, workspaceId: string, description: string, docId: string) => {
  let projectId = '';
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const project = await projectService.createProject(
        name,
        workspaceId,
        session.user.id,
        session.user.email,
        undefined,
        description ?? '',
        docId
      );

      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: project?.id!,
        projectId: project.id,
        workspaceId: project?.workspace.id,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT,
        action: databaseTypes.constants.ACTION_TYPE.CREATED,
      });

      revalidatePath('/[workspaceId]', 'page');
      projectId = project.id as string;
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred creating the project',
      'workspaceId',
      workspaceId,
      err
    );
    e.publish('project', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
  redirect(`/project/${projectId}`);
};

/**
 * Used in the project header to rename on "Enter"
 * @param projectId
 * @param name
 * @returns
 */
export const updateProjectName = async (projectId: string, name: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const retval = await projectService.updateProject(projectId, {
        name,
      });
      revalidatePath(`/project/${projectId}`, 'layout');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred renaming the project', 'projectId', projectId, err);
    e.publish('project', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Get Project
 * @param projectId
 */
export const getProject = async (projectId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      return await projectService.getProject(projectId as string);
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred getting the project by id',
      'projectId',
      projectId,
      err
    );
    e.publish('project', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Update Project State
 * @param projectId
 * @param state
 * @returns
 */
export const updateProjectState = async (projectId: string, state: databaseTypes.IState) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const project = await projectService.updateProjectState(projectId as string, state);

      await activityLogService.createLog({
        actorId: session?.user?.id!,
        resourceId: project?.id!,
        projectId: project.id,
        workspaceId: project?.workspace.id,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT,
        action: databaseTypes.constants.ACTION_TYPE.UPDATED,
      });
      revalidatePath(`/project/${project.id}`, 'layout');
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred updating the project state',
      'projectId',
      projectId,
      err
    );
    e.publish('project', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Deactivate a project by id
 * @param projectId
 * @returns
 */
export const deactivateProject = async (projectId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const project = await projectService.deactivate(projectId as string);
      await activityLogService.createLog({
        actorId: session?.user?.id ?? '',
        resourceId: project?.id!,
        workspaceId: project?.workspace.id,
        projectId: project.id,
        location: 'serverAction',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT,
        action: databaseTypes.constants.ACTION_TYPE.DELETED,
      });

      revalidatePath('/[workspaceId]', 'page');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred deleting the project', 'projectId', projectId, err);
    e.publish('project', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};
