// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {projectService} from 'business';
import {error} from 'core';

/**
 * Create Project
 *
 * @note Creates a project
 * @route POST /api/project
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createProject = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(200).json({data: project});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get Projects
 *
 * @note returns projects
 * @route GET /api/projects
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getProjects = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const projects = await projectService.getProjects({deletedAt: undefined});
    res.status(200).json({data: {projects}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
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
  const {projectId} = req.query;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const project = await projectService.getProject(projectId as string);
    res.status(200).json({data: {project}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Update Project
 *
 * @note returns a project by id
 * @route PUT /api/project/[projectId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateProject = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {projectId} = req.query;
  const {project} = req.body;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedProject = await projectService.updateProject(
      projectId as string,
      project
    );

    res.status(200).json({data: {project: updatedProject}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Delete Project
 *
 * @note  update project deletedAt date
 * @route DELETE /api/project
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteProject = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {projectId} = req.query;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await projectService.deleteModelProject(projectId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
