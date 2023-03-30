import { validateSession, projectService, Initializer } from '@glyphx/business';
import {} from '@glyphx/business';
import { Session } from 'next-auth';

const handler = async (req, res) => {
  await Initializer.init();

  const { method } = req;
  const { name, workspaceId } = req.body;

  if (method === 'POST') {
    const session = (await validateSession(req, res)) as Session;

    const project = await projectService.createProject(name, session?.user?.userId, workspaceId);

    res.status(200).json({ data: project });
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
