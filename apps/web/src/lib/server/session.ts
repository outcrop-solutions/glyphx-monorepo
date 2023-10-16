import {authOptions} from 'app/api/auth/[...nextauth]/route';
import {getServerSession} from 'next-auth';

export const DEFAULT_SESSION = {
  user: {
    id: '645aa1458d6a87808abf59db',
    name: 'James Test',
    email: 'james@glyphx.co',
  },
  expires: new Date().toISOString(),
};

export const validateSession = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session && !process.env.GLYPHX_ENV) {
    return DEFAULT_SESSION;
  } else {
    return session;
  }
};
