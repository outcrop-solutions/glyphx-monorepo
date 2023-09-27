import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IProjectTemplateMethods} from './iProjectTemplateMethods';
import {IProjectTemplateCreateInput} from './iProjectTemplateCreateInput';
export interface IProjectTemplateStaticMethods
  extends Model<databaseTypes.IProjectTemplate, {}, IProjectTemplateMethods> {
  projectTemplateIdExists(projectTemplateId: mongooseTypes.ObjectId): Promise<boolean>;
  allProjectTemplateIdsExist(projectTemplateIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProjectTemplate(input: IProjectTemplateCreateInput): Promise<databaseTypes.IProjectTemplate>;
  getProjectTemplateById(projectTemplateId: string): Promise<databaseTypes.IProjectTemplate>;
  queryProjectTemplates(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IProjectTemplate>>;
  updateProjectTemplateWithFilter(
    filter: Record<string, unknown>,
    projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<void>;
  updateProjectTemplateById(
    projectTemplateId: string,
    projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<databaseTypes.IProjectTemplate>;
  deleteProjectTemplateById(projectTemplateId: string): Promise<void>;
  validateProjects(projects: (databaseTypes.IProject | string)[]): Promise<string[]>;
  validateTags(tags: (databaseTypes.ITag | string)[]): Promise<string[]>;
  validateUpdateObject(projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>): void;
  addProjects(
    projectTemplateId: string,
    projects: (databaseTypes.IProject | string)[]
  ): Promise<databaseTypes.IProjectTemplate>;
  removeProjects(
    projectTemplateId: string,
    projects: (databaseTypes.IProject | string)[]
  ): Promise<databaseTypes.IProjectTemplate>;
  addTags(projectTemplateId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IProjectTemplate>;
  removeTags(projectTemplateId: string, tags: (databaseTypes.ITag | string)[]): Promise<databaseTypes.IProjectTemplate>;
}
