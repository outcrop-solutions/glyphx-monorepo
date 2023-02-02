import { validateSession } from '@glyphx/business';
import { deactivate } from '@glyphx/business';

const ALLOW_DEACTIVATION = false;

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'DELETE') {
    const session = await validateSession(req, res);
    if (ALLOW_DEACTIVATION) {
      // @ts-ignore
      await deactivate(session?.user?.userId);
    }
    // @ts-ignore
    res.status(200).json({ data: { email: session?.user?.email } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
