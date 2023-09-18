// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import {ITagMethods} from './iTagMethods';
import {ITagCreateInput} from './iTagCreateInput';

export interface ITagStaticMethods
  extends Model<databaseTypes.ITag, {}, ITagMethods> {
  tagIdExists(tagId: mongooseTypes.ObjectId): Promise<boolean>;
  allTagIdsExist(tagIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createTag(input: ITagCreateInput): Promise<databaseTypes.ITag>;
  getTagById(tagId: mongooseTypes.ObjectId): Promise<databaseTypes.ITag>;
  queryTags(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.ITag>>;
  updateTagWithFilter(
    filter: Record<string, unknown>,
    tag: Omit<Partial<databaseTypes.ITag>, '_id'>
  ): Promise<databaseTypes.ITag>;
  updateTagById(
    tagId: mongooseTypes.ObjectId,
    tag: Omit<Partial<databaseTypes.ITag>, '_id'>
  ): Promise<databaseTypes.ITag>;
  deleteTagById(tagId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    tag: Omit<Partial<databaseTypes.ITag>, '_id'>
  ): Promise<void>;
  addWorkspaces(
    tagId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag>;
  removeWorkspaces(
    tagId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag>;
  validateWorkspaces(
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  addTemplates(
    tagId: mongooseTypes.ObjectId,
    projectTemplates: (
      | databaseTypes.IProjectTemplate
      | mongooseTypes.ObjectId
    )[]
  ): Promise<databaseTypes.ITag>;
  removeTemplates(
    tagId: mongooseTypes.ObjectId,
    projectTemplates: (
      | databaseTypes.IProjectTemplate
      | mongooseTypes.ObjectId
    )[]
  ): Promise<databaseTypes.ITag>;
  validateTemplates(
    projectTemplates: (
      | databaseTypes.IProjectTemplate
      | mongooseTypes.ObjectId
    )[]
  ): Promise<mongooseTypes.ObjectId[]>;
  addProjects(
    tagId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag>;
  removeProjects(
    tagId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag>;
  validateProjects(
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
}
