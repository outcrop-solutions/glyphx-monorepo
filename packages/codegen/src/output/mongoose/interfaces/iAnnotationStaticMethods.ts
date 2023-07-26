import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { IAnnotationMethods } from './iAnnotationMethods';
import { IAnnotationCreateInput } from './iAnnotationCreateInput';

export interface IAnnotationStaticMethods extends Model<databaseTypes.IAnnotation, {}, IAnnotationMethods> {
  annotationIdExists(annotationId: mongooseTypes.ObjectId): Promise<boolean>;
  allAnnotationIdsExist(annotationIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createAnnotation(input: IAnnotationCreateInput): Promise<databaseTypes.IAnnotation>;
  getAnnotationById(annotationId: mongooseTypes.ObjectId): Promise<databaseTypes.IAnnotation>;
  queryAnnotations(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IAnnotation>>;
  updateAnnotationWithFilter(
    filter: Record<string, unknown>,
    annotation: Omit<Partial<databaseTypes.IAnnotation>, '_id'>
  ): Promise<databaseTypes.IAnnotation>;
  updateAnnotationById(
    annotationId: mongooseTypes.ObjectId,
    annotation: Omit<Partial<databaseTypes.IAnnotation>, '_id'>
  ): Promise<databaseTypes.IAnnotation>;
  deleteAnnotationById(annotationId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(annotation: Omit<Partial<databaseTypes.IAnnotation>, '_id'>): Promise<void>;
  addUsers(
    annotationId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IAnnotation>;
  removeUsers(
    annotationId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IAnnotation>;
  validateUsers(users: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;
}
