import {Types as mongooseTypes} from 'mongoose';
import {IProject} from './iProject';
import {ITag} from './iTag';
import {Property} from '../web';

export interface IProjectTemplate {
  _id?: mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  community?: boolean;
  name: string;
  description: string;
  projects: IProject[];
  tags: ITag[];
  shape: Record<string, Property>;
}
