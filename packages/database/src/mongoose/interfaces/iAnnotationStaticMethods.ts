import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IAnnotationMethods} from './iAnnotationMethods';
import {IAnnotationCreateInput} from './iAnnotationCreateInput';

export interface IAnnotationStaticMethods extends Model<databaseTypes.IAnnotation, {}, IAnnotationMethods> {
  annotationIdExists(AnnotationId: mongooseTypes.ObjectId): Promise<boolean>;
  allAnnotationIdsExist(AnnotationIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createAnnotation(input: IAnnotationCreateInput): Promise<databaseTypes.IAnnotation>;
  getAnnotationById(AnnotationId: mongooseTypes.ObjectId): Promise<databaseTypes.IAnnotation>;
  queryAnnotations(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IAnnotation>>;
}
