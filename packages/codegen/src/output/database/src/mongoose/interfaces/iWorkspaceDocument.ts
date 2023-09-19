// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IWorkspaceDocument
  extends Omit<databaseTypes.IWorkspace,  | 'creator'> {
            creator: mongooseTypes.ObjectId;
}
