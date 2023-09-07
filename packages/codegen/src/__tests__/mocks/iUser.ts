import {Types as mongooseTypes} from 'mongoose';
import {IWorkspace} from './iWorkspace';
import {IMember} from './iMember';
import {IProject} from './iProject';
import {IAccount} from './iAccount';
import {ISession} from './iSession';
import {IWebhook} from './iWebhook';
import {ICustomerPayment} from './iCustomerPayment';

export interface IUser {
  _id?: mongooseTypes.ObjectId;
  userCode: string;
  name: string;
  username: string;
  gh_username?: string;
  email: string;
  emailVerified?: Date;
  isVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  accounts: IAccount[];
  sessions: ISession[];
  membership: IMember[];
  invitedMembers: IMember[];
  createdWorkspaces: IWorkspace[];
  projects: IProject[];
  customerPayment?: ICustomerPayment;
  webhooks: IWebhook[];
  apiKey?: string;
}
