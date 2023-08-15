// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IUserDocument
  extends Omit<
    databaseTypes.IUser,
    | 'accounts'
    | 'sessions'
    | 'membership'
    | 'invitedMembers'
    | 'createdWorkspaces'
    | 'projects'
    | 'customerPayment'
    | 'webhooks'
  > {
  accounts: mongooseTypes.ObjectId[];
  sessions: mongooseTypes.ObjectId[];
  membership: mongooseTypes.ObjectId[];
  invitedMembers: mongooseTypes.ObjectId[];
  createdWorkspaces: mongooseTypes.ObjectId[];
  projects: mongooseTypes.ObjectId[];
  customerPayment: mongooseTypes.ObjectId;
  webhooks: mongooseTypes.ObjectId[];
}
