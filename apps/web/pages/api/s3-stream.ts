import { HttpMethod } from 'types';

import type { NextApiRequest, NextApiResponse } from 'next';
import { streamS3 } from 'lib/pipeline';

export default async function stream(req: NextApiRequest, res: NextApiResponse) {
  //   const session = await unstable_getServerSession(req, res, authOptions);
  //   if (!session) return res.status(401).end();

  switch (req.method) {
    case HttpMethod.GET:
      // call constructor, .init() && .process() on class instantiation, pipe return value to resonse object
      return streamS3(req, res);

    default:
      res.setHeader('Allow', [HttpMethod.GET]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
