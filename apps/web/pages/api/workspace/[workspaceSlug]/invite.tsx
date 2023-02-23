import { validateWorkspaceInvite, validateSession, WorkspaceService } from '@glyphx/business';
import { Session } from 'next-auth';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const session = (await validateSession(req, res)) as Session;
    await validateWorkspaceInvite(req, res);
    const { members } = req.body;

    await WorkspaceService.inviteUsers(session?.user?.userId, session?.user?.email, members, req.query.workspaceSlug)
      .then((members) => res.status(200).json({ data: { members } }))
      .catch((error) => res.status(404).json({ errors: { error: { msg: error.message } } }));
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
