import {check} from 'express-validator';
import {initMiddleware, validateMiddleware} from '../lib';

// eslint-disable-next-line @typescript-eslint/naming-convention
const rules = [
  check('name')
    .isLength({min: 1, max: 32})
    .withMessage('Name must be provided and must not exceed 32 characters'),
];

// eslint-disable-next-line @typescript-eslint/naming-convention
const validateUpdateName = initMiddleware(validateMiddleware(rules));

export default validateUpdateName;
