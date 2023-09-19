// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import { tagService} from 'business';
import {error} from 'core';

/**
 * Create Tag
 *
 * @note Creates a tag
 * @route POST /api/tag
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createTag = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const tag = await tagService.createTag(req.body);
    res.status(200).json({data: tag });
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}} });
  }
};

/**
 * Get Tags
 *
 * @note returns tags
 * @route GET /api/tags
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getTags = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const tags = await tagService.getTags({deletedAt: undefined});
    res.status(200).json({data: { tags }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Get Tag
 *
 * @note returns a tag by id
 * @route GET /api/tag/[tagId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getTag = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tagId} = req.query;
  if (Array.isArray(tagId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const tag = await tagService.getTag(tagId as string);
    res.status(200).json({data: { tag }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Update Tag
 *
 * @note returns a tag by id
 * @route PUT /api/tag/[tagId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateTag = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { tagId} = req.query;
  const { tag } = req.body;
  if (Array.isArray(tagId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedTag = await tagService.updateTag(tagId as string, tag);

    res.status(200).json({data: { tag: updatedTag }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Delete Tag
 *
 * @note  update tag deletedAt date
 * @route DELETE /api/tag
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteTag = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { tagId} = req.query;
  if (Array.isArray(tagId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await tagService.deleteModelTag(tagId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};
