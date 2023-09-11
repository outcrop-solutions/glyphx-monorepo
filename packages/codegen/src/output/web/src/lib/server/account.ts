// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {accountService} from 'business';
import {error} from 'core';

/**
 * Create Account
 *
 * @note Creates a account
 * @route POST /api/account
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createAccount = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const account = await accountService.createAccount(req.body);
    res.status(200).json({data: account});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get Accounts
 *
 * @note returns accounts
 * @route GET /api/accounts
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getAccounts = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const accounts = await accountService.getAccounts({deletedAt: undefined});
    res.status(200).json({data: {accounts}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get Account
 *
 * @note returns a account by id
 * @route GET /api/account/[accountId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getAccount = async (req: NextApiRequest, res: NextApiResponse) => {
  const {accountId} = req.query;
  if (Array.isArray(accountId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const account = await accountService.getAccount(accountId as string);
    res.status(200).json({data: {account}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Update Account
 *
 * @note returns a account by id
 * @route PUT /api/account/[accountId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateAccount = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {accountId} = req.query;
  const {account} = req.body;
  if (Array.isArray(accountId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedAccount = await accountService.updateAccount(
      accountId as string,
      account
    );

    res.status(200).json({data: {account: updatedAccount}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Delete Account
 *
 * @note  update account deletedAt date
 * @route DELETE /api/account
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteAccount = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {accountId} = req.query;
  if (Array.isArray(accountId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await accountService.deleteModelAccount(accountId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
