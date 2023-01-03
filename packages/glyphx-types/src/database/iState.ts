import {Types as mongooseTypes} from 'mongoose';
import {IProject} from './iProject';
import {IFileStats} from '../fileIngestion';

export interface IState {
  _id: mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  static: boolean;
  fileSystemHash: string; // corresponds to MD5 hash of S3 directory structure (if hash changes, projects templates that attach to a this state  are invalidated)
  projects?: IProject[];
  fileSystem?: IFileStats[];
}
