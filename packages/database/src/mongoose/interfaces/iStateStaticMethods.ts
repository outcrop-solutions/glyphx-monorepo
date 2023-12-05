// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IStateMethods} from './iStateMethods';
import {IStateCreateInput} from './iStateCreateInput';

export interface IStateStaticMethods extends Model<databaseTypes.IState, {}, IStateMethods> {
  stateIdExists(stateId: mongooseTypes.ObjectId): Promise<boolean>;
  allStateIdsExist(stateIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createState(input: IStateCreateInput): Promise<databaseTypes.IState>;
  getStateById(stateId: string): Promise<databaseTypes.IState>;
  queryStates(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IState>>;
  updateStateWithFilter(
    filter: Record<string, unknown>,
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<databaseTypes.IState>;
  updateStateById(stateId: string, state: Omit<Partial<databaseTypes.IState>, '_id'>): Promise<databaseTypes.IState>;
  deleteStateById(stateId: string): Promise<void>;
  validateUpdateObject(state: Omit<Partial<databaseTypes.IState>, '_id'>): Promise<void>;
  addCreatedBy(stateId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IState>;
  removeCreatedBy(stateId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IState>;
  validateCreatedBy(user: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId>;
  addProject(stateId: string, project: databaseTypes.IProject | string): Promise<databaseTypes.IState>;
  removeProject(stateId: string, project: databaseTypes.IProject | string): Promise<databaseTypes.IState>;
  validateProject(project: databaseTypes.IProject | string): Promise<mongooseTypes.ObjectId>;
  addWorkspace(stateId: string, workspace: databaseTypes.IWorkspace | string): Promise<databaseTypes.IState>;
  removeWorkspace(stateId: string, workspace: databaseTypes.IWorkspace | string): Promise<databaseTypes.IState>;
  validateWorkspace(workspace: databaseTypes.IWorkspace | string): Promise<mongooseTypes.ObjectId>;
  addDocument(stateId: string, document: databaseTypes.IDocument | string): Promise<databaseTypes.IState>;
  removeDocument(stateId: string, document: databaseTypes.IDocument | string): Promise<databaseTypes.IState>;
  validateDocument(document: databaseTypes.IDocument | string): Promise<mongooseTypes.ObjectId>;
}
