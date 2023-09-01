import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface ITagCreateInput
  extends Omit<
    databaseTypes.ITag,
    '_id' | 'projects' | 'workspaces' | 'templates'
  > {
  projects: (mongooseTypes.ObjectId | databaseTypes.IProject)[];
  workspaces: (mongooseTypes.ObjectId | databaseTypes.IWorkspace)[];
  templates: (mongooseTypes.ObjectId | databaseTypes.IProjectTemplate)[];
}
