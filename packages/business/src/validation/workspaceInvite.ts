import { ROLE } from '@glyphx/types/src/database/constants';
import { check } from 'express-validator';
import initMiddleware from 'lib/server/initMiddleware';
import validate from 'lib/server/validate';

const rules = [
  check('members').isArray().withMessage('Members data must be a list of emails and roles'),
  check('members.*.email').isEmail().withMessage('Email must be valid'),
  check('members.*.role').isIn([ROLE.MEMBER, ROLE.OWNER]).withMessage('Rule must either be MEMBER or OWNER'),
];

const validateWorkspaceInvite = initMiddleware(validate(rules));

export default validateWorkspaceInvite;
