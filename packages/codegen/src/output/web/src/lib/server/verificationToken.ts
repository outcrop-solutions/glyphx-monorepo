// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import { verificationTokenService} from 'business';
import {error} from 'core';

/**
 * Create VerificationToken
 *
 * @note Creates a verificationToken
 * @route POST /api/verificationToken
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createVerificationToken = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const verificationToken = await verificationTokenService.createVerificationToken(req.body);
    res.status(200).json({data: verificationToken });
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}} });
  }
};

/**
 * Get VerificationTokens
 *
 * @note returns verificationTokens
 * @route GET /api/verificationTokens
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getVerificationTokens = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const verificationTokens = await verificationTokenService.getVerificationTokens({deletedAt: undefined});
    res.status(200).json({data: { verificationTokens }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Get VerificationToken
 *
 * @note returns a verificationToken by id
 * @route GET /api/verificationToken/[verificationTokenId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getVerificationToken = async (req: NextApiRequest, res: NextApiResponse) => {
  const { verificationTokenId} = req.query;
  if (Array.isArray(verificationTokenId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const verificationToken = await verificationTokenService.getVerificationToken(verificationTokenId as string);
    res.status(200).json({data: { verificationToken }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Update VerificationToken
 *
 * @note returns a verificationToken by id
 * @route PUT /api/verificationToken/[verificationTokenId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateVerificationToken = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { verificationTokenId} = req.query;
  const { verificationToken } = req.body;
  if (Array.isArray(verificationTokenId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedVerificationToken = await verificationTokenService.updateVerificationToken(verificationTokenId as string, verificationToken);

    res.status(200).json({data: { verificationToken: updatedVerificationToken }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Delete VerificationToken
 *
 * @note  update verificationToken deletedAt date
 * @route DELETE /api/verificationToken
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteVerificationToken = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { verificationTokenId} = req.query;
  if (Array.isArray(verificationTokenId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await verificationTokenService.deleteModelVerificationToken(verificationTokenId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};
