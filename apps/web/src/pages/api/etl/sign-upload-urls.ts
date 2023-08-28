import { web as webTypes } from '@glyphx/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from 'app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { Initializer } from '@glyphx/business';
import { signUploadUrls } from 'lib/server/etl/signUploadUrls';
/**
 * Implements controller of browser based FILE OPERATIONS
 * HANDLERS FOUND @ /lib/server/fileingestion.ts
 * @param req
 * @param res
 * @returns {Promise<void | NextApiResponse>}
 */

export default async function signUpload(req: NextApiRequest, res: NextApiResponse) {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  // check for valid session
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.userId) return res.status(401).end();
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      return signUploadUrls(req, res);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
