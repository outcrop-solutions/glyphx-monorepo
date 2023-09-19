// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import { workspaceService} from 'business';
import {error} from 'core';

/**
 * Create Workspace
 *
 * @note Creates a workspace
 * @route POST /api/workspace
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createWorkspace = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const workspace = await workspaceService.createWorkspace(req.body);
    res.status(200).json({data: workspace });
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}} });
  }
};

/**
 * Get Workspaces
 *
 * @note returns workspaces
 * @route GET /api/workspaces
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getWorkspaces = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const workspaces = await workspaceService.getWorkspaces({deletedAt: undefined});
    res.status(200).json({data: { workspaces }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Get Workspace
 *
 * @note returns a workspace by id
 * @route GET /api/workspace/[workspaceId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getWorkspace = async (req: NextApiRequest, res: NextApiResponse) => {
  const { workspaceId} = req.query;
  if (Array.isArray(workspaceId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const workspace = await workspaceService.getWorkspace(workspaceId as string);
    res.status(200).json({data: { workspace }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Update Workspace
 *
 * @note returns a workspace by id
 * @route PUT /api/workspace/[workspaceId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateWorkspace = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { workspaceId} = req.query;
  const { workspace } = req.body;
  if (Array.isArray(workspaceId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedWorkspace = await workspaceService.updateWorkspace(workspaceId as string, workspace);

    res.status(200).json({data: { workspace: updatedWorkspace }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Delete Workspace
 *
 * @note  update workspace deletedAt date
 * @route DELETE /api/workspace
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteWorkspace = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { workspaceId} = req.query;
  if (Array.isArray(workspaceId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await workspaceService.deleteModelWorkspace(workspaceId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};
