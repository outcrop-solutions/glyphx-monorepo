import {databaseTypes} from 'types';
import {check} from 'express-validator';
import {initMiddleware, validateMiddleware} from '../lib';

const rules = [
  check('members').isArray().withMessage('Members data must be a list of emails and roles'),
  check('members.*.email').isEmail().withMessage('Email must be valid'),
  check('members.*.role')
    .isIn([databaseTypes.constants.ROLE.MEMBER, databaseTypes.constants.ROLE.OWNER])
    .withMessage('Rule must either be MEMBER or OWNER'),
];

const validateWorkspaceInvite = initMiddleware(validateMiddleware(rules));

export default validateWorkspaceInvite;
