// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface ITagCreateInput
  extends Omit<
    databaseTypes.ITag,
    '_id' | 'createdAt' | 'updatedAt' | 'workspaces' | 'templates' | 'projects'
  > {
  workspaces: (mongooseTypes.ObjectId | databaseTypes.IWorkspace)[];
  templates: (mongooseTypes.ObjectId | databaseTypes.IProjectTemplate)[];
  projects: (mongooseTypes.ObjectId | databaseTypes.IProject)[];
}
