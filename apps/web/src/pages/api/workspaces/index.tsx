import { validateSession, workspaceService, Initializer } from '@glyphx/business';
import { Session } from 'next-auth';

const handler = async (req, res) => {
  await Initializer.init();
  const { method } = req;

  if (method === 'GET') {
    const session = (await validateSession(req, res)) as Session;
    const workspaces = await workspaceService.getWorkspaces(session?.user?.userId, session?.user?.email);
    res.status(200).json({ data: { workspaces } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
