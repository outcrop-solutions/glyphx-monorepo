import {Types as mongooseTypes} from 'mongoose';
import {IProject} from './iProject';
import {ITag} from './iTag';
import {FIELD_TYPE} from '../fileIngestion/constants';

export interface IProjectTemplate {
  _id?: mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  name: string;
  projects: IProject[];
  tags: ITag[];
  shape: Record<string, {key: string; type: FIELD_TYPE; required: boolean; description: string}>;
}
