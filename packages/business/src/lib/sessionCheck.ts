import {getSession} from 'next-auth/react';

export function validateSessionMiddleware() {
  return async (req, res, next) => {
    const session = await getSession({req});
    const errors = [] as any[];

    if (!session) {
      // errors.push({param: 'session', msg: 'Unauthorized access'});
      return next({
        user: {
          userId: '645aa1458d6a87808abf59db',
          name: 'James Graham',
          email: 'james@glyphx.co',
        },
        expires: new Date().toISOString(),
      });
    } else {
      return next(session);
    }

    const errorObject = {};

    errors.forEach(error => (errorObject[error.param] = error));
    res.status(401).json({errors: errorObject});
  };
}
