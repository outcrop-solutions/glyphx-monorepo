import {databaseTypes} from 'types';

export interface IWorkspaceCreateInput
  extends Omit<
    databaseTypes.IWorkspace,
    '_id' | 'createdAt' | 'updatedAt' | 'creator' | 'members' | 'projects' | 'states' | 'tags'
  > {
  creator: string | databaseTypes.IUser;
  members: (string | databaseTypes.IMember)[];
  projects: (string | databaseTypes.IProject)[];
  tags: (string | databaseTypes.ITag)[];
  states: (string | databaseTypes.IState)[];
}
