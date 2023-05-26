import {Types as mongooseTypes} from 'mongoose';
import {IFileStats} from '../fileIngestion';
import {IWorkspace} from './iWorkspace';
import {IProjectType} from './iProjectType';
import {IState} from './iState';
import {IMember} from './iMember';
import {IAnnotation} from './iAnnotation';

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
  currentVersion?: number;
  state: Omit<
    IState,
    | 'name'
    | 'createdAt'
    | 'updatedAt'
    | 'fileSystemHash'
    | 'payloadHash'
    | 'fileSystem'
    | 'description'
    | 'version'
    | 'static'
    | 'camera'
    | 'project'
    | 'workspace'
    | 'createdBy'
    | '_id'
  >;
  stateHistory: IState[];
  files: IFileStats[];
  viewName?: string;
}

// CONDITION 1
//when filters and properties change, sent to create model call on filter apply or change in properties(given 3 props are dropped)
// CONDITION 2
// camera position change
