import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface ITagDocument
  extends Omit<databaseTypes.ITag, 'projects' | 'workspaces' | 'templates'> {
  workspaces: mongooseTypes.ObjectId[];
  projects: mongooseTypes.ObjectId[];
  templates: mongooseTypes.ObjectId[];
}
