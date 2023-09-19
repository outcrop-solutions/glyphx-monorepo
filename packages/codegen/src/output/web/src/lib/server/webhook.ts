// THIS CODE WAS AUTOMATICALLY GENERATED
import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import { webhookService} from 'business';
import {error} from 'core';

/**
 * Create Webhook
 *
 * @note Creates a webhook
 * @route POST /api/webhook
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const createWebhook = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const webhook = await webhookService.createWebhook(req.body);
    res.status(200).json({data: webhook });
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}} });
  }
};

/**
 * Get Webhooks
 *
 * @note returns webhooks
 * @route GET /api/webhooks
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getWebhooks = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const webhooks = await webhookService.getWebhooks({deletedAt: undefined});
    res.status(200).json({data: { webhooks }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Get Webhook
 *
 * @note returns a webhook by id
 * @route GET /api/webhook/[webhookId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const getWebhook = async (req: NextApiRequest, res: NextApiResponse) => {
  const { webhookId} = req.query;
  if (Array.isArray(webhookId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const webhook = await webhookService.getWebhook(webhookId as string);
    res.status(200).json({data: { webhook }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Update Webhook
 *
 * @note returns a webhook by id
 * @route PUT /api/webhook/[webhookId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const updateWebhook = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { webhookId} = req.query;
  const { webhook } = req.body;
  if (Array.isArray(webhookId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    const updatedWebhook = await webhookService.updateWebhook(webhookId as string, webhook);

    res.status(200).json({data: { webhook: updatedWebhook }});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};

/**
 * Delete Webhook
 *
 * @note  update webhook deletedAt date
 * @route DELETE /api/webhook
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

const ALLOW_DELETE = true;

export const deleteWebhook = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { webhookId} = req.query;
  if (Array.isArray(webhookId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }
  try {
    if (ALLOW_DELETE) {
      await webhookService.deleteModelWebhook(webhookId as string);
    }
    res.status(200).json({data: {email: session?.user?.email}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message} } });
  }
};
