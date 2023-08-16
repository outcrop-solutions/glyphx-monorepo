// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from '../../../../../database';
import {IUserAgentDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_USERAGENT = {
  userAgent: 'userAgent',
  platform: 'platform',
  appName: 'appName',
  appVersion: 'appVersion',
  vendor: 'vendor',
  language: 'language',
  cookieEnabled: 'cookieEnabled',
} as unknown as IUserAgentDocument;