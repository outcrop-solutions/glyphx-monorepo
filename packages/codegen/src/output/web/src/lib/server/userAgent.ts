// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {userAgentService} from 'business';
import {error} from 'core';

/**
 * Create UserAgent
 *
 * @note Creates a userAgent
 * @route POST /api/userAgent
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createUserAgent = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const userAgent = await userAgentService.createUserAgent(req.body);
    res.status(200).json({data: userAgent});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get UserAgents
 *
 * @note returns userAgents
 * @route GET /api/userAgents
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getUserAgents = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const userAgents = await userAgentService.getUserAgents({
      deletedAt: undefined,
    });
    res.status(200).json({data: {userAgents}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get UserAgent
 *
 * @note returns a userAgent by id
 * @route GET /api/userAgent/[userAgentId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getUserAgent = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const {userAgentId} = req.query;
  if (Array.isArray(userAgentId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const userAgent = await userAgentService.getUserAgent(
      userAgentId as string
    );
    res.status(200).json({data: {userAgent}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Update UserAgent
 *
 * @note returns a userAgent by id
 * @route PUT /api/userAgent/[userAgentId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateUserAgent = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {userAgentId} = req.query;
  const {userAgent} = req.body;
  if (Array.isArray(userAgentId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedUserAgent = await userAgentService.updateUserAgent(
      userAgentId as string,
      userAgent
    );

    res.status(200).json({data: {userAgent: updatedUserAgent}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Delete UserAgent
 *
 * @note  update userAgent deletedAt date
 * @route DELETE /api/userAgent
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteUserAgent = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {userAgentId} = req.query;
  if (Array.isArray(userAgentId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await userAgentService.deleteModelUserAgent(userAgentId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
