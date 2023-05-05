import {Types as mongooseTypes} from 'mongoose';
import {IProject} from './iProject';
import {IFileStats} from '../fileIngestion';
import {IUser} from './iUser';
import {Camera, Property} from '../web';

// only created via user input
// immutable
export interface IState {
  _id?: mongooseTypes.ObjectId;
  createdBy: IUser;
  createdAt: Date;
  deletedAt?: Date;
  name: string;
  updatedAt: Date;
  version: number;
  static: boolean;
  camera: Camera;
  properties: Record<string, Property>;
  fileSystemHash: string; // corresponds to MD5 hash of S3 directory structure (if hash changes, projects templates that attach to a this state  are invalidated)
  description?: string;
  project: IProject;
  fileSystem: IFileStats[];
}

// <uuid>.sdt
// <uuid>.sgc
// <uuid>.sgn
// <run2uuid>.sdt
// <run2uuid>.sgc
// <run2uuid>.sgn
