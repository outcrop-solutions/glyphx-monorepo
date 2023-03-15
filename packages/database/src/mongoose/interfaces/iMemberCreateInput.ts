import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IMemberCreateInput
  extends Omit<
    databaseTypes.IMember,
    | '_id'
    | 'createdAt'
    | 'updatedAt'
    | 'invitedAt'
    | 'joinedAt'
    | 'member'
    | 'invitedBy'
    | 'workspace'
  > {
  member: mongooseTypes.ObjectId | databaseTypes.IMember;
  invitedBy: mongooseTypes.ObjectId | databaseTypes.IUser;
  workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
}
