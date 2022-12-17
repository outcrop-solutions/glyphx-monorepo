import { unstable_getServerSession } from 'next-auth/next';

import { authOptions } from '../../auth/[...nextauth]';
import { HttpMethod } from 'types';

import type { NextApiRequest, NextApiResponse } from 'next';
import { getProject, createProject, deleteProject, updateProject } from 'lib/experimental';

/**
 * @note MONGO ATLAS TRANSITION
 * Implements the controller for /lib/with-mongo/project.tsx
 * @alpha
 */

export default async function project(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  switch (req.method) {
    case HttpMethod.GET:
      return getProject(req, res, session);
    case HttpMethod.POST:
      return createProject(req, res);
    case HttpMethod.DELETE:
      return deleteProject(req, res);
    case HttpMethod.PUT:
      return updateProject(req, res);

    default:
      res.setHeader('Allow', [HttpMethod.GET, HttpMethod.POST, HttpMethod.DELETE, HttpMethod.PUT]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
