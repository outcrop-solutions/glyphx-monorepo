import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectDocument
  extends Omit<databaseTypes.IProject,  | 'workspace' | 'template' | 'members' | 'tags' | 'stateHistory' | 'files'> {
            workspace: mongooseTypes.ObjectId;
            template: mongooseTypes.ObjectId;
                members: mongooseTypes.ObjectId[];
                tags: mongooseTypes.ObjectId[];
                stateHistory: mongooseTypes.ObjectId[];
                files: mongooseTypes.ObjectId[];
}
