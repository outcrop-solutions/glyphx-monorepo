import { database as databaseTypes } from '@glyphx/types';

import { validateSession, membershipService, Initializer } from '@glyphx/business';

const handler = async (req, res) => {
  await Initializer.init()
  const { method } = req;

  if (method === 'PUT') {
    await validateSession(req, res);
    const { memberId } = req.body;
    const member = membershipService.getMember(memberId);
    await membershipService.toggleRole(
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
