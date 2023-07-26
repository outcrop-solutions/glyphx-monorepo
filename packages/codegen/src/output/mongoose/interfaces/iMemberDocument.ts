import { database as databaseTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';

export interface IMemberCreateInput extends Omit<databaseTypes.IMember, 'user' | 'user' | 'workspace' | 'project'> {
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
  workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
  project: mongooseTypes.ObjectId | databaseTypes.IProject;
}
