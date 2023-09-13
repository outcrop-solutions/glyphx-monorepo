import {webTypes} from 'types';
import {Initializer} from 'business';
import {NextApiRequest, NextApiResponse} from 'next';
import {getDataByTableName} from 'lib/server/data';
import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {getServerSession} from 'next-auth';

const data = async (req: NextApiRequest, res: NextApiResponse) => {
  // initialize the glyphengine layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }

  // check for valid session
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?._id) return res.status(401).end();

  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      return getDataByTableName(req, res);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).json({error: `${req.method} method unsupported`});
  }
};

export default data;
