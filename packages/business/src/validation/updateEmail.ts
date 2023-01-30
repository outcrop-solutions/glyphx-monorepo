import { check } from 'express-validator';
import initMiddleware from 'lib/server/initMiddleware';
import validate from 'lib/server/validate';

const rules = [check('email').isEmail().withMessage('Email must be valid')];

const validateUpdateName = initMiddleware(validate(rules));

export default validateUpdateName;
