import {
  validateUpdateName,
  validateSession,
} from '@glyphx/business';
import { updateName } from '@glyphx/business';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    const session = await validateSession(req, res);
    await validateUpdateName(req, res);
    const { name } = req.body;
    // @ts-ignore
    await updateName(session?.user?.userId, name);
    res.status(200).json({ data: { name } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
