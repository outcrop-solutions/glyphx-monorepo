// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IDocumentMethods} from './iDocumentMethods';
import {IDocumentCreateInput} from './iDocumentCreateInput';

export interface IDocumentStaticMethods extends Model<databaseTypes.IDocument, {}, IDocumentMethods> {
  documentIdExists(documentId: mongooseTypes.ObjectId): Promise<boolean>;
  allDocumentIdsExist(documentIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createDocument(input: IDocumentCreateInput): Promise<databaseTypes.IDocument>;
  getDocumentById(documentId: string): Promise<databaseTypes.IDocument>;
  queryDocuments(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IDocument>>;
  updateDocumentWithFilter(
    filter: Record<string, unknown>,
    document: Omit<Partial<databaseTypes.IDocument>, '_id'>
  ): Promise<databaseTypes.IDocument>;
  updateDocumentById(
    documentId: string,
    document: Omit<Partial<databaseTypes.IDocument>, '_id'>
  ): Promise<databaseTypes.IDocument>;
  deleteDocumentById(documentId: string): Promise<void>;
  validateUpdateObject(document: Omit<Partial<databaseTypes.IDocument>, '_id'>): Promise<void>;
  addPresences(documentId: string, presences: (databaseTypes.IPresence | string)[]): Promise<databaseTypes.IDocument>;
  removePresences(
    documentId: string,
    presences: (databaseTypes.IPresence | string)[]
  ): Promise<databaseTypes.IDocument>;
  validatePresences(presences: (databaseTypes.IPresence | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addAnnotations(
    documentId: string,
    annotations: (databaseTypes.IAnnotation | string)[]
  ): Promise<databaseTypes.IDocument>;
  removeAnnotations(
    documentId: string,
    annotations: (databaseTypes.IAnnotation | string)[]
  ): Promise<databaseTypes.IDocument>;
  validateAnnotations(annotations: (databaseTypes.IAnnotation | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addThresholds(
    documentId: string,
    thresholds: (databaseTypes.IThreshold | string)[]
  ): Promise<databaseTypes.IDocument>;
  removeThresholds(
    documentId: string,
    thresholds: (databaseTypes.IThreshold | string)[]
  ): Promise<databaseTypes.IDocument>;
  validateThresholds(thresholds: (databaseTypes.IThreshold | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addConfigs(documentId: string, configs: (databaseTypes.IModelConfig | string)[]): Promise<databaseTypes.IDocument>;
  removeConfigs(
    documentId: string,
    modelConfigs: (databaseTypes.IModelConfig | string)[]
  ): Promise<databaseTypes.IDocument>;
  validateConfigs(modelConfigs: (databaseTypes.IModelConfig | string)[]): Promise<mongooseTypes.ObjectId[]>;
}
