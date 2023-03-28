import {Types as mongooseTypes} from 'mongoose';
import {IFileStats} from '../fileIngestion';
import {IWorkspace} from './iWorkspace';
import {IProjectType} from './iProjectType';
import {IUser} from './iUser';
import {IState} from './iState';

export interface IProject {
  _id?: mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  sdtPath?: string;
  workspace: IWorkspace;
  slug?: string;
  isTemplate: Boolean;
  type?: IProjectType;
  owner: IUser;
  // when filters and properties change, sent to create model call
  state?: Omit<
    IState,
    'createdAt' | 'updatedAt' | 'description' | 'project' | '_id'
  >;
  files: IFileStats[];
  viewName?: string;
}
