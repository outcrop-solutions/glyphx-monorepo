import {Types as mongooseTypes} from 'mongoose';
import {IFileStats} from '../fileIngestion';
import {IWorkspace} from './iWorkspace';
import {IProjectTemplate as IProjectTemplate} from './iProjectTemplate';
import {IState} from './iState';
import {IMember} from './iMember';
import {Aspect} from '../web';
import {ITag} from './iTag';

export interface IProject {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  deletedAt?: Date;
  sdtPath?: string;
  workspace: IWorkspace;
  lastOpened?: Date;
  imageHash?: string;
  aspectRatio?: Aspect;
  slug?: string;
  template?: IProjectTemplate;
  members: IMember[];
  tags: ITag[];
  currentVersion?: number;
  docId?: string;
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
    | 'aspectRatio'
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
