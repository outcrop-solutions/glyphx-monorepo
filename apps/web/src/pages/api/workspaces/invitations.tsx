import {webTypes} from 'types';
import {NextApiRequest, NextApiResponse} from 'next';
import {Initializer} from 'business';
import {Session} from 'next-auth';
import {validateSession} from 'lib/server/session';
import {getPendingInvitations} from 'lib/server/workspaces';

const invitations = async (req: NextApiRequest, res: NextApiResponse) => {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  // check for valid session
  const session = (await validateSession(req, res)) as Session;
  if (!session?.user?.id) return res.status(401).end();

  // execute the appropriate handler
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.GET:
      return getPendingInvitations(req, res, session);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.GET]);
      return res.status(405).json({error: `${req.method} method unsupported`});
  }
};

export default invitations;
