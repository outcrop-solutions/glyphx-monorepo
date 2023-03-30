import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IStateCreateInput
  extends Omit<
    databaseTypes.IState,
    '_id' | 'createdAd' | 'updatedAt' | 'projects'
  > {
  projects: (mongooseTypes.ObjectId | databaseTypes.IProject)[];
}
