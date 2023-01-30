import { check } from 'express-validator';
import initMiddleware from 'lib/server/initMiddleware';
import validate from 'lib/server/validate';

const rules = [
  check('name').isLength({ min: 1, max: 16 }).withMessage('Name must be provided and must not exceed 16 characters'),
];

const validateUpdateWorkspaceName = initMiddleware(validate(rules));

export default validateUpdateWorkspaceName;
