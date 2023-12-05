// THIS CODE WAS AUTOMATICALLY GENERATED
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
  updateWorkspaceWithFilter(
    filter: Record<string, unknown>,
    workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>
  ): Promise<databaseTypes.IWorkspace>;
  updateWorkspaceById(
    workspaceId: string,
    workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>
  ): Promise<databaseTypes.IWorkspace>;
  deleteWorkspaceById(workspaceId: string): Promise<void>;
  validateUpdateObject(workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>): Promise<void>;
  addTags(workspaceId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IWorkspace>;
  removeTags(workspaceId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IWorkspace>;
  validateTags(tags: (databaseTypes.ITag | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addCreator(workspaceId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IWorkspace>;
  removeCreator(workspaceId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IWorkspace>;
  validateCreator(user: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId>;
  addMembers(workspaceId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IWorkspace>;
  removeMembers(workspaceId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IWorkspace>;
  validateMembers(members: (databaseTypes.IMember | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addProjects(workspaceId: string, projects: (databaseTypes.IProject | string)[]): Promise<databaseTypes.IWorkspace>;
  removeProjects(workspaceId: string, projects: (databaseTypes.IProject | string)[]): Promise<databaseTypes.IWorkspace>;
  validateProjects(projects: (databaseTypes.IProject | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addFilesystems(
    workspaceId: string,
    filesystems: (databaseTypes.IFileStats | string)[]
  ): Promise<databaseTypes.IWorkspace>;
  removeFilesystems(
    workspaceId: string,
    fileStats: (databaseTypes.IFileStats | string)[]
  ): Promise<databaseTypes.IWorkspace>;
  validateFilesystems(fileStats: (databaseTypes.IFileStats | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addStates(workspaceId: string, states: (databaseTypes.IState | string)[]): Promise<databaseTypes.IWorkspace>;
  removeStates(workspaceId: string, states: (databaseTypes.IState | string)[]): Promise<databaseTypes.IWorkspace>;
  validateStates(states: (databaseTypes.IState | string)[]): Promise<mongooseTypes.ObjectId[]>;
}
