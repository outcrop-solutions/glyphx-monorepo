import { userService } from '@glyphx/business';
import { validateUpdateEmail, validateSession, Initializer } from '@glyphx/business';
import { Session } from 'next-auth';

const handler = async (req, res) => {
  await Initializer.init()
  const { method } = req;

  if (method === 'PUT') {
    const session = (await validateSession(req, res)) as Session;
    await validateUpdateEmail(req, res);
    const { email } = req.body;
    await userService.updateEmail(session?.user?.userId, email, session?.user?.email);
    res.status(200).json({ data: { email } });
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
