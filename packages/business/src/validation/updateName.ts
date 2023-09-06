import {check} from 'express-validator';
import {initMiddleware, validateMiddleware} from '../lib';

const rules = [
  check('name').isLength({min: 1, max: 32}).withMessage('Name must be provided and must not exceed 32 characters'),
];

const validateUpdateName = initMiddleware(validateMiddleware(rules));

export default validateUpdateName;
