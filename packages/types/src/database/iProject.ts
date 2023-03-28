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
  // when filters and properties change, sent to create model call on filter apply or change in properties (given 3 props are dropped)
  // duplicated to new immutable state object when user clicks to add new state
  // stored as 'Json' BSON type in mongo
  state?: Omit<
    IState,
    | 'createdAt'
    | 'updatedAt'
    | 'description'
    | 'version'
    | 'static'
    | 'camera'
    | 'project'
    | 'createdBy'
    | '_id'
  >;
  files: IFileStats[];
  viewName?: string;
}
