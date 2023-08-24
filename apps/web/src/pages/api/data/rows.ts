import { web as webTypes } from '@glyphx/types';
import { Initializer, validateSession } from '@glyphx/business';
import { Session } from 'next-auth';
import { getDataByRowId } from 'lib/server';

const rows = async (req, res) => {
  // initialize the glyphengine layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }

  // check for valid session
  const session = (await validateSession(req, res)) as Session;
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
