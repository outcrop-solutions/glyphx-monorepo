import mongoose, {Types as mongooseTypes} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {
  IProcessTrackingMethods,
  IProcessTrackingStaticMethods,
  IProcessTrackingDocument,
} from '../interfaces';

import {error} from '@glyphx/core';

const SCHEMA = new mongoose.Schema<
  IProcessTrackingDocument,
  IProcessTrackingStaticMethods,
  IProcessTrackingMethods
>({
  processId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  processName: {type: String, required: true},
  processStatus: {
    type: String,
    required: true,
    enum: databaseTypes.constants.PROCESS_STATUS,
  },
  processStartTime: {type: Date, required: true},
  processEndTime: {type: Date, required: false},
  processMessages: {type: [String], required: true},
  processError: {type: [Object], required: true},
  processResult: {type: [Object], required: false},
});

SCHEMA.static(
  'processTrackingIdExists',
  async (processTrackingId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await PROCESS_TRACKING_MODEL.findById(processTrackingId, [
        '_id',
      ]);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the process tracking document.  See the inner error for additional information',
        'mongoDb',
        'processTrackingIdExists',
        {_id: processTrackingId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'processIdExists',
  async (processId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await PROCESS_TRACKING_MODEL.findOne(
        {processId: processId},
        ['_id']
      );
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the process tracking document.  See the inner error for additional information',
        'mongoDb',
        'processIdExists',
        {_id: processId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allProcessTrackingIdsExist',
  async (processTrackingIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await PROCESS_TRACKING_MODEL.find(
        {_id: {$in: processTrackingIds}},
        ['_id']
      )) as {_id: mongooseTypes.ObjectId}[];

      processTrackingIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more processTrackingIds cannot be found in the database.',
          'processTracking._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the processTrackingIds.  See the inner error for additional information',
          'mongoDb',
          'allProcessTrackingIdsExists',
          {processTrackingIds: processTrackingIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'createProcessTrackingDocument',
  async (
    input: Omit<databaseTypes.IProcessTracking, '_id'>
  ): Promise<databaseTypes.IProcessTracking> => {
    const transformedDocument: IProcessTrackingDocument = {
      processId: input.processId,
      processName: input.processName,
      processStatus:
        input.processStatus ?? databaseTypes.constants.PROCESS_STATUS.PENDING,
      processStartTime: input.processStartTime ?? new Date(),
      processMessages: input.processMessages ?? [],
      processError: input.processError ?? [],
    };

    try {
      await PROCESS_TRACKING_MODEL.validate(transformedDocument);
    } catch (err) {
      throw new error.DataValidationError(
        'An error occurred while validating the processTracking document.  See the inner error for additional details.',
        'processTracking',
        transformedDocument,
        err
      );
    }

    try {
      const createdDocument = (
        await PROCESS_TRACKING_MODEL.create([transformedDocument], {
          validateBeforeSave: false,
        })
      )[0];
      return await PROCESS_TRACKING_MODEL.getProcessTrackingDocumentById(
        createdDocument._id
      );
    } catch (err) {
      throw new error.DatabaseOperationError(
        'An unexpected error occurred wile creating the process tracking document. See the inner error for additional information',
        'mongoDb',
        'createProcessTrackingDocument',
        input,
        err
      );
    }
  }
);

SCHEMA.static(
  'getProcessTrackingDocumentById',
  async (
    processTrackingId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProcessTracking> => {
    return await PROCESS_TRACKING_MODEL.getProcessTrackingDocumentByFilter({
      _id: processTrackingId,
    });
  }
);

SCHEMA.static(
  'getProcessTrackingDocumentByProcessId',
  async (
    processId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProcessTracking> => {
    return await PROCESS_TRACKING_MODEL.getProcessTrackingDocumentByFilter({
      processId: processId,
    });
  }
);

SCHEMA.static(
  'getProcessTrackingDocumentByFilter',
  async (
    filter: Record<string, unknown>
  ): Promise<databaseTypes.IProcessTracking> => {
    try {
      const processTrackingDocument = (await PROCESS_TRACKING_MODEL.findOne(
        filter
      ).lean()) as databaseTypes.IProcessTracking;
      if (!processTrackingDocument) {
        throw new error.DataNotFoundError(
          `Could not find a process traking document using the filter: ${filter}`,
          'filter',
          filter
        );
      }
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      delete (processTrackingDocument as any)['__v'];

      return processTrackingDocument;
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while getting the process tracking document.  See the inner error for additional information',
          'mongoDb',
          'getProcessTrackingDocumentByFilter',
          err
        );
    }
  }
);

SCHEMA.static(
  'queryProcessTrackingDocuments',
  async (
    filter: Record<string, unknown> = {},
    page = 0,
    itemsPerPage = 10
  ): Promise<IQueryResult<databaseTypes.IProcessTracking>> => {
    try {
      const count = await PROCESS_TRACKING_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find process tracking document(s) with the filter: ${filter}`,
          'queryProcessTrackingDocuments',
          filter
        );
      }

      const skip = itemsPerPage * page;
      if (skip > count) {
        throw new error.InvalidArgumentError(
          `The page number supplied: ${page} exceeds the number of pages contained in the reults defined by the filter: ${Math.floor(
            count / itemsPerPage
          )}`,
          'page',
          page
        );
      }

      const processTrackingDocuments = (await PROCESS_TRACKING_MODEL.find(
        filter,
        null,
        {
          skip: skip,
          limit: itemsPerPage,
        }
      ).lean()) as databaseTypes.IProcessTracking[];
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      processTrackingDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
      });

      const retval: IQueryResult<databaseTypes.IProcessTracking> = {
        results: processTrackingDocuments,
        numberOfItems: count,
        page: page,
        itemsPerPage: itemsPerPage,
      };

      return retval;
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while querying the process tracking documents.  See the inner error for additional information',
          'mongoDb',
          'queryProcessTrackingDocuments',
          err
        );
    }
  }
);
SCHEMA.static(
  'updateProcessTrackingDocumentWithFilter',
  async (
    filter: Record<string, unknown>,
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<void> => {
    throw 'not implemented';
  }
);
SCHEMA.static(
  'updateProcessTrackingDocumentById',
  async (
    processTrackingDocumentId: mongooseTypes.ObjectId,
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<databaseTypes.IProcessTracking> => {
    throw 'not implemented';
  }
);
SCHEMA.static(
  'updateProcessTrackingDocumentByProcessId',
  async (
    processId: mongooseTypes.ObjectId,
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<databaseTypes.IProcessTracking> => {
    throw 'not implemented';
  }
);
SCHEMA.static(
  'deleteProcessTrackingDocumentByFilter',
  async (filter: Record<string, unknown>): Promise<void> => {
    throw 'not implemented';
  }
);
SCHEMA.static(
  'deleteProcessTrackingDocumentById',
  async (processTrackingDocumentId: mongooseTypes.ObjectId): Promise<void> => {
    throw 'not implemented';
  }
);
SCHEMA.static(
  'deleteProcessTrackingDocumentProcessId',
  async (processId: mongooseTypes.ObjectId): Promise<void> => {
    throw 'not implemented';
  }
);
SCHEMA.static(
  'validateUpdateObject',
  async (
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<void> => {
    throw 'not implemented';
  }
);

const PROCESS_TRACKING_MODEL = mongoose.model<
  IProcessTrackingDocument,
  IProcessTrackingStaticMethods
>('processTracking', SCHEMA);

export {PROCESS_TRACKING_MODEL as ProcessTrackingModel};