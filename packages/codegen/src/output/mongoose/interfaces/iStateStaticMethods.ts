import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IStateMethods} from './iStateMethods';
import {IStateCreateInput} from './iStateCreateInput';

export interface IStateStaticMethods
  extends Model<databaseTypes.IState, {}, IStateMethods> {
  stateIdExists(stateId: mongooseTypes.ObjectId): Promise<boolean>;
  allStateIdsExist(stateIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createState(input: IStateCreateInput): Promise<databaseTypes.IState>;
  getStateById(stateId: mongooseTypes.ObjectId): Promise<databaseTypes.IState>;
  queryStates(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IState>>;
  updateStateWithFilter(filter: Record<string, unknown>, state: Omit<Partial<databaseTypes.IState>, '_id'>): Promise<databaseTypes.IState>;
  updateStateById(stateId: mongooseTypes.ObjectId, state: Omit<Partial<databaseTypes.IState>, '_id'>): Promise<databaseTypes.IState>;
  deleteStateById(stateId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(state: Omit<Partial<databaseTypes.IState>, '_id'>): Promise<void>;
      addCreatedBy(
        stateId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IState>;
      removeCreatedBy(
        stateId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IState>;
      validateCreatedBy(
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
          addProject(
        stateId: mongooseTypes.ObjectId, 
        project: databaseTypes.IProject | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IState>;
      removeProject(
        stateId: mongooseTypes.ObjectId, 
        project: databaseTypes.IProject | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IState>;
      validateProject(
        project: databaseTypes.IProject | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
          addWorkspace(
        stateId: mongooseTypes.ObjectId, 
        workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IState>;
      removeWorkspace(
        stateId: mongooseTypes.ObjectId, 
        workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IState>;
      validateWorkspace(
        workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
          addFileSystems(
        stateId: mongooseTypes.ObjectId, 
        fileStats: (databaseTypes.IFileStats | mongooseTypes.ObjectId)[]
      ): Promise<databaseTypes.IState>;
      removeFileSystems(
        stateId: mongooseTypes.ObjectId, 
        fileStats: (databaseTypes.IFileStats | mongooseTypes.ObjectId)[]
      ): Promise<databaseTypes.IState>;
      validateFileSystems(
        fileStats: (databaseTypes.IFileStats | mongooseTypes.ObjectId)[]
      ): Promise<mongooseTypes.ObjectId[]>;
}
