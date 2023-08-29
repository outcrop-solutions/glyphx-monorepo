import {check} from 'express-validator';
import {initMiddleware, validateMiddleware} from '../lib';

// eslint-disable-next-line @typescript-eslint/naming-convention
const rules = [check('email').isEmail().withMessage('Email must be valid')];

// eslint-disable-next-line @typescript-eslint/naming-convention
const validateUpdateName = initMiddleware(validateMiddleware(rules));

export default validateUpdateName;
