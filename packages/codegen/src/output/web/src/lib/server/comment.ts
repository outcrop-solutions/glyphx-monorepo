// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {commentService} from 'business';
import {error} from 'core';

/**
 * Create Comment
 *
 * @note Creates a comment
 * @route POST /api/comment
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createComment = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const comment = await commentService.createComment(req.body);
    res.status(200).json({data: comment});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get Comments
 *
 * @note returns comments
 * @route GET /api/comments
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getComments = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const comments = await commentService.getComments({deletedAt: undefined});
    res.status(200).json({data: {comments}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get Comment
 *
 * @note returns a comment by id
 * @route GET /api/comment/[commentId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getComment = async (req: NextApiRequest, res: NextApiResponse) => {
  const {commentId} = req.query;
  if (Array.isArray(commentId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const comment = await commentService.getComment(commentId as string);
    res.status(200).json({data: {comment}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Update Comment
 *
 * @note returns a comment by id
 * @route PUT /api/comment/[commentId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateComment = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {commentId} = req.query;
  const {comment} = req.body;
  if (Array.isArray(commentId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedComment = await commentService.updateComment(
      commentId as string,
      comment
    );

    res.status(200).json({data: {comment: updatedComment}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Delete Comment
 *
 * @note  update comment deletedAt date
 * @route DELETE /api/comment
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteComment = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {commentId} = req.query;
  if (Array.isArray(commentId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await commentService.deleteModelComment(commentId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
