import {initMiddleware, validateSessionMiddleware} from 'lib';
// eslint-disable-next-line @typescript-eslint/naming-convention
const validateSession = initMiddleware(validateSessionMiddleware());

export default validateSession;
