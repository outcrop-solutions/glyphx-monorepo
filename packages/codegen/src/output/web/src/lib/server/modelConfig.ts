// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {modelConfigService} from 'business';
import {error} from 'core';

/**
 * Create ModelConfig
 *
 * @note Creates a modelConfig
 * @route POST /api/modelConfig
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createModelConfig = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const modelConfig = await modelConfigService.createModelConfig(req.body);
    res.status(200).json({data: modelConfig});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get ModelConfigs
 *
 * @note returns modelConfigs
 * @route GET /api/modelConfigs
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getModelConfigs = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const modelConfigs = await modelConfigService.getModelConfigs({
      deletedAt: undefined,
    });
    res.status(200).json({data: {modelConfigs}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Get ModelConfig
 *
 * @note returns a modelConfig by id
 * @route GET /api/modelConfig/[modelConfigId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getModelConfig = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const {modelConfigId} = req.query;
  if (Array.isArray(modelConfigId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const modelConfig = await modelConfigService.getModelConfig(
      modelConfigId as string
    );
    res.status(200).json({data: {modelConfig}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Update ModelConfig
 *
 * @note returns a modelConfig by id
 * @route PUT /api/modelConfig/[modelConfigId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateModelConfig = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {modelConfigId} = req.query;
  const {modelConfig} = req.body;
  if (Array.isArray(modelConfigId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedModelConfig = await modelConfigService.updateModelConfig(
      modelConfigId as string,
      modelConfig
    );

    res.status(200).json({data: {modelConfig: updatedModelConfig}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};

/**
 * Delete ModelConfig
 *
 * @note  update modelConfig deletedAt date
 * @route DELETE /api/modelConfig
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteModelConfig = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) => {
  const {modelConfigId} = req.query;
  if (Array.isArray(modelConfigId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await modelConfigService.deleteModelModelConfig(modelConfigId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
