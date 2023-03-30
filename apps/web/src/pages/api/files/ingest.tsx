import { HttpMethod } from 'types';

import type { NextApiRequest, NextApiResponse } from 'next';
import { addFile, appendFile, deleteFile } from 'lib/server/files';

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
 * HANDLERS FOUND @ /lib/file-ingest
 * @param req
 * @param res
 * @returns {Promise<void | NextApiResponse>}
 */

export default async function fileIngest(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case HttpMethod.POST:
      return addFile(req, res);
    case HttpMethod.PUT:
      return appendFile(req, res);
    case HttpMethod.DELETE:
      return deleteFile(req, res);
    default:
      res.setHeader('Allow', [HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
