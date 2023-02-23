import { database as databaseTypes } from '@glyphx/types';

import { validateSession, MembershipService } from '@glyphx/business';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    await validateSession(req, res);
    const { memberId } = req.body;
    const member = MembershipService.getMember(memberId);
    await MembershipService.toggleRole(
      memberId,
      // @ts-ignore
      member.teamRole === database.constants.ROLE.MEMBER
        ? databaseTypes.constants.ROLE.OWNER
        : databaseTypes.constants.ROLE.MEMBER
    );
    res.status(200).json({ data: { updatedAt: new Date() } });
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
