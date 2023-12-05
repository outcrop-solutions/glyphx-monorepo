// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IWorkspaceDocument
  extends Omit<databaseTypes.IWorkspace, 'tags' | 'creator' | 'members' | 'projects' | 'filesystem' | 'states'> {
  tags: mongooseTypes.ObjectId[];
  creator: mongooseTypes.ObjectId;
  members: mongooseTypes.ObjectId[];
  projects: mongooseTypes.ObjectId[];
  filesystem: mongooseTypes.ObjectId[];
  states: mongooseTypes.ObjectId[];
}
