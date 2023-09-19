// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import { sessionService} from 'business';
import {error} from 'core';

/**
 * Create Session
 *
 * @note Creates a session
 * @route POST /api/session
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createSession = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await sessionService.createSession(req.body);
    res.status(200).json({data: session });
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}} });
  }
};

/**
 * Get Sessions
 *
 * @note returns sessions
 * @route GET /api/sessions
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getSessions = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sessions = await sessionService.getSessions({deletedAt: undefined});
    res.status(200).json({data: { sessions }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Get Session
 *
 * @note returns a session by id
 * @route GET /api/session/[sessionId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getSession = async (req: NextApiRequest, res: NextApiResponse) => {
  const { sessionId} = req.query;
  if (Array.isArray(sessionId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const session = await sessionService.getSession(sessionId as string);
    res.status(200).json({data: { session }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Update Session
 *
 * @note returns a session by id
 * @route PUT /api/session/[sessionId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateSession = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { sessionId} = req.query;
  const { session } = req.body;
  if (Array.isArray(sessionId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedSession = await sessionService.updateSession(sessionId as string, session);

    res.status(200).json({data: { session: updatedSession }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Delete Session
 *
 * @note  update session deletedAt date
 * @route DELETE /api/session
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteSession = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { sessionId} = req.query;
  if (Array.isArray(sessionId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await sessionService.deleteModelSession(sessionId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};
