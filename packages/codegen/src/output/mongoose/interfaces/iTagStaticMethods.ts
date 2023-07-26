import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { ITagMethods } from './iTagMethods';
import { ITagCreateInput } from './iTagCreateInput';

export interface ITagStaticMethods extends Model<databaseTypes.ITag, {}, ITagMethods> {
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
  validateUpdateObject(tag: Omit<Partial<databaseTypes.ITag>, '_id'>): Promise<void>;
}
