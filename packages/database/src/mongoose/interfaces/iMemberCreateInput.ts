// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IMemberCreateInput
  extends Omit<
    databaseTypes.IMember,
    '_id' | 'createdAt' | 'updatedAt' | 'member' | 'invitedBy' | 'workspace' | 'project'
  > {
  member: string | databaseTypes.IUser;
  invitedBy: string | databaseTypes.IUser;
  workspace: string | databaseTypes.IWorkspace;
  project: string | databaseTypes.IProject;
}
