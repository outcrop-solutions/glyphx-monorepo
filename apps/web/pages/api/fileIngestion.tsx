import { HttpMethod } from 'types';

import type { NextApiRequest, NextApiResponse } from 'next';
import { fileIngestion } from '@glyphx/fileingestion';

export default async function fileIngestion(req: NextApiRequest, res: NextApiResponse) {
//   const session = await unstable_getServerSession(req, res, authOptions);
//   if (!session) return res.status(401).end();

  switch (req.method) {
    case HttpMethod.POST:
        // call constructor, .init() && .process() on class instantiation, pipe return value to resonse object
      return (req, res);

    default:
      res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST, HttpMethod.DELETE, HttpMethod.PUT]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
