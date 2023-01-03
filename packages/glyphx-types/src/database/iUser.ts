import {Types as mongooseTypes} from 'mongoose';
import {IOrganization} from './iOrganization';
import {IProject} from './iProject';
import {IAccount} from './iAccount';
import {ISession} from './iSession';
import {ROLE} from './constants';
import {IWebhook} from './iWebhook';

export interface IUser {
  _id: mongooseTypes.ObjectId;
  name: string;
  username: string;
  gh_username?: string;
  email: string;
  emailVerified?: Date;
  isVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  accounts: IAccount[];
  sessions: ISession[];
  webhooks: IWebhook[];
  organization: IOrganization;
  orgId: mongooseTypes.ObjectId;
  apiKey?: string;
  role: ROLE;
  ownedOrgs: IOrganization[];
  projects: IProject[];
}
