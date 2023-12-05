// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IAnnotationMethods} from './iAnnotationMethods';
import {IAnnotationCreateInput} from './iAnnotationCreateInput';

export interface IAnnotationStaticMethods extends Model<databaseTypes.IAnnotation, {}, IAnnotationMethods> {
  annotationIdExists(annotationId: mongooseTypes.ObjectId): Promise<boolean>;
  allAnnotationIdsExist(annotationIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createAnnotation(input: IAnnotationCreateInput): Promise<databaseTypes.IAnnotation>;
  getAnnotationById(annotationId: string): Promise<databaseTypes.IAnnotation>;
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
    annotationId: string,
    annotation: Omit<Partial<databaseTypes.IAnnotation>, '_id'>
  ): Promise<databaseTypes.IAnnotation>;
  deleteAnnotationById(annotationId: string): Promise<void>;
  validateUpdateObject(annotation: Omit<Partial<databaseTypes.IAnnotation>, '_id'>): Promise<void>;
  addAuthor(annotationId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IAnnotation>;
  removeAuthor(annotationId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IAnnotation>;
  validateAuthor(user: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId>;
  addState(annotationId: string, state: databaseTypes.IState | string): Promise<databaseTypes.IAnnotation>;
  removeState(annotationId: string, state: databaseTypes.IState | string): Promise<databaseTypes.IAnnotation>;
  validateState(state: databaseTypes.IState | string): Promise<mongooseTypes.ObjectId>;
}
