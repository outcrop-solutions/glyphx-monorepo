import {Types as mongooseTypes} from 'mongoose';
import {IFileStats} from '../fileIngestion';
import {IWorkspace} from './iWorkspace';
import {IProjectType} from './iProjectType';
import {IUser} from './iUser';
import {IState} from './iState';
import {IMember} from './iMember';

export interface IProject {
  _id?: mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  deletedAt?: Date;
  sdtPath?: string;
  workspace: IWorkspace;
  lastOpened?: Date;
  slug?: string;
  isTemplate: Boolean;
  type?: IProjectType;
  members: IMember[];
  owner: IUser;
  currentVersion?: number;
  // when filters and properties change, sent to create model call on filter apply or change in properties (given 3 props are dropped)
  // duplicated to new immutable state object when user clicks to add new state
  // stored as 'Json' BSON type in mongo
  state?: Omit<
    IState,
    | 'createdAt'
    | 'updatedAt'
    | 'fileSystem'
    | 'description'
    | 'version'
    | 'static'
    | 'camera'
    | 'fileSystemHash'
    | 'project'
    | 'createdBy'
    | '_id'
  >;
  stateHistory?: IState[];
  files: IFileStats[];
  viewName?: string;
}
