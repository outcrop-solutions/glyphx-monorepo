import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
/**
 * This interface is created to allow lookups to work with our IUser interface in mongoDb.
 * This will omit the types from IUser which are lookups and coalesce them to either objectIds
 * (the underlying  mongoose types) or the document that is related.
 */
export interface IUserDocument
  extends Omit<
    databaseTypes.IUser,
    | 'accounts'
    | 'sessions'
    | 'membership'
    | 'invitedMembers'
    | 'createdWorkspaces'
    | 'webhooks'
    | 'projects'
  > {
  accounts: mongooseTypes.ObjectId[];
  sessions: mongooseTypes.ObjectId[];
  membership: mongooseTypes.ObjectId[];
  invitedMembers: mongooseTypes.ObjectId[];
  createdWorkspaces: mongooseTypes.ObjectId[];
  webhooks: mongooseTypes.ObjectId[];
  projects: mongooseTypes.ObjectId[];
}
