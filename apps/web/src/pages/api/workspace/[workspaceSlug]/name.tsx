import { web as webTypes } from '@glyphx/types';
import { Session } from 'next-auth';
import { validateSession, Initializer } from '@glyphx/business';
import { updateWorkspaceName } from 'lib/server';

const name = async (req, res) => {
  // initialize the business layer
  await Initializer.init();

  // check for valid session
  const session = (await validateSession(req, res)) as Session;
  if (!session.user.userId) return res.status(401).end();

  // execute the appropriate handler
  switch (req.method) {
    case webTypes.HTTP_METHOD.PUT:
      return updateWorkspaceName(req, res, session);
    default:
      res.setHeader('Allow', [webTypes.HTTP_METHOD.PUT]);
      return res.status(405).json({ error: `${req.method} method unsupported` });
  }
};

export default name;
