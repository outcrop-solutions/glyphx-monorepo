import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
/**
 * This interface is created to allow lookups to work with our IUser interface in mongoDb.
 * This will omit the types from IUser which are lookups and coalesce them to either objectIds
 * (the underlying  mongoose types) or the document that is related.
 */
export interface IMemberDocument extends Omit<databaseTypes.IMember, 'member' | 'invitedBy' | 'workspace' | 'project'> {
  member: mongooseTypes.ObjectId;
  invitedBy: mongooseTypes.ObjectId;
  workspace: mongooseTypes.ObjectId;
  project?: mongooseTypes.ObjectId;
}
