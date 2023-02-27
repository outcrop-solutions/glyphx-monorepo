import { validateSession, MembershipService } from '@glyphx/business';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'DELETE') {
    await validateSession(req, res);
    const { memberId } = req.body;
    await MembershipService.remove(memberId);
    res.status(200).json({ data: { deletedAt: new Date() } });
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
