import { web as webTypes } from '@glyphx/types';
import { Initializer } from '@glyphx/business';
import { authOptions } from 'app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getDataByRowId } from 'lib/server';

const rows = async (req: NextApiRequest, res: NextApiResponse) => {
  // initialize the glyphengine layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }

  // check for valid session
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.userId) return res.status(401).end();

  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      return getDataByRowId(req, res);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).json({ error: `${req.method} method unsupported` });
  }
};

export default rows;
