// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface ITagCreateInput
  extends Omit<databaseTypes.ITag, '_id' | 'createdAt' | 'updatedAt' | 'workspaces' | 'templates' | 'projects'> {
  workspaces: (string | databaseTypes.IWorkspace)[];
  templates: (string | databaseTypes.IProjectTemplate)[];
  projects: (string | databaseTypes.IProject)[];
}
