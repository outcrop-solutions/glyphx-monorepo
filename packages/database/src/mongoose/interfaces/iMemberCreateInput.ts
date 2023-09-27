import {databaseTypes} from 'types';

export interface IMemberCreateInput
  extends Omit<
    databaseTypes.IMember,
    '_id' | 'createdAt' | 'updatedAt' | 'invitedAt' | 'joinedAt' | 'member' | 'invitedBy' | 'workspace' | 'project'
  > {
  member: string | databaseTypes.IUser;
  invitedBy: string | databaseTypes.IUser;
  workspace: string | databaseTypes.IWorkspace;
  project?: string | databaseTypes.IProject;
}
