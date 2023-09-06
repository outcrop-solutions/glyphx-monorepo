import {check} from 'express-validator';
import {initMiddleware, validateMiddleware} from '../lib';

const rules = [check('email').isEmail().withMessage('Email must be valid')];

const validateUpdateName = initMiddleware(validateMiddleware(rules));

export default validateUpdateName;
