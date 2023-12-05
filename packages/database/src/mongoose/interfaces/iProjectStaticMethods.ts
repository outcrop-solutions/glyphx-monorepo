// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IProjectMethods} from './iProjectMethods';
import {IProjectCreateInput} from './iProjectCreateInput';

export interface IProjectStaticMethods extends Model<databaseTypes.IProject, {}, IProjectMethods> {
  projectIdExists(projectId: mongooseTypes.ObjectId): Promise<boolean>;
  allProjectIdsExist(projectIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProject(input: IProjectCreateInput): Promise<databaseTypes.IProject>;
  getProjectById(projectId: string): Promise<databaseTypes.IProject>;
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
    projectId: string,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<databaseTypes.IProject>;
  deleteProjectById(projectId: string): Promise<void>;
  validateUpdateObject(project: Omit<Partial<databaseTypes.IProject>, '_id'>): Promise<void>;
  addWorkspace(projectId: string, workspace: databaseTypes.IWorkspace | string): Promise<databaseTypes.IProject>;
  removeWorkspace(projectId: string, workspace: databaseTypes.IWorkspace | string): Promise<databaseTypes.IProject>;
  validateWorkspace(workspace: databaseTypes.IWorkspace | string): Promise<mongooseTypes.ObjectId>;
  addTemplate(
    projectId: string,
    projectTemplate: databaseTypes.IProjectTemplate | string
  ): Promise<databaseTypes.IProject>;
  removeTemplate(
    projectId: string,
    projectTemplate: databaseTypes.IProjectTemplate | string
  ): Promise<databaseTypes.IProject>;
  validateTemplate(projectTemplate: databaseTypes.IProjectTemplate | string): Promise<mongooseTypes.ObjectId>;
  addMembers(projectId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IProject>;
  removeMembers(projectId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IProject>;
  validateMembers(members: (databaseTypes.IMember | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addTags(projectId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IProject>;
  removeTags(projectId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IProject>;
  validateTags(tags: (databaseTypes.ITag | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addStates(projectId: string, states: (databaseTypes.IState | string)[]): Promise<databaseTypes.IProject>;
  removeStates(projectId: string, states: (databaseTypes.IState | string)[]): Promise<databaseTypes.IProject>;
  validateStates(states: (databaseTypes.IState | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addFilesystems(
    projectId: string,
    filesystems: (databaseTypes.IFileStats | string)[]
  ): Promise<databaseTypes.IProject>;
  removeFilesystems(
    projectId: string,
    fileStats: (databaseTypes.IFileStats | string)[]
  ): Promise<databaseTypes.IProject>;
  validateFilesystems(fileStats: (databaseTypes.IFileStats | string)[]): Promise<mongooseTypes.ObjectId[]>;
}
