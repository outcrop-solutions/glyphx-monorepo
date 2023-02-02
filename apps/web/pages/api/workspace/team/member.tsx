import { validateSession } from '@glyphx/business/src/validation';
import { remove } from '@glyphx/business/src/services/membership';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'DELETE') {
    await validateSession(req, res);
    const { memberId } = req.body;
    await remove(memberId);
    res.status(200).json({ data: { deletedAt: new Date() } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
