import { validateSession, workspaceService, Initializer } from '@glyphx/business';
import { Session } from 'next-auth';

const handler = async (req, res) => {
  await Initializer.init();
  const { method } = req;

  if (method === 'DELETE') {
    const session = (await validateSession(req, res)) as Session;
    workspaceService
      .deleteWorkspace(session?.user?.userId, session?.user?.email, req.query.workspaceSlug)
      .then((slug) => res.status(200).json({ data: { slug } }))
      .catch((error) => res.status(404).json({ errors: { error: { msg: error.message } } }));
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;