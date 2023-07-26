import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { IProjectTemplateMethods } from './iProjectTemplateMethods';
import { IProjectTemplateCreateInput } from './iProjectTemplateCreateInput';

export interface IProjectTemplateStaticMethods
  extends Model<databaseTypes.IProjectTemplate, {}, IProjectTemplateMethods> {
  projecttemplateIdExists(projecttemplateId: mongooseTypes.ObjectId): Promise<boolean>;
  allProjectTemplateIdsExist(projecttemplateIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProjectTemplate(input: IProjectTemplateCreateInput): Promise<databaseTypes.IProjectTemplate>;
  getProjectTemplateById(projecttemplateId: mongooseTypes.ObjectId): Promise<databaseTypes.IProjectTemplate>;
  queryProjectTemplates(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IProjectTemplate>>;
  updateProjectTemplateWithFilter(
    filter: Record<string, unknown>,
    projecttemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<databaseTypes.IProjectTemplate>;
  updateProjectTemplateById(
    projecttemplateId: mongooseTypes.ObjectId,
    projecttemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<databaseTypes.IProjectTemplate>;
  deleteProjectTemplateById(projecttemplateId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(projecttemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>): Promise<void>;
}
