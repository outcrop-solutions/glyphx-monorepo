import { web as webTypes } from '@glyphx/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { validateSession, Initializer } from '@glyphx/business';
import { updateName } from 'lib/server';

const name = async (req: NextApiRequest, res: NextApiResponse) => {
  // initialize the business layer
  await Initializer.init();

  // check for valid session
  const session = (await validateSession(req, res)) as Session;
  if (!session.user.userId) return res.status(401).end();

  // execute the appropriate handler
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.PUT:
      return updateName(req, res, session);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.PUT]);
      return res.status(405).json({ error: `${req.method} method unsupported` });
  }
};

export default name;
