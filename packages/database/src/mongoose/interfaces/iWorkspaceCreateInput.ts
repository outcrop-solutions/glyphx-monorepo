// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IWorkspaceCreateInput
  extends Omit<
    databaseTypes.IWorkspace,
    '_id' | 'createdAt' | 'updatedAt' | 'tags' | 'creator' | 'members' | 'projects' | 'filesystem' | 'states'
  > {
  tags: (string | databaseTypes.ITag)[];
  creator: string | databaseTypes.IUser;
  members: (string | databaseTypes.IMember)[];
  projects: (string | databaseTypes.IProject)[];
  filesystem: (string | databaseTypes.IFileStats)[];
  states: (string | databaseTypes.IState)[];
}
