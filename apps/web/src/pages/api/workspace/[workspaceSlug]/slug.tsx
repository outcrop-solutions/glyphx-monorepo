import { validateUpdateWorkspaceSlug, validateSession, WorkspaceService } from '@glyphx/business';
import { Session } from 'next-auth';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    const session = (await validateSession(req, res)) as Session;
    let { slug } = req.body;
    await validateUpdateWorkspaceSlug(req, res);
    WorkspaceService.updateWorkspaceSlug(session?.user?.userId, session?.user?.email, slug, req.query.workspaceSlug)
      .then((slug) => res.status(200).json({ data: { slug } }))
      .catch((error) => res.status(404).json({ errors: { error: { msg: error.message } } }));
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
