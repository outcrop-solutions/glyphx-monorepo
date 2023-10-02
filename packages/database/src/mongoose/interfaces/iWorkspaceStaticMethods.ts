import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IWorkspaceMethods} from './iWorkspaceMethods';
import {IWorkspaceCreateInput} from './iWorkspaceCreateInput';
export interface IWorkspaceStaticMethods extends Model<databaseTypes.IWorkspace, {}, IWorkspaceMethods> {
  workspaceIdExists(workspaceId: mongooseTypes.ObjectId): Promise<boolean>;
  allWorkspaceIdsExist(workspaceIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createWorkspace(input: IWorkspaceCreateInput): Promise<databaseTypes.IWorkspace>;
  getWorkspaceById(workspaceId: string): Promise<databaseTypes.IWorkspace>;
  queryWorkspaces(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IWorkspace>>;
  updateWorkspaceByFilter(filter: Record<string, unknown>, input: Partial<databaseTypes.IWorkspace>): Promise<void>;
  updateWorkspaceById(id: string, input: Partial<databaseTypes.IWorkspace>): Promise<databaseTypes.IWorkspace>;
  deleteWorkspaceById(workspaceId: string): Promise<void>;
  validateUpdateObject(input: Partial<databaseTypes.IWorkspace>): Promise<boolean>;
  validateMembers(members: (databaseTypes.IMember | string)[]): Promise<mongooseTypes.ObjectId[]>;
  validateProjects(projects: (databaseTypes.IProject | string)[]): Promise<mongooseTypes.ObjectId[]>;
  validateUser(user: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId>;
  addProjects(workspaceId: string, projects: (databaseTypes.IProject | string)[]): Promise<databaseTypes.IWorkspace>;
  removeProjects(workspaceId: string, projects: (databaseTypes.IProject | string)[]): Promise<databaseTypes.IWorkspace>;
  validateStates(states: (databaseTypes.IState | string)[]): Promise<mongooseTypes.ObjectId[]>;
  validateTags(tags: (databaseTypes.ITag | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addStates(workspaceId: string, states: (databaseTypes.IState | string)[]): Promise<databaseTypes.IWorkspace>;
  removeStates(workspaceId: string, states: (databaseTypes.IState | string)[]): Promise<databaseTypes.IWorkspace>;
  addMembers(workspaceId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IWorkspace>;
  removeMembers(workspaceId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IWorkspace>;
  addTags(workspaceId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IWorkspace>;
  removeTags(workspaceId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IWorkspace>;
}
