import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {membershipService, workspaceService} from 'business';

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
  const workspaces = await workspaceService.getWorkspaces(session?.user?.id, session?.user?.email as string);
  res.status(200).json({data: {workspaces}});
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
  const invitations = await membershipService.getPendingInvitations(session?.user?.email as string);
  res.status(200).json({data: {invitations}});
};
