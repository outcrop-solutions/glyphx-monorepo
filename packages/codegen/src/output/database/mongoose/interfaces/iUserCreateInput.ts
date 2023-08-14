// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
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
  accounts: (mongooseTypes.ObjectId | databaseTypes.IAccount)[];
  sessions: (mongooseTypes.ObjectId | databaseTypes.ISession)[];
  membership: (mongooseTypes.ObjectId | databaseTypes.IMember)[];
  invitedMembers: (mongooseTypes.ObjectId | databaseTypes.IMember)[];
  createdWorkspaces: (mongooseTypes.ObjectId | databaseTypes.IWorkspace)[];
  projects: (mongooseTypes.ObjectId | databaseTypes.IProject)[];
  customerPayment: mongooseTypes.ObjectId | databaseTypes.ICustomerPayment;
  webhooks: (mongooseTypes.ObjectId | databaseTypes.IWebhook)[];
}
