import mongoose, {Types as mongooseTypes} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {
  IProcessTrackingMethods,
  IProcessTrackingStaticMethods,
  IProcessTrackingDocument,
} from '../interfaces';
const SCHEMA = new mongoose.Schema<
  IProcessTrackingDocument,
  IProcessTrackingStaticMethods,
  IProcessTrackingMethods
>({
  processId: {type: mongoose.Schema.Types.ObjectId, required: true},
  processName: {type: String, required: true},
  processStatus: {
    type: String,
    required: true,
    enum: database.constants.PROCESS_STATUS,
  },
  processStartTime: {type: Date, required: true},
  processEndTime: {type: Date, required: true},
  processMessages: {type: [String], required: true},
  processError: {type: [Object], required: false},
  processResult: {type: [Object], required: false},
});
const PROCESS_TRACKING_MODEL = mongoose.model<
  IProcessTrackingDocument,
  IProcessTrackingStaticMethods
>('processtracking', SCHEMA);

SCHEMA.static(
  'processTrackingIdExists',
  async (processTrackingId: mongooseTypes.ObjectId): Promise<boolean> => {}
);
SCHEMA.static(
  'processIdExists',
  async (processId: mongooseTypes.ObjectId): Promise<boolean> => {}
);
SCHEMA.static(
  'allProcessTrackingIdsExist',
  async (processTrackingIds: mongooseTypes.ObjectId[]): Promise<boolean> => {}
);
SCHEMA.static(
  'createProcessTrackingDocument',
  async (
    input: Omit<databaseTypes.IProcessTracking, '_id'>
  ): Promise<databaseTypes.IProcessTracking> => {}
);
SCHEMA.static(
  'getProcessTrackingDocumentById',
  async (
    processTrackingId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProcessTracking> => {}
);
SCHEMA.static(
  'getProcessTrackingDocumentByProcessId',
  async (
    processId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProcessTracking> => {}
);
SCHEMA.static(
  'getProcessTrackingDocumentByFilter',
  async (
    filter: Record<string, unknown>
  ): Promise<databaseTypes.IProcessTracking> => {}
);
SCHEMA.static(
  'queryProcessTrackingDocuments',
  async (
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IProcessTracking>> => {}
);
SCHEMA.static(
  'updateProcessTrackingDocumentWithFilter',
  async (
    filter: Record<string, unknown>,
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<void> => {}
);
SCHEMA.static(
  'updateProcessTrackingDocumentById',
  async (
    processTrackingDocumentId: mongooseTypes.ObjectId,
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<databaseTypes.IProcessTracking> => {}
);
SCHEMA.static(
  'updateProcessTrackingDocumentByProcessId',
  async (
    processId: mongooseTypes.ObjectId,
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<databaseTypes.IProcessTracking> => {}
);
SCHEMA.static(
  'deleteProcessTrackingDocumentByFilter',
  async (filter: Record<string, unknown>): Promise<void> => {}
);
SCHEMA.static(
  'deleteProcessTrackingDocumentById',
  async (processTrackingDocumentId: mongooseTypes.ObjectId): Promise<void> => {}
);
SCHEMA.static(
  'deleteProcessTrackingDocumentProcessId',
  async (processId: mongooseTypes.ObjectId): Promise<void> => {}
);
SCHEMA.static(
  'validateUpdateObject',
  async (
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<void> => {}
);
export {PROCESS_TRACKING_MODEL as ProcessTrackingModel};
