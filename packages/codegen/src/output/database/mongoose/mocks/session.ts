// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from '../../../../../database';
import {ISessionDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_SESSION = {
  userId: 'userId',
  sessionToken: 'sessionToken',
  expires: 'expires',
  user: {},
} as unknown as ISessionDocument;