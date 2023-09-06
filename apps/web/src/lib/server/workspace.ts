import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {
  membershipService,
  validateCreateWorkspace,
  validateUpdateWorkspaceName,
  validateUpdateWorkspaceSlug,
  workspaceService,
  activityLogService,
} from 'business';
import slugify from 'slugify';
import {formatUserAgent} from 'lib/utils/formatUserAgent';
import {databaseTypes} from 'types';

/**
 * Create Workspace
 *
 * @note Fetches & returns all workspaces available.
 * @route POST /api/workspace
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */
export const getWorkspace = async (req: NextApiRequest, res: NextApiResponse) => {
  const {workspaceSlug} = req.query;
  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const workspace = await workspaceService.getSiteWorkspace(workspaceSlug as string);
    res.status(200).json({data: {workspace}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
/**
 * Create Workspace
 *
 * @note Creates a new workspace
 * @route POST /api/workspace
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createWorkspace = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {name} = req.body;
  try {
    await validateCreateWorkspace(req, res);
    const slug = slugify(name.toLowerCase());
    const workspace = await workspaceService.createWorkspace(
      session?.user?.userId as string,
      session?.user?.email as string,
      name,
      slug
    );

    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId as string,
      resourceId: workspace?._id as string,
      workspaceId: workspace?._id,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
      action: databaseTypes.constants.ACTION_TYPE.CREATED,
    });

    res.status(200).json({data: {name, slug}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Update Workspace Slug
 *
 * @note Updates workspace slug
 * @route PUT /api/workspace/[workspaceSlug]/slug
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateWorkspaceSlug = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {slug} = req.body;
  const {workspaceSlug} = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }

  try {
    await validateUpdateWorkspaceSlug(req, res);
    const workspace = await workspaceService.updateWorkspaceSlug(
      session?.user?.userId as string,
      session?.user?.email as string,
      slug,
      workspaceSlug as string
    );

    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId as string,
      resourceId: workspace as string,
      workspaceId: workspace!,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
      action: databaseTypes.constants.ACTION_TYPE.UPDATED,
    });

    res.status(200).json({data: {slug: slug}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Update Workspace Name
 *
 * @note Updates workspace name
 * @route PUT /api/workspace/[workspaceSlug]/name
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateWorkspaceName = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {name} = req.body;
  const {workspaceSlug} = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }

  try {
    const updatedName = await validateUpdateWorkspaceName(req, res);
    const workspace = await workspaceService.updateWorkspaceName(
      session?.user?.userId as string,
      session?.user?.email as string,
      name,
      workspaceSlug as string
    );
    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId as string,
      resourceId: workspace as string,
      workspaceId: workspace as string,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
      action: databaseTypes.constants.ACTION_TYPE.UPDATED,
    });
    res.status(200).json({data: {name: updatedName}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get Members
 *
 * @note Fetches & returns all members of workspace
 * @route GET /api/workspace/[workspaceSlug]/members
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getMembers = async (req: NextApiRequest, res: NextApiResponse) => {
  const {workspaceSlug} = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const members = await membershipService.getMembers({slug: req.query.workspaceSlug});
    res.status(200).json({data: {members}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Invite users to a workspace
 *
 * @note Invites users to a workspace via membership
 * @route POST /api/workspace/[workspaceSlug]/invite
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const inviteUsers = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {members} = req.body;
  const {workspaceSlug} = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }

  try {
    // @ts-ignore
    const {members: memberData, workspace} = await workspaceService.inviteUsers(
      session?.user?.userId as string,
      session?.user?.email as string,
      members,
      workspaceSlug as string
    );

    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId as string,
      resourceId: workspace._id,
      workspaceId: workspace._id,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
      action: databaseTypes.constants.ACTION_TYPE.INVITED,
    });

    res.status(200).json({data: {members: memberData}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Delete Workspace
 *
 * @note Deletes a workspace
 * @route DELETE /api/workspace/[workspaceSlug]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const deleteWorkspace = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {workspaceSlug} = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }

  try {
    const workspace = await workspaceService.deleteWorkspace(
      session.user.userId as string,
      session.user.email as string,
      workspaceSlug as string
    );
    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId as string,
      resourceId: workspace?._id as string,
      workspaceId: workspace?._id as string,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
      action: databaseTypes.constants.ACTION_TYPE.DELETED,
    });
    res.status(200).json({data: {workspace}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Checks if user is team owner
 *
 * @route GET /api/workspace/[workspaceSlug]/isTeamOwner
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const isTeamOwner = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {workspaceSlug} = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Query parameter is invalid');
  }

  try {
    const workspace = await workspaceService.getWorkspace(
      session?.user?.userId as string,
      session?.user?.email as string,
      workspaceSlug as string
    );

    if (workspace) {
      const isTeamOwner = await workspaceService.isWorkspaceOwner(session?.user?.email as string, workspace);
      const inviteLink = `${process.env.APP_URL || 'http://localhost:3000'}/teams/invite?code=${encodeURI(
        workspace?.inviteCode
      )}`;

      res.status(200).json({data: {isTeamOwner, inviteLink}});
    }
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
