import {database} from '@glyphx/types';
import {check} from 'express-validator';
import {initMiddleware, validateMiddleware} from '../lib';
// eslint-disable-next-line @typescript-eslint/naming-convention
const rules = [
  check('members')
    .isArray()
    .withMessage('Members data must be a list of emails and roles'),
  check('members.*.email').isEmail().withMessage('Email must be valid'),
  check('members.*.role')
    .isIn([database.constants.ROLE.MEMBER, database.constants.ROLE.OWNER])
    .withMessage('Rule must either be MEMBER or OWNER'),
];

// eslint-disable-next-line @typescript-eslint/naming-convention
const validateWorkspaceInvite = initMiddleware(validateMiddleware(rules));

export default validateWorkspaceInvite;
