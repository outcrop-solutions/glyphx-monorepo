import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IStateCreateInput
  extends Omit<databaseTypes.IState, '_id' | 'createdAt' | 'updatedAt' | 'workspace' | 'project' | 'createdBy'> {
  workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
  project: mongooseTypes.ObjectId | databaseTypes.IProject;
  createdBy: mongooseTypes.ObjectId | databaseTypes.IUser;
}
