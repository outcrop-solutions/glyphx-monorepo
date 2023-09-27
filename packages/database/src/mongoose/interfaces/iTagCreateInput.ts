import {databaseTypes} from 'types';

export interface ITagCreateInput extends Omit<databaseTypes.ITag, '_id' | 'projects' | 'workspaces' | 'templates'> {
  projects: (string | databaseTypes.IProject)[];
  workspaces: (string | databaseTypes.IWorkspace)[];
  templates: (string | databaseTypes.IProjectTemplate)[];
}
