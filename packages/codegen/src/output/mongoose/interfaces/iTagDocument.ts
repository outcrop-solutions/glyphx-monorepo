import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface ITagDocument
  extends Omit<databaseTypes.ITag,  | 'workspaces' | 'templates' | 'projects'> {
                workspaces: mongooseTypes.ObjectId[];
                templates: mongooseTypes.ObjectId[];
                projects: mongooseTypes.ObjectId[];
}
