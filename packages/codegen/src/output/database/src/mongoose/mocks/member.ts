// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {IMemberDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_MEMBER = {
  email: 'email',
  inviter: 'inviter',
  type: databaseTypes.MEMBERSHIP_TYPE.PROJECT,
  invitedAt: 'invitedAt',
  joinedAt: 'joinedAt',
  status: databaseTypes.INVITATION_STATUS.ACCEPTED,
  teamRole: databaseTypes.ROLE.MEMBER,
  projectRole: databaseTypes.PROJECT_ROLE.READ_ONLY,
  member: {},
  invitedBy: {},
  workspace: {},
  project: {},
} as unknown as IMemberDocument;
