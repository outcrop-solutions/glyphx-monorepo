import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IProcessTrackingMethods} from './iProcessTrackingMethods';
export interface IProcessTrackingStaticMethods
  extends Model<databaseTypes.IProcessTracking, {}, IProcessTrackingMethods> {
  processTrackingIdExists(
    processTrackingId: mongooseTypes.ObjectId
  ): Promise<boolean>;
  processIdExists(processId: mongooseTypes.ObjectId): Promise<boolean>;
  allProcessTrackingIdsExist(
    processTrackingIds: mongooseTypes.ObjectId[]
  ): Promise<boolean>;
  createProcessTrackingDocument(
    input: Omit<databaseTypes.IProcessTracking, '_id'>
  ): Promise<databaseTypes.IProcessTracking>;
  getProcessTrackingDocumentById(
    processTrackingId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProcessTracking>;
  getProcessTrackingDocumentByProcessId(
    processId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProcessTracking>;
  getProcessTrackingDocumentByFilter(
    filter: Record<string, unknown>
  ): Promise<databaseTypes.IProcessTracking>;
  queryProcessTrackingDocuments(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IProcessTracking>>;
  updateProcessTrackingDocumentWithFilter(
    filter: Record<string, unknown>,
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<boolean>;
  updateProcessTrackingDocumentById(
    processTrackingDocumentId: mongooseTypes.ObjectId,
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<databaseTypes.IProcessTracking>;
  updateProcessTrackingDocumentByProcessId(
    processId: mongooseTypes.ObjectId,
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<databaseTypes.IProcessTracking>;
  deleteProcessTrackingDocumentByFilter(
    filter: Record<string, unknown>
  ): Promise<void>;
  deleteProcessTrackingDocumentById(
    processTrackingDocumentId: mongooseTypes.ObjectId
  ): Promise<void>;
  deleteProcessTrackingDocumentProcessId(
    processId: mongooseTypes.ObjectId
  ): Promise<void>;
  validateUpdateObject(
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<void>;
}
