import {check} from 'express-validator';
import {initMiddleware, validateMiddleware} from '../lib';

// eslint-disable-next-line @typescript-eslint/naming-convention
const rules = [
  check('slug')
    .isLength({min: 1, max: 16})
    .withMessage('Slug must be provided and must not exceed 16 characters')
    .isSlug()
    .isAlphanumeric(undefined, {ignore: '-'})
    .withMessage('Hyphenated alphanumeric characters only'),
];

// eslint-disable-next-line @typescript-eslint/naming-convention
const validateUpdateWorkspaceSlug = initMiddleware(validateMiddleware(rules));

export default validateUpdateWorkspaceSlug;
