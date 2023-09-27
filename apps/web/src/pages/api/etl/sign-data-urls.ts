import {webTypes} from 'types';
import type {NextApiRequest, NextApiResponse} from 'next';
import {Initializer} from 'business';
import {signDataUrls} from 'lib/server/etl/signDataUrls';
import {Session, getServerSession} from 'next-auth';
import {validateSession} from 'lib/server/session';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
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
  } // check for valid session
  const session = (await validateSession(req, res)) as Session;
  if (!session?.user?._id) return res.status(401).end();
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      return signDataUrls(req, res);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).json({error: `${req.method} method unsupported`});
  }
}
