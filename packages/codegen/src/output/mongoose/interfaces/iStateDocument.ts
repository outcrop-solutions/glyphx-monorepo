import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IStateDocument
  extends Omit<databaseTypes.IState,  | 'createdBy' | 'project' | 'workspace' | 'fileSystem'> {
            createdBy: mongooseTypes.ObjectId;
            project: mongooseTypes.ObjectId;
            workspace: mongooseTypes.ObjectId;
                fileSystem: mongooseTypes.ObjectId[];
}
