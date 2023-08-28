import type { NextApiRequest, NextApiResponse } from 'next';

import { membershipService, workspaceService } from '@glyphx/business';

/**
 * Get Workspaces
 *
 * @note Fetches & returns all workspaces available.
 * @route GET /api/workspaces
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getWorkspaces = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const workspaces = await workspaceService.getWorkspaces(session?.user?.userId, session?.user?.email);
  res.status(200).json({ data: { workspaces } });
};

/**
 * Get Pending Invitations
 *
 * @note Fetches & returns all pending invitations
 * @route GET /api/workspaces/invitations
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */

export const getPendingInvitations = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const invitations = await membershipService.getPendingInvitations(session?.user?.email);
  res.status(200).json({ data: { invitations } });
};
