import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectCreateInput
  extends Omit<
    databaseTypes.IProject,
    | '_id'
    | 'createdAt'
    | 'updatedAt'
    | 'workspace'
    | 'members'
    | 'template'
    | 'tags'
  > {
  workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
  tags: (mongooseTypes.ObjectId | databaseTypes.ITag)[];
  members: (mongooseTypes.ObjectId | databaseTypes.IMember)[];
  template?: mongooseTypes.ObjectId | databaseTypes.IProjectTemplate;
}
