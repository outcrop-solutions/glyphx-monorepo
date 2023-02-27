import { validateSession, WorkspaceService } from '@glyphx/business';
import { Session } from 'next-auth';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    const session = (await validateSession(req, res)) as Session;
    const invitations = await WorkspaceService.getPendingInvitations(session?.user?.email);
    res.status(200).json({ data: { invitations } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
