// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectDocument
  extends Omit<databaseTypes.IProject, 'workspace' | 'template' | 'members' | 'tags' | 'states' | 'filesystem'> {
  workspace: mongooseTypes.ObjectId;
  template: mongooseTypes.ObjectId;
  members: mongooseTypes.ObjectId[];
  tags: mongooseTypes.ObjectId[];
  states: mongooseTypes.ObjectId[];
  filesystem: mongooseTypes.ObjectId[];
}
