import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { stateService, activityLogService } from '@glyphx/business';
import { formatUserAgent } from 'lib/utils';
import { database as databaseTypes } from '@glyphx/types';
/**
 * Get a State
 *
 * @note retrieves a state
 * @route GET /api/state
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getState = async (req: NextApiRequest, res: NextApiResponse) => {
  const { stateId } = req.body;
  try {
    const state = await stateService.getState(stateId);
    res.status(200).json({ data: state });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
/**
 * Creates a State
 *
 * @note Creates a new state
 * @route POST /api/state
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createState = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { name, camera, projectId } = req.body;
  try {
    const state = await stateService.createState(name, camera, projectId, session?.user?.userId);
    const { agentData, location } = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId,
      resourceId: state._id,
      workspaceId: state.workspace._id,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.STATE,
      action: databaseTypes.constants.ACTION_TYPE.CREATED,
    });

    res.status(200).json({ data: state });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Update State Name
 *
 * @note Updates a state's display name
 * @route PUT /api/state
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateState = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { stateId, name } = req.body;
  try {
    const state = await stateService.updateState(stateId, name);
    const { agentData, location } = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId,
      resourceId: state._id,
      workspaceId: state.project.workspace,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.STATE,
      action: databaseTypes.constants.ACTION_TYPE.UPDATED,
    });
    res.status(200).json({ data: { name } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Delete a state
 *
 * @note  update state deletedAt date
 * @route DELETE /api/state
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const deleteState = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  try {
    const { stateId } = req.body;
    const state = await stateService.deleteState(stateId);
    const { agentData, location } = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId,
      resourceId: state._id,
      workspaceId: state.project.workspace,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.STATE,
      action: databaseTypes.constants.ACTION_TYPE.DELETED,
    });
    res.status(200).json({ data: { deleted: true } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
