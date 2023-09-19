// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import { userService} from 'business';
import {error} from 'core';

/**
 * Create User
 *
 * @note Creates a user
 * @route POST /api/user
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(200).json({data: user });
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}} });
  }
};

/**
 * Get Users
 *
 * @note returns users
 * @route GET /api/users
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getUsers = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const users = await userService.getUsers({deletedAt: undefined});
    res.status(200).json({data: { users }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Get User
 *
 * @note returns a user by id
 * @route GET /api/user/[userId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId} = req.query;
  if (Array.isArray(userId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const user = await userService.getUser(userId as string);
    res.status(200).json({data: { user }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Update User
 *
 * @note returns a user by id
 * @route PUT /api/user/[userId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateUser = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { userId} = req.query;
  const { user } = req.body;
  if (Array.isArray(userId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedUser = await userService.updateUser(userId as string, user);

    res.status(200).json({data: { user: updatedUser }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Delete User
 *
 * @note  update user deletedAt date
 * @route DELETE /api/user
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteUser = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { userId} = req.query;
  if (Array.isArray(userId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await userService.deleteModelUser(userId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};
