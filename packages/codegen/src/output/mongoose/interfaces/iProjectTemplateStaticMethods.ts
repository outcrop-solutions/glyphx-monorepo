import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IProjectTemplateMethods} from './iProjectTemplateMethods';
import {IProjectTemplateCreateInput} from './iProjectTemplateCreateInput';

export interface IProjectTemplateStaticMethods
  extends Model<databaseTypes.IProjectTemplate, {}, IProjectTemplateMethods> {
  project_templateIdExists(project_templateId: mongooseTypes.ObjectId): Promise<boolean>;
  allProjectTemplateIdsExist(project_templateIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProjectTemplate(input: IProjectTemplateCreateInput): Promise<databaseTypes.IProjectTemplate>;
  getProjectTemplateById(project_templateId: mongooseTypes.ObjectId): Promise<databaseTypes.IProjectTemplate>;
  queryProjectTemplates(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IProjectTemplate>>;
  updateProjectTemplateWithFilter(filter: Record<string, unknown>, project_template: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>): Promise<databaseTypes.IProjectTemplate>;
  updateProjectTemplateById(project_templateId: mongooseTypes.ObjectId, project_template: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>): Promise<databaseTypes.IProjectTemplate>;
  deleteProjectTemplateById(project_templateId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(project_template: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>): Promise<void>;
      addProjects(
        projecttemplateId: mongooseTypes.ObjectId, 
        projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
      ): Promise<databaseTypes.IProjectTemplate>;
      removeProjects(
        projecttemplateId: mongooseTypes.ObjectId, 
        projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
      ): Promise<databaseTypes.IProjectTemplate>;
      validateProjects(
        projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
      ): Promise<mongooseTypes.ObjectId[]>;
      addTags(
        projecttemplateId: mongooseTypes.ObjectId, 
        tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
      ): Promise<databaseTypes.IProjectTemplate>;
      removeTags(
        projecttemplateId: mongooseTypes.ObjectId, 
        tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
      ): Promise<databaseTypes.IProjectTemplate>;
      validateTags(
        tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
      ): Promise<mongooseTypes.ObjectId[]>;
}
