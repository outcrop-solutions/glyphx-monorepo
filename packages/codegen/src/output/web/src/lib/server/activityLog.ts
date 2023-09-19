// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import { activityLogService} from 'business';
import {error} from 'core';

/**
 * Create ActivityLog
 *
 * @note Creates a activityLog
 * @route POST /api/activityLog
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createActivityLog = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const activityLog = await activityLogService.createActivityLog(req.body);
    res.status(200).json({data: activityLog });
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}} });
  }
};

/**
 * Get ActivityLogs
 *
 * @note returns activityLogs
 * @route GET /api/activityLogs
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getActivityLogs = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const activityLogs = await activityLogService.getActivityLogs({deletedAt: undefined});
    res.status(200).json({data: { activityLogs }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Get ActivityLog
 *
 * @note returns a activityLog by id
 * @route GET /api/activityLog/[activityLogId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getActivityLog = async (req: NextApiRequest, res: NextApiResponse) => {
  const { activityLogId} = req.query;
  if (Array.isArray(activityLogId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const activityLog = await activityLogService.getActivityLog(activityLogId as string);
    res.status(200).json({data: { activityLog }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Update ActivityLog
 *
 * @note returns a activityLog by id
 * @route PUT /api/activityLog/[activityLogId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateActivityLog = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { activityLogId} = req.query;
  const { activityLog } = req.body;
  if (Array.isArray(activityLogId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedActivityLog = await activityLogService.updateActivityLog(activityLogId as string, activityLog);

    res.status(200).json({data: { activityLog: updatedActivityLog }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Delete ActivityLog
 *
 * @note  update activityLog deletedAt date
 * @route DELETE /api/activityLog
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteActivityLog = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { activityLogId} = req.query;
  if (Array.isArray(activityLogId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await activityLogService.deleteModelActivityLog(activityLogId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};
