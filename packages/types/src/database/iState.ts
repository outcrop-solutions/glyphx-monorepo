import {Types as mongooseTypes} from 'mongoose';
import {IProject} from './iProject';
import {IFileStats} from '../fileIngestion';
import {IUser} from './iUser';
import {Property} from '../web';

// only created via user input
// immutable
export interface IState {
  _id?: mongooseTypes.ObjectId;
  createdBy: IUser;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  static: boolean;
  camera: number;
  properties: Record<string, Property>;
  fileSystemHash: string; // corresponds to MD5 hash of S3 directory structure (if hash changes, projects templates that attach to a this state  are invalidated)
  description?: string;
  project: IProject;
  fileSystem: IFileStats[];
}
