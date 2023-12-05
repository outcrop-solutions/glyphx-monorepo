// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {ITagMethods} from './iTagMethods';
import {ITagCreateInput} from './iTagCreateInput';

export interface ITagStaticMethods extends Model<databaseTypes.ITag, {}, ITagMethods> {
  tagIdExists(tagId: mongooseTypes.ObjectId): Promise<boolean>;
  allTagIdsExist(tagIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createTag(input: ITagCreateInput): Promise<databaseTypes.ITag>;
  getTagById(tagId: string): Promise<databaseTypes.ITag>;
  queryTags(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.ITag>>;
  updateTagWithFilter(
    filter: Record<string, unknown>,
    tag: Omit<Partial<databaseTypes.ITag>, '_id'>
  ): Promise<databaseTypes.ITag>;
  updateTagById(tagId: string, tag: Omit<Partial<databaseTypes.ITag>, '_id'>): Promise<databaseTypes.ITag>;
  deleteTagById(tagId: string): Promise<void>;
  validateUpdateObject(tag: Omit<Partial<databaseTypes.ITag>, '_id'>): Promise<void>;
  addWorkspaces(tagId: string, workspaces: (databaseTypes.IWorkspace | string)[]): Promise<databaseTypes.ITag>;
  removeWorkspaces(tagId: string, workspaces: (databaseTypes.IWorkspace | string)[]): Promise<databaseTypes.ITag>;
  validateWorkspaces(workspaces: (databaseTypes.IWorkspace | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addTemplates(tagId: string, templates: (databaseTypes.IProjectTemplate | string)[]): Promise<databaseTypes.ITag>;
  removeTemplates(
    tagId: string,
    projectTemplates: (databaseTypes.IProjectTemplate | string)[]
  ): Promise<databaseTypes.ITag>;
  validateTemplates(projectTemplates: (databaseTypes.IProjectTemplate | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addProjects(tagId: string, projects: (databaseTypes.IProject | string)[]): Promise<databaseTypes.ITag>;
  removeProjects(tagId: string, projects: (databaseTypes.IProject | string)[]): Promise<databaseTypes.ITag>;
  validateProjects(projects: (databaseTypes.IProject | string)[]): Promise<mongooseTypes.ObjectId[]>;
}
