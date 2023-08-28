import type { NextApiRequest, NextApiResponse } from 'next';
import { annotationService } from '@glyphx/business';

/**
 * Get Project Annotations
 *
 * @route GET /api/annotations/project/[projectId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getProjectAnnotations = async (req: NextApiRequest, res: NextApiResponse) => {
  const { projectId } = req.query;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const annotations = await annotationService.getProjectAnnotations(projectId);
    res.status(200).json({ data: annotations });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Get State Annotations
 *
 * @route GET /api/annotations/state/[stateId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getStateAnnotations = async (req: NextApiRequest, res: NextApiResponse) => {
  const { stateId } = req.query;
  if (Array.isArray(stateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const annotations = await annotationService.getStateAnnotations(stateId);
    res.status(200).json({ data: annotations });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

export const createProjectAnnotation = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { projectId } = req.query;
  const { value } = req.body;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const annotation = await annotationService.createProjectAnnotation({
      authorId: session.user.userId,
      projectId,
      value,
    });
    res.status(200).json({ data: annotation });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

export const createStateAnnotation = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { stateId } = req.query;
  const { value } = req.body;
  if (Array.isArray(stateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const annotation = await annotationService.createStateAnnotation({ authorId: session.user.userId, stateId, value });
    res.status(200).json({ data: annotation });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
