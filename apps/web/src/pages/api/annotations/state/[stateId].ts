import { webTypes } from 'types';
import { Initializer } from 'business';
import { getStateAnnotations, createStateAnnotation } from 'lib/server/annotation';
import { authOptions } from 'app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextApiRequest, NextApiResponse } from 'next';

const stateAnnotations = async (req: NextApiRequest, res: NextApiResponse) => {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }

  // check for valid session
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.userId) return res.status(401).end();

  // execute the appropriate handler
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.GET:
      return getStateAnnotations(req, res);
    case webTypes.constants.HTTP_METHOD.POST:
      return createStateAnnotation(req, res, session);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.GET, webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).json({ error: `${req.method} method unsupported` });
  }
};

export default stateAnnotations;
