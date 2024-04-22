'use server';
import {error, constants} from 'core';
import {getServerSession} from 'next-auth';
import {revalidatePath} from 'next/cache';
import {projectTemplateService, activityLogService, projectService} from '../../business/src/services';
import {databaseTypes} from 'types';
import {authOptions} from './auth';
import {redirect} from 'next/navigation';

/**
 * Create Default ProjectTemplate
 * @param projectId
 * @param projectName
 * @param projectDesc
 * @param properties
 * @returns
 */
export const createProjectTemplate = async (
  projectId: string,
  projectName: string,
  projectDesc: string,
  properties: databaseTypes.IProject['state']['properties']
) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      await projectTemplateService.createProjectTemplate(projectId, projectName, projectDesc, properties);
      revalidatePath('/[workspaceId]', 'page');
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred creating the project template',
      'projectId',
      {projectId, projectName, projectDesc, properties},
      err
    );
    e.publish('template', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Create Default ProjectTemplate
 *
 * @note Creates a std default template
 * @route POST /api/template
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createProjectFromTemplate = async (workspaceId: string, template: databaseTypes.IProjectTemplate) => {
  let projectId = '';
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const project = await projectService.createProject(
        `${template.name}`,
        workspaceId,
        session?.user?.id,
        session?.user?.email as string,
        template,
        template.description
      );
      projectId = project.id || '';
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred creating the project from projectTemplate',
      'workspaceId',
      {workspaceId, template},
      err
    );
    e.publish('template', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
  redirect(`/project/${projectId}`);
};

/**
 * Get ProjectTemplateTemplate
 */
export const getProjectTemplates = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      return await projectTemplateService.getProjectTemplates({});
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred getting the projectTemplates', '', {}, err);
    e.publish('template', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Update ProjectTemplate
 * @param templateId
 * @param properties
 * @returns
 */
export const updateProjectTemplate = async (
  templateId: string,
  properties: databaseTypes.IProjectTemplate['shape']
) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const template = await projectTemplateService.updateProjectTemplate(templateId as string, properties);

      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: template.id!,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT_TEMPLATE,
        action: databaseTypes.constants.ACTION_TYPE.UPDATED,
      });
      revalidatePath('/[workspaceId]');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred getting the projectTemplates', '', {}, err);
    e.publish('template', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

const ALLOW_DELETE = true;

/**
 * Delete ProjectTemplate
 * @param templateId
 * @returns
 */
export const deleteProjectTemplate = async (templateId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      if (ALLOW_DELETE) {
        const template = await projectTemplateService.deactivate(templateId as string);
        await activityLogService.createLog({
          actorId: session?.user?.id,
          resourceId: template.id!,
          location: '',
          userAgent: {},
          onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT_TEMPLATE,
          action: databaseTypes.constants.ACTION_TYPE.DELETED,
        });
      }
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred deleting the projectTemplate', '', {}, err);
    e.publish('template', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};
