import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { database as databaseTypes } from '@glyphx/types';
import { workspaceService, membershipService } from '@glyphx/business';

/**
 * Update Role
 *
 * @note Updated member role from MEMBER/OWNER
 * @route PUT /api/workspace/team/role
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateRole = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { memberId } = req.body;
  try {
    const member = await membershipService.getMember(memberId);
    await membershipService.toggleRole(
      memberId,
      member.teamRole === databaseTypes.constants.ROLE.MEMBER
        ? databaseTypes.constants.ROLE.OWNER
        : databaseTypes.constants.ROLE.MEMBER
    );
    res.status(200).json({ data: { updatedAt: new Date() } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Remove Member
 *
 * @note Removes member from workspace
 * @route DELETE /api/workspace/team/member
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 *
 */

export const removeMember = async (req: NextApiRequest, res: NextApiResponse) => {
  const { memberId } = req.body;
  try {
    await membershipService.remove(memberId);
    res.status(200).json({ data: { deletedAt: new Date() } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Join Workspace
 *
 * @note Joins user to workspace
 * @route POST /api/workspace/team/join
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const joinWorkspace = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { workspaceCode } = req.body;
  try {
    const joinedAt = await workspaceService.joinWorkspace(workspaceCode, session?.user?.email);
    res.status(200).json({ data: { joinedAt } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Decline Invitation
 *
 * @note Joins user to workspace
 * @route POST /api/workspace/team/decline
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const declineInvitation = async (req: NextApiRequest, res: NextApiResponse) => {
  const { memberId } = req.body;
  try {
    await membershipService.updateStatus(memberId, databaseTypes.constants.INVITATION_STATUS.DECLINED);
    res.status(200).json({ data: { updatedAt: new Date() } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Accept Invitation
 *
 * @note Joins user to workspace
 * @route POST /api/workspace/team/accept
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const acceptInvitation = async (req: NextApiRequest, res: NextApiResponse) => {
  const { memberId } = req.body;
  try {
    await membershipService.updateStatus(memberId, databaseTypes.constants.INVITATION_STATUS.ACCEPTED);
    res.status(200).json({ data: { updatedAt: new Date() } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
