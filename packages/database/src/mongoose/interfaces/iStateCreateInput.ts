// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IStateCreateInput
  extends Omit<
    databaseTypes.IState,
    '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'project' | 'workspace' | 'document'
  > {
  createdBy: string | databaseTypes.IUser;
  project: string | databaseTypes.IProject;
  workspace: string | databaseTypes.IWorkspace;
  document: string | databaseTypes.IDocument;
}
