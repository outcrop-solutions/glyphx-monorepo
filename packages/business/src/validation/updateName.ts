import {check} from 'express-validator';
import initMiddleware from 'lib/server/initMiddleware';
import validate from 'lib/server/validate';

// eslint-disable-next-line @typescript-eslint/naming-convention
const rules = [
  check('name')
    .isLength({min: 1, max: 32})
    .withMessage('Name must be provided and must not exceed 32 characters'),
];

// eslint-disable-next-line @typescript-eslint/naming-convention
const validateUpdateName = initMiddleware(validate(rules));

export default validateUpdateName;
