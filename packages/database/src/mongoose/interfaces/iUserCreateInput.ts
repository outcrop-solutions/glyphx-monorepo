import {databaseTypes} from 'types';
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
  accounts: (string | databaseTypes.IAccount)[];
  sessions: (string | databaseTypes.ISession)[];
  membership: (string | databaseTypes.IMember)[];
  invitedMembers: (string | databaseTypes.IMember)[];
  createdWorkspaces: (string | databaseTypes.IWorkspace)[];
  webhooks: (string | databaseTypes.IWebhook)[];
  projects: (string | databaseTypes.IProject)[];
  customerPayment?: string | databaseTypes.ICustomerPayment;
}
