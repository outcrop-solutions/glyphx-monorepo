import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { IStateMethods } from './iStateMethods';
import { IStateCreateInput } from './iStateCreateInput';

export interface IStateStaticMethods extends Model<databaseTypes.IState, {}, IStateMethods> {
  stateIdExists(stateId: mongooseTypes.ObjectId): Promise<boolean>;
  allStateIdsExist(stateIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createState(input: IStateCreateInput): Promise<databaseTypes.IState>;
  getStateById(stateId: mongooseTypes.ObjectId): Promise<databaseTypes.IState>;
  queryStates(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IState>>;
  updateStateWithFilter(
    filter: Record<string, unknown>,
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<databaseTypes.IState>;
  updateStateById(
    stateId: mongooseTypes.ObjectId,
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<databaseTypes.IState>;
  deleteStateById(stateId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(state: Omit<Partial<databaseTypes.IState>, '_id'>): Promise<void>;
  addUsers(
    stateId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState>;
  removeUsers(
    stateId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState>;
  validateUsers(users: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;

  addProjects(
    stateId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState>;
  removeProjects(
    stateId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState>;
  validateProjects(projects: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;

  addWorkspaces(
    stateId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState>;
  removeWorkspaces(
    stateId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState>;
  validateWorkspaces(
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
}
