// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {IAccountDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_ACCOUNT = {
  type: databaseTypes.ACCOUNT_TYPE.GLYPHX,
  userId: 'userId',
  provider: databaseTypes.ACCOUNT_PROVIDER.COGNITO,
  providerAccountId: 'providerAccountId',
  refreshToken: 'refreshToken',
  refreshTokenExpiresIn: 'refreshTokenExpiresIn',
  accessToken: 'accessToken',
  expiresAt: 'expiresAt',
  tokenType: databaseTypes.TOKEN_TYPE.ID,
  scope: 'scope',
  idToken: 'idToken',
  sessionState: databaseTypes.SESSION_STATE.NEW,
  oauthTokenSecret: 'oauthTokenSecret',
  oauthToken: 'oauthToken',
  user: {},
} as unknown as IAccountDocument;
