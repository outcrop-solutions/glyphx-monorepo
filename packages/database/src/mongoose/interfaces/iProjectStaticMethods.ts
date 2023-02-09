import {Types as mongooseTypes, Model} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {IProjectMethods} from './iProjectMethods';
export interface IProjectStaticMethods
  extends Model<databaseTypes.IAccount, {}, IProjectMethods> {
  projectIdExists(projectId: mongooseTypes.ObjectId): Promise<boolean>;
  allProjectIdsExist(projectIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProject(
    input: Omit<databaseTypes.IProject, '_id'>
  ): Promise<databaseTypes.IProject>;
  getProjectById(
    projectId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProject>;
  updateProjectWithFilter(
    filter: Record<string, unknown>,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<void>;
  updateProjectById(
    projectId: mongooseTypes.ObjectId,
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<databaseTypes.IProject>;
  deleteProjectById(projectId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    project: Omit<Partial<databaseTypes.IProject>, '_id'>
  ): Promise<void>;

  validateType(
    input: databaseTypes.IProjectType | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  validateOrganization(
    input: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  validateOwner(
    input: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  validateState(
    input: databaseTypes.IState | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
}
