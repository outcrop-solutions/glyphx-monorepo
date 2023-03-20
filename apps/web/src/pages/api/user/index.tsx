import { validateSession, userService, Initializer } from '@glyphx/business';
import {  } from '@glyphx/business';
import { Session } from 'next-auth';

const ALLOW_DEACTIVATION = false;

const handler = async (req, res) => {
  await Initializer.init()
  
  const { method } = req;

  if (method === 'DELETE') {
    const session = await validateSession(req, res) as Session;
    if (ALLOW_DEACTIVATION) {
      
      await userService.deactivate(session?.user?.userId);
    }

    res.status(200).json({ data: { email: session?.user?.email } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
