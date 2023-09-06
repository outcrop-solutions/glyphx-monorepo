import {check} from 'express-validator';
import {initMiddleware, validateMiddleware} from '../lib';

const rules = [
  check('name').isLength({min: 1, max: 16}).withMessage('Name must be provided and must not exceed 16 characters'),
];

const validateCreateWorkspace = initMiddleware(validateMiddleware(rules));

export default validateCreateWorkspace;
