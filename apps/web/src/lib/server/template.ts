import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { projectTemplateService, activityLogService } from '@glyphx/business';
import { database as databaseTypes } from '@glyphx/types';
import { formatUserAgent } from 'lib/utils';
import { projectService } from '@glyphx/business';
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

export const createProjectTemplate = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { projectId, projectName, projectDesc, properties } = req.body;
  try {
    const template = await projectTemplateService.createProjectTemplate(
      projectId,
      projectName,
      projectDesc,
      properties,
      session?.user?.userId,
      session?.user?.email
    );

    // const { agentData, location } = formatUserAgent(req);

    // await activityLogService.createLog({
    //   actorId: session?.user?.userId,
    //   resourceId: template._id,
    //   templateId: template._id,
    //   workspaceId: template.workspace._id,
    //   location: location,
    //   userAgent: agentData,
    //   onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT_TEMPLATE,
    //   action: databaseTypes.constants.ACTION_TYPE.CREATED,
    // });

    res.status(200).json({ data: template });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
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

export const createProjectFromTemplate = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { workspaceId, template } = req.body;
  try {
    const result = await projectService.createProject(
      `${template.name}`,
      workspaceId,
      session?.user?.userId,
      session?.user?.email,
      template,
      template.description
    );

    // const { agentData, location } = formatUserAgent(req);

    // await activityLogService.createLog({
    //   actorId: session?.user?.userId,
    //   resourceId: template._id,
    //   templateId: template._id,
    //   workspaceId: template.workspace._id,
    //   location: location,
    //   userAgent: agentData,
    //   onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT_TEMPLATE,
    //   action: databaseTypes.constants.ACTION_TYPE.CREATED,
    // });

    res.status(200).json({ data: result });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Get ProjectTemplateTemplate
 *
 * @note returns a template by id
 * @route GET /api/template/[templateId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getProjectTemplates = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const templates = await projectTemplateService.getProjectTemplates({});
    res.status(200).json({ data: { templates } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Update ProjectTemplate
 *
 * @note returns a template by id
 * @route GET /api/template/[templateId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateProjectTemplate = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { templateId } = req.query;
  const { properties } = req.body;
  if (Array.isArray(templateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const template = await projectTemplateService.updateProjectTemplateState(templateId, properties);
    const { agentData, location } = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId,
      resourceId: template._id,
      templateId: template._id,
      workspaceId: template.workspace._id,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT_TEMPLATE,
      action: databaseTypes.constants.ACTION_TYPE.UPDATED,
    });
    res.status(200).json({ data: { template } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Delete ProjectTemplate
 *
 * @note  update template deletedAt date
 * @route DELETE /api/user
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteProjectTemplate = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { templateId } = req.query;
  if (Array.isArray(templateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      const template = await projectTemplateService.delete(templateId);
      const { agentData, location } = formatUserAgent(req);

      await activityLogService.createLog({
        actorId: session?.user?.userId,
        resourceId: template._id,
        workspaceId: template.workspace._id,
        templateId: template._id,
        location: location,
        userAgent: agentData,
        onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT_TEMPLATE,
        action: databaseTypes.constants.ACTION_TYPE.DELETED,
      });
    }
    res.status(200).json({ data: { email: session?.user?.email } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
