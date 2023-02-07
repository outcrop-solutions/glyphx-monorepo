import { validateWorkspaceInvite, validateSession, inviteUsers } from '@glyphx/business';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const session = await validateSession(req, res);
    await validateWorkspaceInvite(req, res);
    const { members } = req.body;

    await inviteUsers(
      // @ts-ignore
      session?.user?.userId,
      // @ts-ignore
      session?.user?.email,
      members,
      req.query.workspaceSlug
    )
      .then((members) => res.status(200).json({ data: { members } }))
      .catch((error) => res.status(404).json({ errors: { error: { msg: error.message } } }));
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
