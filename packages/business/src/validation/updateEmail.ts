import {check} from 'express-validator';
import {initMiddleware, validateMiddleware} from '../lib';

const rules = [check('email').isEmail().withMessage('Email must be valid')];

const validateUpdateEmail = initMiddleware(validateMiddleware(rules));

export default validateUpdateEmail;
