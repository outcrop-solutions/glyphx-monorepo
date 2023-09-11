import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IWorkspaceMethods} from './iWorkspaceMethods';
import {IWorkspaceCreateInput} from './iWorkspaceCreateInput';
export interface IWorkspaceStaticMethods extends Model<databaseTypes.IWorkspace, {}, IWorkspaceMethods> {
  workspaceIdExists(workspaceId: mongooseTypes.ObjectId): Promise<boolean>;
  allWorkspaceIdsExist(workspaceIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createWorkspace(input: IWorkspaceCreateInput): Promise<databaseTypes.IWorkspace>;
  getWorkspaceById(workspaceId: mongooseTypes.ObjectId): Promise<databaseTypes.IWorkspace>;
  queryWorkspaces(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IWorkspace>>;
  updateWorkspaceByFilter(filter: Record<string, unknown>, input: Partial<databaseTypes.IWorkspace>): Promise<void>;
  updateWorkspaceById(
    id: mongooseTypes.ObjectId,
    input: Partial<databaseTypes.IWorkspace>
  ): Promise<databaseTypes.IWorkspace>;
  deleteWorkspaceById(workspaceId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(input: Partial<databaseTypes.IWorkspace>): Promise<boolean>;
  validateMembers(members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;
  validateProjects(projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;
  validateUser(user: databaseTypes.IUser | mongooseTypes.ObjectId): Promise<mongooseTypes.ObjectId>;
  addProjects(
    workspaceId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace>;
  removeProjects(
    workspaceId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace>;
  validateStates(states: (databaseTypes.IState | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;
  validateTags(tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;
  addStates(
    workspaceId: mongooseTypes.ObjectId,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace>;
  removeStates(
    workspaceId: mongooseTypes.ObjectId,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace>;
  addMembers(
    workspaceId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace>;
  removeMembers(
    workspaceId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace>;
  addTags(
    workspaceId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace>;
  removeTags(
    workspaceId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace>;
}
