import { validateSession, membershipService, Initializer } from '@glyphx/business';

const handler = async (req, res) => {
  await Initializer.init();
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const members = await membershipService.getMembers({ slug: req.query.workspaceSlug });
    res.status(200).json({ data: { members } });
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
