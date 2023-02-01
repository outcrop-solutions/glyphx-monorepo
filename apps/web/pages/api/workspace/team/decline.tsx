import { InvitationStatus } from '@prisma/client';

import { validateSession } from '@glyphx/business/src/validation';
import { updateStatus } from '@glyphx/business/src/services/membership';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    await validateSession(req, res);
    const { memberId } = req.body;
    await updateStatus(memberId, InvitationStatus.DECLINED);
    res.status(200).json({ data: { updatedAt: new Date() } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;