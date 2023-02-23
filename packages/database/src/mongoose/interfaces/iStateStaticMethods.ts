import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IStateMethods} from './iStateMethods';
export interface IStateStaticMethods
  extends Model<databaseTypes.IState, {}, IStateMethods> {
  stateIdExists(stateId: mongooseTypes.ObjectId): Promise<boolean>;
  createState(
    input: Omit<databaseTypes.IState, '_id'>
  ): Promise<databaseTypes.IState>;
  getStateById(stateId: mongooseTypes.ObjectId): Promise<databaseTypes.IState>;
  queryStates(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IState>>;
  updateStateWithFilter(
    filter: Record<string, unknown>,
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<void>;
  updateStateById(
    stateId: mongooseTypes.ObjectId,
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<databaseTypes.IState>;
  deleteStateById(stateId: mongooseTypes.ObjectId): Promise<void>;
  validateProjects(
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateUpdateObject(
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<void>;
  addProjects(
    stateId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState>;
  removeProjects(
    stateId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState>;
}
