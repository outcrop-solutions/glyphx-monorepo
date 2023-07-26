import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { IProjectMethods } from './iProjectMethods';
import { IProjectCreateInput } from './iProjectCreateInput';

export interface IProjectStaticMethods extends Model<databaseTypes.IProject, {}, IProjectMethods> {
  projectIdExists(projectId: mongooseTypes.ObjectId): Promise<boolean>;
  allProjectIdsExist(projectIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProject(input: IProjectCreateInput): Promise<databaseTypes.IProject>;
  getProjectById(projectId: mongooseTypes.ObjectId): Promise<databaseTypes.IProject>;
  queryProjects(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IProject>>;
  updateProjectWithFilter(
    filter: Record<string, unknown>,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<databaseTypes.IProject>;
  updateProjectById(
    projectId: mongooseTypes.ObjectId,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<databaseTypes.IProject>;
  deleteProjectById(projectId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(project: Omit<Partial<databaseTypes.IProject>, '_id'>): Promise<void>;
  addWorkspaces(
    projectId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  removeWorkspaces(
    projectId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  validateWorkspaces(
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;

  addProjectTemplates(
    projectId: mongooseTypes.ObjectId,
    projecttemplates: (databaseTypes.IProjectTemplate | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  removeProjectTemplates(
    projectId: mongooseTypes.ObjectId,
    projecttemplates: (databaseTypes.IProjectTemplate | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  validateProjectTemplates(
    projecttemplates: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
}
