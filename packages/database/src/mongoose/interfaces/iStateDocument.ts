import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IStateDocument
  extends Omit<databaseTypes.IState, 'workspace' | 'project' | 'createdBy'> {
  workspace: mongooseTypes.ObjectId;
  project: mongooseTypes.ObjectId;
  createdBy: mongooseTypes.ObjectId;
}
