import { Initializer, validateSession, workspaceService } from '@glyphx/business';
import { Session } from 'next-auth';
const handler = async (req, res) => {
  await Initializer.init()
  const { method } = req;

  if (method === 'POST') {
    const session = (await validateSession(req, res)) as Session;
    const { workspaceCode } = req.body;
    workspaceService.joinWorkspace(workspaceCode, session?.user?.email)
      .then((joinedAt) => res.status(200).json({ data: { joinedAt } }))
      .catch((error) => res.status(404).json({ errors: { error: { msg: error.message } } }));
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
