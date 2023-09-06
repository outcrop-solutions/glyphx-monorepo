import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IProcessTrackingMethods} from './iProcessTrackingMethods';
export interface IProcessTrackingStaticMethods
  extends Model<databaseTypes.IProcessTracking, {}, IProcessTrackingMethods> {
  processTrackingIdExists(processTrackingId: mongooseTypes.ObjectId): Promise<boolean>;
  processIdExists(processId: string): Promise<boolean>;
  allProcessTrackingIdsExist(processTrackingIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createProcessTrackingDocument(
    input: Omit<databaseTypes.IProcessTracking, '_id'>
  ): Promise<databaseTypes.IProcessTracking>;
  getProcessTrackingDocumentById(processTrackingId: mongooseTypes.ObjectId): Promise<databaseTypes.IProcessTracking>;
  getProcessTrackingDocumentByProcessId(processId: string): Promise<databaseTypes.IProcessTracking>;
  getProcessTrackingDocumentByFilter(filter: Record<string, unknown>): Promise<databaseTypes.IProcessTracking>;
  queryProcessTrackingDocuments(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IProcessTracking>>;
  updateProcessTrackingDocumentWithFilter(
    filter: Record<string, unknown>,
    processTrackingDocument: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<boolean>;
  updateProcessTrackingDocumentById(
    processTrackingDocumentId: mongooseTypes.ObjectId,
    processTrackingDocument: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<databaseTypes.IProcessTracking>;
  updateProcessTrackingDocumentByProcessId(
    processId: string,
    processTrackingDocument: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<databaseTypes.IProcessTracking>;
  deleteProcessTrackingDocumentByFilter(filter: Record<string, unknown>): Promise<void>;
  deleteProcessTrackingDocumentById(processTrackingDocumentId: mongooseTypes.ObjectId): Promise<void>;
  deleteProcessTrackingDocumentProcessId(processId: string): Promise<void>;
  validateUpdateObject(processTrackingDocument: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>): Promise<void>;
  addErrorsByFilter(
    filter: Record<string, unknown>,
    errors: Record<string, unknown>[]
  ): Promise<databaseTypes.IProcessTracking>;
  addErrorsByProcessId(processId: string, errors: Record<string, unknown>[]): Promise<databaseTypes.IProcessTracking>;
  addErrorsById(
    processTrackingId: mongooseTypes.ObjectId,
    errors: Record<string, unknown>[]
  ): Promise<databaseTypes.IProcessTracking>;
  addMessagesByFilter(filter: Record<string, unknown>, messages: string[]): Promise<databaseTypes.IProcessTracking>;
  addMessagesByProcessId(processId: string, messages: string[]): Promise<databaseTypes.IProcessTracking>;
  addMessagesById(
    processTrackingId: mongooseTypes.ObjectId,
    messages: string[]
  ): Promise<databaseTypes.IProcessTracking>;
}
