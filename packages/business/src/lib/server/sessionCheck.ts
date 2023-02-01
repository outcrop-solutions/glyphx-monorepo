import {getSession} from 'next-auth/react';

export async function validateSessionMiddleware() {
  return async (req, res, next) => {
    const session = await getSession({req});
    const errors = [];

    if (!session) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      errors.push({param: 'session', msg: 'Unauthorized access'});
    } else {
      return next(session);
    }

    const errorObject = {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    errors.forEach(error => (errorObject[error.param] = error));
    res.status(401).json({errors: errorObject});
  };
}
