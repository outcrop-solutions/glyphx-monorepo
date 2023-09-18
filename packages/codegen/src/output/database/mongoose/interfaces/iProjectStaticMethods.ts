// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
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
  ): Promise<databaseTypes.IProject>;
  updateProjectById(
    projectId: mongooseTypes.ObjectId,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<databaseTypes.IProject>;
  deleteProjectById(projectId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<void>;
  addWorkspace(
    projectId: mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProject>;
  removeWorkspace(
    projectId: mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProject>;
  validateWorkspace(
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  addTemplate(
    projectId: mongooseTypes.ObjectId,
    projectTemplate: databaseTypes.IProjectTemplate | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProject>;
  removeTemplate(
    projectId: mongooseTypes.ObjectId,
    projectTemplate: databaseTypes.IProjectTemplate | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProject>;
  validateTemplate(
    projectTemplate: databaseTypes.IProjectTemplate | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  addMembers(
    projectId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  removeMembers(
    projectId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  validateMembers(
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  addTags(
    projectId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  removeTags(
    projectId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  validateTags(
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  addStates(
    projectId: mongooseTypes.ObjectId,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  removeStates(
    projectId: mongooseTypes.ObjectId,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject>;
  validateStates(
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
}
