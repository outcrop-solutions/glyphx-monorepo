// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectDocument
  extends Omit<
    databaseTypes.IProject,
    'workspace' | 'template' | 'members' | 'tags' | 'states'
  > {
  workspace: mongooseTypes.ObjectId;
  template: mongooseTypes.ObjectId;
  members: mongooseTypes.ObjectId[];
  tags: mongooseTypes.ObjectId[];
  states: mongooseTypes.ObjectId[];
}
