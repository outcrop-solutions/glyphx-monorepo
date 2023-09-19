// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types'
import {IProjectMethods} from './iProjectMethods';
import {IProjectCreateInput} from './iProjectCreateInput';

export interface IProjectStaticMethods
  extends Model<databaseTypes.IProject, {}, IProjectMethods> {
  projectIdExists(projectId: mongooseTypes.ObjectId): Promise<boolean>;
  allProjectIdsExist(projectIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProject(input: IProjectCreateInput): Promise<databaseTypes.IProject>;
  getProjectById(projectId: mongooseTypes.ObjectId): Promise<databaseTypes.IProject>;
  queryProjects(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IProject>>;
  updateProjectWithFilter(filter: Record<string, unknown>, project: Omit<Partial<databaseTypes.IProject>, '_id'>): Promise<databaseTypes.IProject>;
  updateProjectById(projectId: mongooseTypes.ObjectId, project: Omit<Partial<databaseTypes.IProject>, '_id'>): Promise<databaseTypes.IProject>;
  deleteProjectById(projectId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(project: Omit<Partial<databaseTypes.IProject>, '_id'>): Promise<void>;
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
    }
