import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';
import {ACCOUNT_TYPE, ACCOUNT_PROVIDER, TOKEN_TYPE, SESSION_STATE} from './constants';

export interface IAccount {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  type: ACCOUNT_TYPE;
  userId?: string;
  provider: ACCOUNT_PROVIDER;
  providerAccountId: string;
  refresh_token: string;
  refresh_token_expires_in: number;
  access_token: string;
  expires_at: number;
  token_type: TOKEN_TYPE;
  scope: string;
  id_token: string;
  session_state: SESSION_STATE;
  oauth_token_secret: string;
  oauth_token: string;
  user: IUser;
}
