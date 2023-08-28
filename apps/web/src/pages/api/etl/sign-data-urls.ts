import { web as webTypes } from '@glyphx/types';
import type { NextApiRequest, NextApiResponse } from 'next';

import { Initializer } from '@glyphx/business';
import { signDataUrls } from 'lib/server/etl/signDataUrls';
/**
 * Implements controller of browser based FILE OPERATIONS
 * HANDLERS FOUND @ /lib/server/fileingestion.ts
 * @param req
 * @param res
 * @returns {Promise<void | NextApiResponse>}
 */

export default async function signData(req: NextApiRequest, res: NextApiResponse) {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  // check for valid session
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.userId) return res.status(401).end();
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      return signDataUrls(req, res);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).json({ error: `${req.method} method unsupported` });
  }
}
