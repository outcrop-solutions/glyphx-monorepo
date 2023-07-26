import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { IWorkspaceMethods } from './iWorkspaceMethods';
import { IWorkspaceCreateInput } from './iWorkspaceCreateInput';

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
  updateWorkspaceWithFilter(
    filter: Record<string, unknown>,
    workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>
  ): Promise<databaseTypes.IWorkspace>;
  updateWorkspaceById(
    workspaceId: mongooseTypes.ObjectId,
    workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>
  ): Promise<databaseTypes.IWorkspace>;
  deleteWorkspaceById(workspaceId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(workspace: Omit<Partial<databaseTypes.IWorkspace>, '_id'>): Promise<void>;
  addUsers(
    workspaceId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace>;
  removeUsers(
    workspaceId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace>;
  validateUsers(users: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;
}
