import { webTypes } from 'types';
import { authOptions } from 'app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Initializer } from 'business';
import { getConfig, createConfig, updateConfig, deleteConfig } from 'lib/server/config';

const config = async (req: NextApiRequest, res: NextApiResponse) => {
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
      return getConfig(req, res);
    case webTypes.constants.HTTP_METHOD.POST:
      return createConfig(req, res);
    case webTypes.constants.HTTP_METHOD.PUT:
      return updateConfig(req, res, session);
    case webTypes.constants.HTTP_METHOD.DELETE:
      return deleteConfig(req, res, session);
    default:
      res.setHeader('Allow', [
        webTypes.constants.HTTP_METHOD.GET,
        webTypes.constants.HTTP_METHOD.POST,
        webTypes.constants.HTTP_METHOD.PUT,
        webTypes.constants.HTTP_METHOD.DELETE,
      ]);
      return res.status(405).json({ error: `${req.method} method unsupported` });
  }
};

export default config;
