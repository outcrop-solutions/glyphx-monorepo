import {Types as mongooseTypes} from 'mongoose';
import {IProject} from './iProject';
import {ITag} from './iTag';

export interface IProjectTemplate {
  _id?: mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  projects: IProject[];
  tags: ITag[];
  shape: Record<string, {type: string; required: boolean; description: string}>;
}
