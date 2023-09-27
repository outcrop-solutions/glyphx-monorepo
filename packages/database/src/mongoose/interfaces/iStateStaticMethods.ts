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
  ): Promise<void>;
  updateStateById(stateId: string, state: Omit<Partial<databaseTypes.IState>, '_id'>): Promise<databaseTypes.IState>;
  deleteStateById(stateId: string): Promise<void>;
  validateProject(project: databaseTypes.IProject | string): Promise<mongooseTypes.ObjectId>;
  validateUser(user: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId>;
  validateUpdateObject(state: Omit<Partial<databaseTypes.IState>, '_id'>): Promise<void>;
}
