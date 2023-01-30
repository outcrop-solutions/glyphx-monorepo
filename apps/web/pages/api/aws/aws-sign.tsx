import { unstable_getServerSession } from 'next-auth/next';

import { authOptions } from './auth/[...nextauth]';
import { HttpMethod } from 'types';

import type { NextApiRequest, NextApiResponse } from 'next';
import { awsSignv4 } from 'lib/api';

export default async function project(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  switch (req.method) {
    case HttpMethod.GET:
      return awsSignv4(req, res, session);

    default:
      res.setHeader('Allow', [HttpMethod.GET]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
