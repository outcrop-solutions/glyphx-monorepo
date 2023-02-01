import initMiddleware from 'lib/server/initMiddleware';
import validate from 'lib/server/sessionCheck';

// eslint-disable-next-line @typescript-eslint/naming-convention
const validateSession = initMiddleware(validate());

export default validateSession;
