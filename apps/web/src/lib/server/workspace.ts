import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import {
  membershipService,
  validateCreateWorkspace,
  validateUpdateWorkspaceName,
  validateUpdateWorkspaceSlug,
  workspaceService,
} from '@glyphx/business';
import slugify from 'slugify';

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

export const getWorkspace = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { workspaceSlug } = req.query;
  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const workspace = await workspaceService.getSiteWorkspace(workspaceSlug);
    res.status(200).json({ data: { workspace } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
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
  const { name } = req.body;
  try {
    await validateCreateWorkspace(req, res);
    const slug = slugify(name.toLowerCase());
    await workspaceService.createWorkspace(session?.user?.userId, session?.user?.email, name, slug);
    res.status(200).json({ data: { name, slug } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
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
  const { slug } = req.body;
  const { workspaceSlug } = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }

  try {
    await validateUpdateWorkspaceSlug(req, res);
    await workspaceService.updateWorkspaceSlug(session?.user?.userId, session?.user?.email, slug, workspaceSlug);

    res.status(200).json({ data: { slug: slug } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
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
  let { name } = req.body;
  let { workspaceSlug } = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }

  try {
    const updatedName = await validateUpdateWorkspaceName(req, res);
    workspaceService.updateWorkspaceName(session?.user?.userId, session?.user?.email, name, workspaceSlug);
    res.status(200).json({ data: { name: updatedName } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
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
  const { workspaceSlug } = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const members = await membershipService.getMembers({ slug: req.query.workspaceSlug });
    res.status(200).json({ data: { members } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
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
  let { members } = req.body;
  let { workspaceSlug } = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }

  try {
    const memberData = await workspaceService.inviteUsers(
      session?.user?.userId,
      session?.user?.email,
      members,
      workspaceSlug
    );
    res.status(200).json({ data: { members: memberData } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
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
  const { workspaceSlug } = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }

  try {
    const deletedSlug = await workspaceService.deleteWorkspace(session.user.userId, session.user.email, workspaceSlug);
    res.status(200).json({ data: { slug: deletedSlug } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
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
  const { workspaceSlug } = req.query;

  if (Array.isArray(workspaceSlug)) {
    return res.status(400).end('Query parameter is invalid');
  }

  try {
    const workspace = await workspaceService.getWorkspace(session?.user?.userId, session?.user?.email, workspaceSlug);

    if (workspace) {
      const isTeamOwner = await workspaceService.isWorkspaceOwner(session?.user?.email, workspace);
      const inviteLink = `${process.env.APP_URL}/teams/invite?code=${encodeURI(workspace?.inviteCode)}`;

      res.status(200).json({ data: { isTeamOwner, inviteLink } });
    }
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
