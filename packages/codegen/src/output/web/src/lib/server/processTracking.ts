// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import { processTrackingService} from 'business';
import {error} from 'core';

/**
 * Create ProcessTracking
 *
 * @note Creates a processTracking
 * @route POST /api/processTracking
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createProcessTracking = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const processTracking = await processTrackingService.createProcessTracking(req.body);
    res.status(200).json({data: processTracking });
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}} });
  }
};

/**
 * Get ProcessTrackings
 *
 * @note returns processTrackings
 * @route GET /api/processTrackings
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getProcessTrackings = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const processTrackings = await processTrackingService.getProcessTrackings({deletedAt: undefined});
    res.status(200).json({data: { processTrackings }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Get ProcessTracking
 *
 * @note returns a processTracking by id
 * @route GET /api/processTracking/[processTrackingId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getProcessTracking = async (req: NextApiRequest, res: NextApiResponse) => {
  const { processTrackingId} = req.query;
  if (Array.isArray(processTrackingId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const processTracking = await processTrackingService.getProcessTracking(processTrackingId as string);
    res.status(200).json({data: { processTracking }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Update ProcessTracking
 *
 * @note returns a processTracking by id
 * @route PUT /api/processTracking/[processTrackingId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateProcessTracking = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { processTrackingId} = req.query;
  const { processTracking } = req.body;
  if (Array.isArray(processTrackingId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedProcessTracking = await processTrackingService.updateProcessTracking(processTrackingId as string, processTracking);

    res.status(200).json({data: { processTracking: updatedProcessTracking }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Delete ProcessTracking
 *
 * @note  update processTracking deletedAt date
 * @route DELETE /api/processTracking
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteProcessTracking = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { processTrackingId} = req.query;
  if (Array.isArray(processTrackingId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await processTrackingService.deleteModelProcessTracking(processTrackingId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};
