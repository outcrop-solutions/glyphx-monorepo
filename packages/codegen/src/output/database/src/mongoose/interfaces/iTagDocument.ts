// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface ITagDocument
  extends Omit<databaseTypes.ITag, 'workspaces' | 'templates' | 'projects'> {
  workspaces: mongooseTypes.ObjectId[];
  templates: mongooseTypes.ObjectId[];
  projects: mongooseTypes.ObjectId[];
}
