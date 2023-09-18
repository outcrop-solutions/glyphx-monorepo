import {webTypes} from 'types';
import type {NextApiRequest, NextApiResponse} from 'next';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {getServerSession} from 'next-auth/next';
import {glyphEngine} from 'lib/server/etl/glyphEngine';
import {Initializer} from 'business';

/**
 * Implements controller of browser based FILE OPERATIONS
 * HANDLERS FOUND @ /lib/server/fileingestion.ts
 * @param req
 * @param res
 * @returns {Promise<void | NextApiResponse>}
 */

export default async function engine(req: NextApiRequest, res: NextApiResponse) {
  // check for valid session
  const session = await getServerSession(req, res, authOptions);
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  if (!session?.user?._id) return res.status(401).end();

  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      return await glyphEngine(req, res, session);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).json({error: `${req.method} method unsupported`});
  }
}
