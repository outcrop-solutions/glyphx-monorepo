import { validateSession, getWorkspaces } from '@glyphx/business';


const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    const session = await validateSession(req, res);
    const workspaces = await getWorkspaces(
      // @ts-ignore
      session?.user?.userId,
      // @ts-ignore
      session?.user?.email
    );
    res.status(200).json({ data: { workspaces } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
