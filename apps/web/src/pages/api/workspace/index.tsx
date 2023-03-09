import slugify from 'slugify';

import { validateCreateWorkspace, validateSession, workspaceService, Initializer } from '@glyphx/business';
import { Session } from 'next-auth';

const handler = async (req, res) => {
  await Initializer.init();
  const { method } = req;

  if (method === 'POST') {
    const session = (await validateSession(req, res)) as Session;
    await validateCreateWorkspace(req, res);
    const { name } = req.body;
    let slug = slugify(name.toLowerCase());
    await workspaceService.createWorkspace(session?.user?.userId, session?.user?.email, name, slug);
    res.status(200).json({ data: { name, slug } });
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
