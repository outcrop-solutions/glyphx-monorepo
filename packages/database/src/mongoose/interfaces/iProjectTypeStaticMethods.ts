import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IProjectTemplateMethods} from './iProjectTemplateMethods';
import {IProjectTemplateCreateInput} from './iProjectTemplateCreateInput';
export interface IProjectTemplateStaticMethods
  extends Model<databaseTypes.IProjectTemplate, {}, IProjectTemplateMethods> {
  projectTypeIdExists(projectTypeId: mongooseTypes.ObjectId): Promise<boolean>;
  createProjectTemplate(
    input: IProjectTemplateCreateInput
  ): Promise<databaseTypes.IProjectTemplate>;
  getProjectTemplateById(
    projectTypeId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProjectTemplate>;
  queryProjectTemplates(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IProjectTemplate>>;
  updateProjectTemplateWithFilter(
    filter: Record<string, unknown>,
    projectType: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<void>;
  updateProjectTemplateById(
    projectTypeId: mongooseTypes.ObjectId,
    projectType: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<databaseTypes.IProjectTemplate>;
  deleteProjectTemplateById(
    projectTypeId: mongooseTypes.ObjectId
  ): Promise<void>;
  validateProjects(
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateUpdateObject(
    projectType: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): void;
  addProjects(
    projectTypeId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate>;
  removeProjects(
    projectTypeId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate>;
}
