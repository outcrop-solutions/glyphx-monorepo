import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';
import {IState} from './iState';
import {IProject} from './iProject';
import {ICustomerPayment} from './iCustomerPayment';
import {IMember} from './iMember';
import {IWebhook} from './iWebhook';
import {IWorkspace} from './iWorkspace';
import {IUserAgent} from './iUserAgent';
import {ACTION_TYPE} from '../constants/action';
import {RESOURCE_MODEL} from '../constants';
import {IProcessTracking} from './iProcessTracking';

export interface IActivityLog {
  _id?: string | mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  actor: IUser;
  workspaceId?: string | mongooseTypes.ObjectId;
  projectId?: string | mongooseTypes.ObjectId;
  location: string; // IP address
  userAgent: IUserAgent;
  action: ACTION_TYPE;
  onModel: RESOURCE_MODEL;
  resource: IUser | IState | IProject | ICustomerPayment | IMember | IWebhook | IWorkspace | IProcessTracking;
}
