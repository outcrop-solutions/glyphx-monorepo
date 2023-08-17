// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IStateCreateInput
  extends Omit<
    databaseTypes.IState,
    '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'project' | 'workspace'
  > {
  createdBy: mongooseTypes.ObjectId | databaseTypes.IUser;
  project: mongooseTypes.ObjectId | databaseTypes.IProject;
  workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
}
