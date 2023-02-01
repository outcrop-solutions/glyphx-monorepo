import type { Role, Member } from '@prisma/client';

import { validateSession, getMember, toggleRole } from '@glyphx/business';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    await validateSession(req, res);
    const { memberId } = req.body;
    const member = getMember(memberId);
    await toggleRole(
      memberId,
      // @ts-ignore
      member.teamRole === Role.MEMBER ? Role.OWNER : Role.MEMBER
    );
    res.status(200).json({ data: { updatedAt: new Date() } });
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
