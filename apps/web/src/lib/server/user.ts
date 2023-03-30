import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { userService, validateUpdateName } from '@glyphx/business';

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
    await userService.updateName(session?.user?.userId, name);
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
    await validateUpdateName(req, res);
    await userService.updateEmail(session?.user?.userId, email, session?.user?.email);
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

const ALLOW_DEACTIVATION = false;

export const deactivateUser = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  try {
    if (ALLOW_DEACTIVATION) {
      await userService.deactivate(session?.user?.userId);
    }
    res.status(200).json({ data: { email: session?.user?.email } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
