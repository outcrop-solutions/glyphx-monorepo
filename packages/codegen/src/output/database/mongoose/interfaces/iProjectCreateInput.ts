// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectCreateInput
  extends Omit<
    databaseTypes.IProject,
    | '_id'
    | 'createdAt'
    | 'updatedAt'
    | 'workspace'
    | 'template'
    | 'members'
    | 'tags'
    | 'states'
  > {
  workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
  template: mongooseTypes.ObjectId | databaseTypes.IProjectTemplate;
  members: (mongooseTypes.ObjectId | databaseTypes.IMember)[];
  tags: (mongooseTypes.ObjectId | databaseTypes.ITag)[];
  states: (mongooseTypes.ObjectId | databaseTypes.IState)[];
}
