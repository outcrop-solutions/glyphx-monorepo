import type { NextApiRequest, NextApiResponse } from 'next';
import { activityLogService } from '@glyphx/business';
import { database as databaseTypes } from '@glyphx/types';
/**
 * Get Project Logs
 *
 * @route GET /api/logs/project/[projectId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getProjectLogs = async (req: NextApiRequest, res: NextApiResponse) => {
  const { projectId } = req.query;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const logs = await activityLogService.getLogs(projectId, databaseTypes.constants.RESOURCE_MODEL.PROJECT);
    res.status(200).json({ data: logs });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Get Workspace Logs
 *
 * @route GET /api/logs/workspace/[workspaceId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getWorkspaceLogs = async (req: NextApiRequest, res: NextApiResponse) => {
  const { workspaceId } = req.query;
  if (Array.isArray(workspaceId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const logs = await activityLogService.getLogs(workspaceId, databaseTypes.constants.RESOURCE_MODEL.WORKSPACE);
    res.status(200).json({ data: logs });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
