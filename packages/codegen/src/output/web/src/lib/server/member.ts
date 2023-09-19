// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import { memberService} from 'business';
import {error} from 'core';

/**
 * Create Member
 *
 * @note Creates a member
 * @route POST /api/member
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createMember = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const member = await memberService.createMember(req.body);
    res.status(200).json({data: member });
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}} });
  }
};

/**
 * Get Members
 *
 * @note returns members
 * @route GET /api/members
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getMembers = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const members = await memberService.getMembers({deletedAt: undefined});
    res.status(200).json({data: { members }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Get Member
 *
 * @note returns a member by id
 * @route GET /api/member/[memberId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getMember = async (req: NextApiRequest, res: NextApiResponse) => {
  const { memberId} = req.query;
  if (Array.isArray(memberId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const member = await memberService.getMember(memberId as string);
    res.status(200).json({data: { member }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Update Member
 *
 * @note returns a member by id
 * @route PUT /api/member/[memberId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateMember = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { memberId} = req.query;
  const { member } = req.body;
  if (Array.isArray(memberId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedMember = await memberService.updateMember(memberId as string, member);

    res.status(200).json({data: { member: updatedMember }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Delete Member
 *
 * @note  update member deletedAt date
 * @route DELETE /api/member
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteMember = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { memberId} = req.query;
  if (Array.isArray(memberId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await memberService.deleteModelMember(memberId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};
