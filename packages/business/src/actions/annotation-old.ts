import type {NextApiRequest, NextApiResponse} from 'next';
import {annotationService, membershipService, stateService} from 'business';
import {Session} from 'next-auth';
import {emailTypes} from 'types';
import emailClient from '../../email';

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
  const {projectId} = req.query;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const annotations = await annotationService.getProjectAnnotations(projectId as string);
    res.status(200).json({data: annotations});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
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
  const {stateId} = req.query;
  if (Array.isArray(stateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const annotations = await annotationService.getStateAnnotations(stateId as string);
    res.status(200).json({data: annotations});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

export const createProjectAnnotation = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {projectId} = req.query;
  const {value} = req.body;
  if (Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }

  try {
    const annotation = await annotationService.createProjectAnnotation({
      author: session.user,
      projectId: projectId as string,
      value,
    });
    res.status(200).json({data: annotation});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

export const createStateAnnotation = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {stateId} = req.query;
  const {value} = req.body;
  if (Array.isArray(stateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const annotation = await annotationService.createStateAnnotation({
      author: session.user,
      stateId: stateId as string,
      value: value as string,
    });

    if (stateId) {
      const state = await stateService.getState(stateId);
      if (state?.imageHash && annotation?.value) {
        const members = await membershipService.getMembers({project: state.project.id});
        if (members) {
          const emailData = {
            type: emailTypes.EmailTypes.ANNOTATION_CREATED,
            stateName: state.name,
            stateImage: state.imageHash,
            annotation: annotation.value,
            emails: [...members.map((mem) => mem.email)],
          } satisfies emailTypes.EmailData;

          await emailClient.init();
          await emailClient.sendEmail(emailData);
        }
      }
    }

    res.status(200).json({data: annotation});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
