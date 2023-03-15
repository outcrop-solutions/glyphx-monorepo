import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
/**
 * This interface is created to allow lookups to work with our IUser interface in mongoDb.
 * This will omit the types from IUser which are lookups and coalesce them to either objectIds
 * (the underlying  mongoose types) or the document that is related.
 */
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
    | 'webhooks'
    | 'projects'
    | 'customerPayment'
  > {
  accounts: (mongooseTypes.ObjectId | databaseTypes.IAccount)[];
  sessions: (mongooseTypes.ObjectId | databaseTypes.ISession)[];
  membership: (mongooseTypes.ObjectId | databaseTypes.IMember)[];
  invitedMembers: (mongooseTypes.ObjectId | databaseTypes.IMember)[];
  createdWorkspaces: (mongooseTypes.ObjectId | databaseTypes.IWorkspace)[];
  webhooks: (mongooseTypes.ObjectId | databaseTypes.IWebhook)[];
  projects: (mongooseTypes.ObjectId | databaseTypes.IProject)[];
  customerPayment: mongooseTypes.ObjectId | databaseTypes.ICustomerPayment;
}
