import { web as webTypes } from '@glyphx/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { validateSession, Initializer } from '@glyphx/business';
import { deactivateUser } from 'business/actions/user';

const deactivate = async (req: NextApiRequest, res: NextApiResponse) => {
  // initialize the business layer
  if (!Initializer.initedField) {
    Initializer.init();
  }

  // check for valid session
  const session = (await validateSession(req, res)) as Session;
  if (!session?.user?.userId) return res.status(401).end();

  // execute the appropriate handler
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.DELETE:
      return deactivateUser(req, res, session);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.DELETE]);
      return res.status(405).json({ error: `${req.method} method unsupported` });
  }
};

export default deactivate;
