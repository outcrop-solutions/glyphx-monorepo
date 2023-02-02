import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IStateDocument extends Omit<databaseTypes.IState, 'projects'> {
  projects: mongooseTypes.ObjectId[];
}
