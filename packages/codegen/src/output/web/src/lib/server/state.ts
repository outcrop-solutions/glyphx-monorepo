// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {stateService} from 'business';
import {error} from 'core';

/**
 * Create State
 *
 * @note Creates a state
 * @route POST /api/state
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createState = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const state = await stateService.createState(req.body);
    res.status(200).json({data: state});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get States
 *
 * @note returns states
 * @route GET /api/states
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getStates = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const states = await stateService.getStates({deletedAt: undefined});
    res.status(200).json({data: {states}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get State
 *
 * @note returns a state by id
 * @route GET /api/state/[stateId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getState = async (req: NextApiRequest, res: NextApiResponse) => {
  const {stateId} = req.query;
  if (Array.isArray(stateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const state = await stateService.getState(stateId as string);
    res.status(200).json({data: {state}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Update State
 *
 * @note returns a state by id
 * @route PUT /api/state/[stateId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateState = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {stateId} = req.query;
  const {state} = req.body;
  if (Array.isArray(stateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedState = await stateService.updateState(
      stateId as string,
      state
    );

    res.status(200).json({data: {state: updatedState}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Delete State
 *
 * @note  update state deletedAt date
 * @route DELETE /api/state
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteState = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {stateId} = req.query;
  if (Array.isArray(stateId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await stateService.deleteModelState(stateId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
