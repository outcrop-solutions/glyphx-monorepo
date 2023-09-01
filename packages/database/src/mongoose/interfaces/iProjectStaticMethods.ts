import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IProjectMethods} from './iProjectMethods';
import {IProjectCreateInput} from './iProjectCreateInput';
export interface IProjectStaticMethods
  extends Model<databaseTypes.IProject, {}, IProjectMethods> {
  projectIdExists(projectId: mongooseTypes.ObjectId): Promise<boolean>;
  allProjectIdsExist(projectIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProject(input: IProjectCreateInput): Promise<databaseTypes.IProject>;
  getProjectById(
    projectId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProject>;
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
    projectId: mongooseTypes.ObjectId,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<databaseTypes.IProject>;
  addMembers(
    projectId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  removeMembers(
    projectId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  addStates(
    projectId: mongooseTypes.ObjectId,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  removeStates(
    projectId: mongooseTypes.ObjectId,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  addTags(
    projectId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  removeTags(
    projectId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  deleteProjectById(projectId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<void>;
  validateTemplate(
    input: databaseTypes.IProjectTemplate | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  validateWorkspace(
    input: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  validateMembers(
    input: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateStates(
    input: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateTags(
    input: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
}
