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
  ): Promise<void>;
  updateProjectById(
    projectId: string,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<databaseTypes.IProject>;
  addMembers(projectId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IProject>;
  removeMembers(projectId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IProject>;
  addStates(projectId: string, states: (databaseTypes.IState | string)[]): Promise<databaseTypes.IProject>;
  removeStates(projectId: string, states: (databaseTypes.IState | string)[]): Promise<databaseTypes.IProject>;
  addTags(projectId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IProject>;
  removeTags(projectId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IProject>;
  deleteProjectById(projectId: string): Promise<void>;
  validateUpdateObject(project: Omit<Partial<databaseTypes.IProject>, '_id'>): Promise<void>;
  validateTemplate(input: databaseTypes.IProjectTemplate | string): Promise<string>;
  validateWorkspace(input: databaseTypes.IWorkspace | string): Promise<string>;
  validateMembers(input: (databaseTypes.IMember | string)[]): Promise<string[]>;
  validateStates(input: (databaseTypes.IState | string)[]): Promise<string[]>;
  validateTags(input: (databaseTypes.ITag | string)[]): Promise<string[]>;
}
