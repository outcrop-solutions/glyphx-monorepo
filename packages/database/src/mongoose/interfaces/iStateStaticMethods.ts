import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IStateMethods} from './iStateMethods';
import {IStateCreateInput} from './iStateCreateInput';
export interface IStateStaticMethods
  extends Model<databaseTypes.IState, {}, IStateMethods> {
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
  ): Promise<void>;
  updateStateById(
    stateId: mongooseTypes.ObjectId,
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<databaseTypes.IState>;
  deleteStateById(stateId: mongooseTypes.ObjectId): Promise<void>;
  validateProject(
    project: databaseTypes.IProject | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  validateUser(
    user: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  validateUpdateObject(
    state: Omit<Partial<databaseTypes.IState>, '_id'>
  ): Promise<void>;
}
