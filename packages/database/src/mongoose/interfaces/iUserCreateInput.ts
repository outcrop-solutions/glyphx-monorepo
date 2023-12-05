// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IUserCreateInput
  extends Omit<
    databaseTypes.IUser,
    | '_id'
    | 'createdAt'
    | 'updatedAt'
    | 'accounts'
    | 'sessions'
    | 'membership'
    | 'invitedMembers'
    | 'createdWorkspaces'
    | 'projects'
    | 'customerPayment'
    | 'webhooks'
  > {
  accounts: (string | databaseTypes.IAccount)[];
  sessions: (string | databaseTypes.ISession)[];
  membership: (string | databaseTypes.IMember)[];
  invitedMembers: (string | databaseTypes.IMember)[];
  createdWorkspaces: (string | databaseTypes.IWorkspace)[];
  projects: (string | databaseTypes.IProject)[];
  customerPayment: string | databaseTypes.ICustomerPayment;
  webhooks: (string | databaseTypes.IWebhook)[];
}
