import {webTypes} from 'types';
import {Initializer} from 'business';
import {Session} from 'next-auth';
import {validateSession} from 'lib/server/session';
import {NextApiRequest, NextApiResponse} from 'next';
import {getDataByRowId} from 'lib/server';

export const config = {
  // Specifies the maximum allowed duration for this function to execute (in seconds)
  maxDuration: 300,
};

const rows = async (req: NextApiRequest, res: NextApiResponse) => {
  // initialize the glyphengine layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  // check for valid session
  const session = (await validateSession(req, res)) as Session;
  if (!session?.user?.id) return res.status(401).end();

  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      return getDataByRowId(req, res);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).json({error: `${req.method} method unsupported`});
  }
};

export default rows;
