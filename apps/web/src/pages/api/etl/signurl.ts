import { web as webTypes } from '@glyphx/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { Initializer, validateSession } from '@glyphx/business';
import { signUrl } from 'lib/server/etl/signUrl';
/**
 * Implements controller of browser based FILE OPERATIONS
 * HANDLERS FOUND @ /lib/server/fileingestion.ts
 * @param req
 * @param res
 * @returns {Promise<void | NextApiResponse>}
 */

export default async function sign(req: NextApiRequest, res: NextApiResponse) {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  // check for valid session
  const session = (await validateSession(req, res)) as Session;
  if (!session.user.userId) return res.status(401).end();
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      return signUrl(req, res);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
