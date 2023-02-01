import {check} from 'express-validator';
import initMiddleware from 'lib/server/initMiddleware';
import validate from 'lib/server/validate';

// eslint-disable-next-line @typescript-eslint/naming-convention
const rules = [
  check('name')
    .isLength({min: 1, max: 16})
    .withMessage('Name must be provided and must not exceed 16 characters'),
];

// eslint-disable-next-line @typescript-eslint/naming-convention
const validateUpdateWorkspaceName = initMiddleware(validate(rules));

export default validateUpdateWorkspaceName;
