import {Types as mongooseTypes, Model} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {IProjectTypeMethods} from './iProjectTypeMethods';
export interface IProjectTypeStaticMethods
  extends Model<databaseTypes.IProjectType, {}, IProjectTypeMethods> {
  projectTypeIdExists(projectTypeId: mongooseTypes.ObjectId): Promise<boolean>;
  createProjectType(
    input: Omit<databaseTypes.IProjectType, '_id'>
  ): Promise<databaseTypes.IProjectType>;
  getProjectTypeById(
    projectTypeId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProjectType>;
  updateProjectTypeWithFilter(
    filter: Record<string, unknown>,
    projectType: Omit<Partial<databaseTypes.IProjectType>, '_id'>
  ): Promise<void>;
  updateProjectTypeById(
    projectTypeId: mongooseTypes.ObjectId,
    projectType: Omit<Partial<databaseTypes.IProjectType>, '_id'>
  ): Promise<databaseTypes.IProjectType>;
  deleteProjectTypeById(projectTypeId: mongooseTypes.ObjectId): Promise<void>;
  validateProjects(
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateUpdateObject(
    projectType: Omit<Partial<databaseTypes.IProjectType>, '_id'>
  ): void;
  addProjects(
    projectTypeId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectType>;
  removeProjects(
    projectTypeId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectType>;
}
