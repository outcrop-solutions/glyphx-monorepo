// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IStateDocument
  extends Omit<databaseTypes.IState, 'createdBy' | 'project' | 'workspace'> {
  createdBy: mongooseTypes.ObjectId;
  project: mongooseTypes.ObjectId;
  workspace: mongooseTypes.ObjectId;
}