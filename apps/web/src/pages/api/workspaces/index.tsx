import { web as webTypes } from '@glyphx/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { Initializer, validateSession } from '@glyphx/business';
import { getWorkspaces } from 'lib/server';

const workspaces = async (req: NextApiRequest, res: NextApiResponse) => {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }

  // check for valid session
  const session = (await validateSession(req, res)) as Session;
  if (!session.user.userId) return res.status(401).end();

  // execute the appropriate handler
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.GET:
      return getWorkspaces(req, res, session);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.GET]);
      return res.status(405).json({ error: `${req.method} method unsupported` });
  }
};

export default workspaces;
