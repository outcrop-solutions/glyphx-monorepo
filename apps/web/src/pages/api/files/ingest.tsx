import { web as webTypes } from '@glyphx/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { Initializer, validateSession } from '@glyphx/business';
import { addFile, appendFile, deleteFile } from 'lib/server/fileingestion';

/**
 * UNCOMMENT TO DISABLE BUFFERING OF RESPONSE i.e to read raw data or stream
// BY DEFAULT NEXT SLS ENV BUFFERS REQS :/
 */
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

/**
 * Implements controller of browser based FILE OPERATIONS
 * HANDLERS FOUND @ /lib/server/fileingestion.ts
 * @param req
 * @param res
 * @returns {Promise<void | NextApiResponse>}
 */

export default async function fileIngest(req: NextApiRequest, res: NextApiResponse) {
  // initialize the business layer
  await Initializer.init();
  // check for valid session
  // const session = (await validateSession(req, res)) as Session;
  // if (!session.user.userId) return res.status(401).end();
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      // return addFile(req, res, session);
      return addFile(req, res);
    case webTypes.constants.HTTP_METHOD.PUT:
      // return appendFile(req, res, session);
      return appendFile(req, res);
    case webTypes.constants.HTTP_METHOD.DELETE:
      // return deleteFile(req, res, session);
      return deleteFile(req, res);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST, webTypes.constants.HTTP_METHOD.PUT, webTypes.constants.HTTP_METHOD.DELETE]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
