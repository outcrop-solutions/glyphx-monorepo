import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { projectService } from '@glyphx/business';

/**
 * Create Default Project
 *
 * @note Creates a std default project
 * @route POST /api/project
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createProject = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { name, workspaceId } = req.body;
  try {
    const project = await projectService.createProject(name, session?.user?.userId, workspaceId);
    res.status(200).json({ data: project });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Get Project
 *
 * @note returns a project by id
 * @route GET /api/project/[projectId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getProject = async (req: NextApiRequest, res: NextApiResponse) => {
  const { projectId } = req.query;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const project = await projectService.getProject(projectId);
    res.status(200).json({ data: { project } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Update Project
 *
 * @note returns a project by id
 * @route GET /api/project/[projectId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateProjectState = async (req: NextApiRequest, res: NextApiResponse) => {
  const { projectId } = req.query;
  const { state } = req.body;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const project = await projectService.updateProject(projectId, state);
    res.status(200).json({ data: { project } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Delete Project
 *
 * @note  update project deletedAt date
 * @route DELETE /api/user
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteProject = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { projectId } = req.query;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await projectService.deactivate(projectId);
    }
    res.status(200).json({ data: { email: session?.user?.email } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
