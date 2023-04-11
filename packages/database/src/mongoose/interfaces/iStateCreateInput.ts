import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IStateCreateInput
  extends Omit<
    databaseTypes.IState,
    '_id' | 'createdAt' | 'updatedAt' | 'project' | 'createdBy'
  > {
  project: mongooseTypes.ObjectId | databaseTypes.IProject;
  createdBy: mongooseTypes.ObjectId | databaseTypes.IUser;
}
