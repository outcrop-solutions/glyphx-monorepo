// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IStateDocument extends Omit<databaseTypes.IState, 'createdBy' | 'project' | 'workspace' | 'document'> {
  createdBy: mongooseTypes.ObjectId;
  project: mongooseTypes.ObjectId;
  workspace: mongooseTypes.ObjectId;
  document: mongooseTypes.ObjectId;
}
