import { web as webTypes } from '@glyphx/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { Initializer, validateSession } from '@glyphx/business';
import { uploadFile } from 'lib/server/etl/uploadFile';

/**
 * UNCOMMENT TO DISABLE BUFFERING OF RESPONSE i.e to read raw data or stream
// BY DEFAULT NEXT SLS ENV BUFFERS REQS :/
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Implements controller of browser based FILE OPERATIONS
 * HANDLERS FOUND @ /lib/server/fileingestion.ts
 * @param req
 * @param res
 * @returns {Promise<void | NextApiResponse>}
 */

export default async function fileIngest(req: NextApiRequest, res: NextApiResponse) {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  // check for valid session
  //   const session = (await validateSession(req, res)) as Session;
  //   if (!session.user.userId) return res.status(401).end();
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      return uploadFile(req, res);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
