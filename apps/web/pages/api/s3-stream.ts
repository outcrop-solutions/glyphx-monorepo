import { HttpMethod } from 'types';

import type { NextApiRequest, NextApiResponse } from 'next';
import { streamS3 } from 'lib/flile-ingest';

export default async function stream(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case HttpMethod.GET:
      return streamS3(req, res);

    default:
      res.setHeader('Allow', [HttpMethod.GET]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
