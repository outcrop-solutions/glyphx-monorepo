
import { HttpMethod } from 'types';

import type { NextApiRequest, NextApiResponse } from 'next';
import { handleIngestion } from 'lib/file-ingest';

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
      return handleIngestion(req, res);
    default:
      res.setHeader('Allow', [HttpMethod.POST]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
