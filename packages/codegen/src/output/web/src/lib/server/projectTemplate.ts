// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {projectTemplateService} from 'business';
import {error} from 'core';

/**
 * Create ProjectTemplate
 *
 * @note Creates a projectTemplate
 * @route POST /api/projectTemplate
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createProjectTemplate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const projectTemplate = await projectTemplateService.createProjectTemplate(
      req.body
    );
    res.status(200).json({data: projectTemplate});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get ProjectTemplates
 *
 * @note returns projectTemplates
 * @route GET /api/projectTemplates
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getProjectTemplates = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const projectTemplates = await projectTemplateService.getProjectTemplates({
      deletedAt: undefined,
    });
    res.status(200).json({data: {projectTemplates}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get ProjectTemplate
 *
 * @note returns a projectTemplate by id
 * @route GET /api/projectTemplate/[projectTemplateId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getProjectTemplate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const {projectTemplateId} = req.query;
  if (Array.isArray(projectTemplateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const projectTemplate = await projectTemplateService.getProjectTemplate(
      projectTemplateId as string
    );
    res.status(200).json({data: {projectTemplate}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Update ProjectTemplate
 *
 * @note returns a projectTemplate by id
 * @route PUT /api/projectTemplate/[projectTemplateId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateProjectTemplate = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {projectTemplateId} = req.query;
  const {projectTemplate} = req.body;
  if (Array.isArray(projectTemplateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedProjectTemplate =
      await projectTemplateService.updateProjectTemplate(
        projectTemplateId as string,
        projectTemplate
      );

    res.status(200).json({data: {projectTemplate: updatedProjectTemplate}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Delete ProjectTemplate
 *
 * @note  update projectTemplate deletedAt date
 * @route DELETE /api/projectTemplate
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteProjectTemplate = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {projectTemplateId} = req.query;
  if (Array.isArray(projectTemplateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await projectTemplateService.deleteModelProjectTemplate(
        projectTemplateId as string
      );
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
