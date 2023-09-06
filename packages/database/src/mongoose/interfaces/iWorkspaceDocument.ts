import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IWorkspaceDocument
  extends Omit<databaseTypes.IWorkspace, 'states' | 'projects' | 'members' | 'creator' | 'tags'> {
  projects: mongooseTypes.ObjectId[];
  states: mongooseTypes.ObjectId[];
  members: mongooseTypes.ObjectId[];
  creator: mongooseTypes.ObjectId;
  tags: mongooseTypes.ObjectId[];
}
