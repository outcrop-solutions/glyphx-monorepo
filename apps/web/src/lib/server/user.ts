import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {userService, activityLogService, validateUpdateName, validateUpdateEmail} from 'business';
import {formatUserAgent} from 'lib/utils/formatUserAgent';
import {databaseTypes} from 'types';

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
  const {name} = req.body;
  try {
    await validateUpdateName(req, res);
    const user = await userService.updateName(session?.user?._id as string, name);
    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?._id as string,
      resourceId: user._id?.toString() as string,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.USER,
      action: databaseTypes.constants.ACTION_TYPE.UPDATED,
    });
    res.status(200).json({data: {name}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
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
  const {email} = req.body;
  try {
    await validateUpdateEmail(req, res);
    const user = await userService.updateEmail(session?.user?._id as string, email, session?.user?.email as string);
    const {agentData, location} = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?._id as string,
      resourceId: user._id?.toString() as string,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.USER,
      action: databaseTypes.constants.ACTION_TYPE.UPDATED,
    });

    res.status(200).json({data: {email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
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
      const user = await userService.deactivate(session?.user?._id as string);
      const {agentData, location} = formatUserAgent(req);

      await activityLogService.createLog({
        actorId: session?.user?._id as string,
        resourceId: user._id?.toString() as string,
        location: location,
        userAgent: agentData,
        onModel: databaseTypes.constants.RESOURCE_MODEL.USER,
        action: databaseTypes.constants.ACTION_TYPE.DELETED,
      });
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
