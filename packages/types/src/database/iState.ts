import {Types as mongooseTypes} from 'mongoose';
import {IProject} from './iProject';
import {IFileStats} from '../fileIngestion';
import {IUser} from './iUser';
import {Camera, Property} from '../web';
import {IWorkspace} from './iWorkspace';

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
  fileSystemHash: string; // corresponds to MD5 hash of S3 directory structure (underlying data) determines whether filtering is available
  payloadHash: string; // corresponds to unique file path derived from fileSystem hash + payload data. States will share a payloadHash if the underlying data, and payload used to generate the sdt are the same.
  description?: string;
  project: IProject;
  workspace: IWorkspace;
  fileSystem: IFileStats[];
}

// <uuid>.sdt
// <uuid>.sgc
// <uuid>.sgn
// <run2uuid>.sdt
// <run2uuid>.sgc
// <run2uuid>.sgn
