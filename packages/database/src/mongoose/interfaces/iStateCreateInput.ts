import {databaseTypes} from 'types';

export interface IStateCreateInput
  extends Omit<databaseTypes.IState, '_id' | 'createdAt' | 'updatedAt' | 'workspace' | 'project' | 'createdBy'> {
  workspace: string | databaseTypes.IWorkspace;
  project: string | databaseTypes.IProject;
  createdBy: string | databaseTypes.IUser;
}
