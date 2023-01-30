import initMiddleware from 'lib/server/initMiddleware';
import validate from 'lib/server/sessionCheck';

const validateSession = initMiddleware(validate());

export default validateSession;
