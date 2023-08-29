import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import { modelConfigService } from '@glyphx/business';
/**
 * Create Default Config
 *
 * @note Creates a std default config
 * @route POST /api/config
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createConfig = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const config = await modelConfigService.createModelConfig(req.body);
    res.status(200).json({ data: config });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Get Configs
 *
 * @note returns configs
 * @route GET /api/configs
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getConfigs = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const configs = await modelConfigService.getModelConfigs({ deletedAt: undefined });
    res.status(200).json({ data: { configs } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Get Config
 *
 * @note returns a config by id
 * @route GET /api/config/[configId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getConfig = async (req: NextApiRequest, res: NextApiResponse) => {
  const { configId } = req.query;
  if (Array.isArray(configId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const config = await modelConfigService.getModelConfig(configId as string);
    res.status(200).json({ data: { config } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Update Config
 *
 * @note returns a config by id
 * @route PUT /api/config/[configId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateConfig = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { configId } = req.query;
  const { config } = req.body;
  if (Array.isArray(configId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedConfig = await modelConfigService.updateModelConfig(configId as string, config);

    res.status(200).json({ data: { config: updatedConfig } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

/**
 * Delete Config
 *
 * @note  update config deletedAt date
 * @route DELETE /api/config
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteConfig = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { configId } = req.query;
  if (Array.isArray(configId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await modelConfigService.deleteModelConfig(configId as string);
    }
    res.status(200).json({ data: { email: session?.user?.email } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
