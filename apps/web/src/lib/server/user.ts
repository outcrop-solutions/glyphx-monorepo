import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { userService, activityLogService, validateUpdateName, validateUpdateEmail } from '@glyphx/business';
import { formatUserAgent } from 'lib/utils';
import { database as databaseTypes } from '@glyphx/types';

/**
 * Update Name
 *
 * @note Updated user name
 * @route PUT /api/user/name
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateName = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { name } = req.body;
  try {
    await validateUpdateName(req, res);
    const user = await userService.updateName(session?.user?.userId, name);
    const { agentData, location } = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId,
      resourceId: user._id,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.USER,
      action: databaseTypes.constants.ACTION_TYPE.UPDATED,
    });
    res.status(200).json({ data: { name } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Update Email
 *
 * @note Updated user email
 * @route PUT /api/user/email
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateEmail = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { email } = req.body;
  try {
    await validateUpdateEmail(req, res);
    const user = await userService.updateEmail(session?.user?.userId, email, session?.user?.email);
    const { agentData, location } = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId,
      resourceId: user._id,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.USER,
      action: databaseTypes.constants.ACTION_TYPE.UPDATED,
    });

    res.status(200).json({ data: { email } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Deactivate User
 *
 * @note  update user deletedAt date
 * @route DELETE /api/user
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DEACTIVATION = true;

export const deactivateUser = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  try {
    if (ALLOW_DEACTIVATION) {
      const user = await userService.deactivate(session?.user?.userId);
      const { agentData, location } = formatUserAgent(req);

      await activityLogService.createLog({
        actorId: session?.user?.userId,
        resourceId: user._id,
        location: location,
        userAgent: agentData,
        onModel: databaseTypes.constants.RESOURCE_MODEL.USER,
        action: databaseTypes.constants.ACTION_TYPE.DELETED,
      });
    }
    res.status(200).json({ data: { email: session?.user?.email } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
