import {check} from 'express-validator';
import initMiddleware from 'lib/server/initMiddleware';
import validate from 'lib/server/validate';

// eslint-disable-next-line @typescript-eslint/naming-convention
const rules = [check('email').isEmail().withMessage('Email must be valid')];

// eslint-disable-next-line @typescript-eslint/naming-convention
const validateUpdateName = initMiddleware(validate(rules));

export default validateUpdateName;
