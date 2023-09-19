// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectDocument
  extends Omit<databaseTypes.IProject,  | 'workspace' | 'template'> {
            workspace: mongooseTypes.ObjectId;
            template: mongooseTypes.ObjectId;
}
