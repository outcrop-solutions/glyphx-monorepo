import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IProjectTemplateMethods} from './iProjectTemplateMethods';
import {IProjectTemplateCreateInput} from './iProjectTemplateCreateInput';
export interface IProjectTemplateStaticMethods
  extends Model<databaseTypes.IProjectTemplate, {}, IProjectTemplateMethods> {
  projectTemplateIdExists(
    projectTemplateId: mongooseTypes.ObjectId
  ): Promise<boolean>;
  allProjectTemplateIdsExists(
    projectTemplateIds: mongooseTypes.ObjectId[]
  ): Promise<boolean>;
  createProjectTemplate(
    input: IProjectTemplateCreateInput
  ): Promise<databaseTypes.IProjectTemplate>;
  getProjectTemplateById(
    projectTemplateId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProjectTemplate>;
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
    projectTemplateId: mongooseTypes.ObjectId,
    projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<databaseTypes.IProjectTemplate>;
  deleteProjectTemplateById(
    projectTemplateId: mongooseTypes.ObjectId
  ): Promise<void>;
  validateProjects(
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateUpdateObject(
    projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): void;
  addProjects(
    projectTemplateId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate>;
  removeProjects(
    projectTemplateId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate>;
  addTags(
    projectTemplateId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate>;
  removeTags(
    projectTemplateId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate>;
}
