import {Types as mongooseTypes} from 'mongoose';
import {IProject} from './iProject';

export interface IProjectType {
  _id?: mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  projects: IProject[];
  shape: Record<string, {type: string; required: boolean}>;
}
