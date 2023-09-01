import { webTypes } from 'types';
import { authOptions } from 'app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Initializer } from 'business';
import { deactivateUser } from 'lib/server/user';

const deactivate = async (req: NextApiRequest, res: NextApiResponse) => {
  // initialize the business layer
  if (!Initializer.initedField) {
    Initializer.init();
  }

  // check for valid session
  const session = await getServerSession(req, res, authOptions);
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
