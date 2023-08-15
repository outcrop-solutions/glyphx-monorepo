import {Types as mongooseTypes} from 'mongoose';
import {IProject} from './iProject';
import {IProjectTemplate} from './iProjectTemplate';
import {IWorkspace} from './iWorkspace';

export interface ITag {
  _id?: mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  workspaces: IWorkspace[];
  templates: IProjectTemplate[];
  projects: IProject[];
  value: string;
}
