// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {IUserDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_USER = {
  userCode: 'userCode',
  name: 'name',
  username: 'username',
  ghUsername: 'ghUsername',
  email: 'email',
  emailVerified: 'emailVerified',
  isVerified: 'isVerified',
  image: 'image',
  accounts: [],
  sessions: [],
  membership: [],
  invitedMembers: [],
  createdWorkspaces: [],
  projects: [],
  customerPayment: {},
  webhooks: [],
  apiKey: 'apiKey',
} as unknown as IUserDocument;
