// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types'
import {IProjectTemplateMethods} from './iProjectTemplateMethods';
import {IProjectTemplateCreateInput} from './iProjectTemplateCreateInput';

export interface IProjectTemplateStaticMethods
  extends Model<databaseTypes.IProjectTemplate, {}, IProjectTemplateMethods> {
  projectTemplateIdExists(projectTemplateId: mongooseTypes.ObjectId): Promise<boolean>;
  allProjectTemplateIdsExist(projectTemplateIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProjectTemplate(input: IProjectTemplateCreateInput): Promise<databaseTypes.IProjectTemplate>;
  getProjectTemplateById(projectTemplateId: mongooseTypes.ObjectId): Promise<databaseTypes.IProjectTemplate>;
  queryProjectTemplates(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IProjectTemplate>>;
  updateProjectTemplateWithFilter(filter: Record<string, unknown>, projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>): Promise<databaseTypes.IProjectTemplate>;
  updateProjectTemplateById(projectTemplateId: mongooseTypes.ObjectId, projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>): Promise<databaseTypes.IProjectTemplate>;
  deleteProjectTemplateById(projectTemplateId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>): Promise<void>;
}
