import {webTypes} from 'types';
import {NextApiRequest, NextApiResponse} from 'next';
import {Initializer} from 'business';
import {Session} from 'next-auth';
import {validateSession} from 'lib/server/session';
import {getConfig, createConfig, updateConfig, deleteConfig} from 'lib/server/config';

const config = async (req: NextApiRequest, res: NextApiResponse) => {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  // check for valid session
  const session = (await validateSession(req, res)) as Session;
  if (!session?.user?._id) return res.status(401).end();

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
      return res.status(405).json({error: `${req.method} method unsupported`});
  }
};

export default config;
