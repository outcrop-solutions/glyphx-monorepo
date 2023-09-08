import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {databaseTypes} from 'types';
import {workspaceService, membershipService, activityLogService} from 'business';
import {formatUserAgent} from 'lib/utils/formatUserAgent';

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
  const {memberId, role} = req.body;
  try {
    const member = await membershipService.getMember(memberId);
    await membershipService.updateRole(member?._id?.toString() as string, role);

    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId as string,
      resourceId: member?._id?.toString() as string,
      workspaceId: member?.workspace._id?.toString() as string,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.MEMBER,
      action: databaseTypes.constants.ACTION_TYPE.ROLE_UPDATED,
    });

    res.status(200).json({data: {updatedAt: new Date()}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
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

export const removeMember = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {memberId} = req.body;
  try {
    const member = await membershipService.remove(memberId);
    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId as string,
      resourceId: member?._id?.toString() as string,
      workspaceId: member?.workspace._id?.toString() as string,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.MEMBER,
      action: databaseTypes.constants.ACTION_TYPE.DELETED,
    });

    res.status(200).json({data: {deletedAt: new Date()}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
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
  const {workspaceCode} = req.body;
  try {
    const workspace = await workspaceService.joinWorkspace(workspaceCode, session?.user?.email as string);
    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId as string,
      resourceId: workspace?._id?.toString() as string,
      workspaceId: workspace?._id,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
      action: databaseTypes.constants.ACTION_TYPE.WORKSPACE_JOINED,
    });
    res.status(200).json({data: {workspace}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
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

export const declineInvitation = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {memberId} = req.body;
  try {
    const member = await membershipService.updateStatus(memberId, databaseTypes.constants.INVITATION_STATUS.DECLINED);

    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId as string,
      resourceId: memberId,
      workspaceId: member?.workspace._id,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.MEMBER,
      action: databaseTypes.constants.ACTION_TYPE.INVITATION_DECLINED,
    });
    res.status(200).json({data: {updatedAt: new Date()}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
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

export const acceptInvitation = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {memberId} = req.body;
  try {
    const member = await membershipService.updateStatus(memberId, databaseTypes.constants.INVITATION_STATUS.ACCEPTED);
    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId as string,
      resourceId: memberId,
      workspaceId: member?.workspace._id,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.MEMBER,
      action: databaseTypes.constants.ACTION_TYPE.INVITATION_ACCEPTED,
    });
    res.status(200).json({data: {member}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
