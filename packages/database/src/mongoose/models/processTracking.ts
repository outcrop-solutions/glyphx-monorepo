import mongoose, {Types as mongooseTypes, Model} from 'mongoose';
// eslint-disable-next-line node/no-unpublished-import
import {IQueryResult, databaseTypes} from 'types';
import {
  IProcessTrackingMethods,
  IProcessTrackingStaticMethods,
  IProcessTrackingDocument,
} from '../interfaces';

import {error} from 'core';

const SCHEMA = new mongoose.Schema<
  IProcessTrackingDocument,
  IProcessTrackingStaticMethods,
  IProcessTrackingMethods
>({
  processId: {
    type: String,
    required: true,
    unique: true,
  },
  processName: {type: String, required: true},
  processStatus: {
    type: String,
    required: true,
    enum: databaseTypes.constants.PROCESS_STATUS,
  },
  processStartTime: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  processEndTime: {type: Date, required: false},
  processMessages: {type: [String], required: true},
  processError: {type: [Object], required: true},
  processResult: {type: Object, required: false},
  processHeartbeat: {type: Date, required: false},
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
  async (processId: string): Promise<boolean> => {
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
  async (processId: string): Promise<databaseTypes.IProcessTracking> => {
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
  ): Promise<boolean> => {
    await PROCESS_TRACKING_MODEL.validateUpdateObject(processTrackingDocument);
    try {
      const transformedProcessTrackingDocument: Partial<IProcessTrackingDocument> &
        Record<string, any> = {};
      for (const key in processTrackingDocument) {
        const value = (processTrackingDocument as Record<string, any>)[key];

        transformedProcessTrackingDocument[key] = value;
      }
      const updateResult = await PROCESS_TRACKING_MODEL.updateOne(
        filter,
        transformedProcessTrackingDocument
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No process tracking document with filter: ${filter} was found`,
          'filter',
          filter
        );
      }
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      )
        throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the process tracking document with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'updateProcessTrackingDocumentWithFilter',
          {filter: filter, processTrackingDocument: processTrackingDocument},
          err
        );
    }
    return true;
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
    await PROCESS_TRACKING_MODEL.updateProcessTrackingDocumentWithFilter(
      {_id: processTrackingDocumentId},
      processTrackingDocument
    );

    const retval = await PROCESS_TRACKING_MODEL.getProcessTrackingDocumentById(
      processTrackingDocumentId
    );
    return retval;
  }
);

SCHEMA.static(
  'updateProcessTrackingDocumentByProcessId',
  async (
    processId: string,
    processTrackingDocument: Omit<
      Partial<databaseTypes.IProcessTracking>,
      '_id'
    >
  ): Promise<databaseTypes.IProcessTracking> => {
    await PROCESS_TRACKING_MODEL.updateProcessTrackingDocumentWithFilter(
      {processId: processId},
      processTrackingDocument
    );

    const retval =
      await PROCESS_TRACKING_MODEL.getProcessTrackingDocumentByProcessId(
        processId
      );
    return retval;
  }
);
SCHEMA.static(
  'deleteProcessTrackingDocumentByFilter',
  async (filter: Record<string, unknown>): Promise<void> => {
    try {
      const results = await PROCESS_TRACKING_MODEL.deleteOne(filter);
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A process tracking document with a filter: ${filter} was not found in the database`,
          'filter',
          filter
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the process tracking document from the database. The process tracing document may still exist.  See the inner error for additional information',
          'mongoDb',
          'deleteProcessTrackingDocumentByFilter',
          filter,
          err
        );
    }
  }
);
SCHEMA.static(
  'deleteProcessTrackingDocumentById',
  async (processTrackingDocumentId: mongooseTypes.ObjectId): Promise<void> => {
    await PROCESS_TRACKING_MODEL.deleteProcessTrackingDocumentByFilter({
      _id: processTrackingDocumentId,
    });
  }
);
SCHEMA.static(
  'deleteProcessTrackingDocumentProcessId',
  async (processId: string): Promise<void> => {
    await PROCESS_TRACKING_MODEL.deleteProcessTrackingDocumentByFilter({
      processId: processId,
    });
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
    if (processTrackingDocument.processError?.length)
      throw new error.InvalidOperationError(
        'This method cannot be used to alter the process tracking error array.  Use the add error function to complete this operation',
        {error: processTrackingDocument.processError}
      );

    if (processTrackingDocument.processMessages?.length)
      throw new error.InvalidOperationError(
        'This method cannot be used to alter the process tracking messages array.  Use the add message function to complete this operation',
        {messages: processTrackingDocument.processMessages}
      );

    if (processTrackingDocument.processId) {
      throw new error.InvalidOperationError(
        'The processId is imutable and cannot changed',
        {processId: processTrackingDocument.processId}
      );
    }

    if (
      (processTrackingDocument as unknown as databaseTypes.IVerificationToken)
        ._id
    )
      throw new error.InvalidOperationError(
        "A processTracking document's _id is imutable and cannot be changed",
        {
          _id: (
            processTrackingDocument as unknown as databaseTypes.IProcessTracking
          )._id,
        }
      );
  }
);

SCHEMA.static(
  'addErrorsById',
  async (
    processTrackingId: mongooseTypes.ObjectId,
    errors: Record<string, unknown>[]
  ): Promise<databaseTypes.IProcessTracking> => {
    return await PROCESS_TRACKING_MODEL.addErrorsByFilter(
      {_id: processTrackingId},
      errors
    );
  }
);
SCHEMA.static(
  'addErrorsByProcessId',
  async (
    processId: string,
    errors: Record<string, unknown>[]
  ): Promise<databaseTypes.IProcessTracking> => {
    return await PROCESS_TRACKING_MODEL.addErrorsByFilter(
      {processId: processId},
      errors
    );
  }
);
SCHEMA.static(
  'addErrorsByFilter',
  async (
    filter: Record<string, unknown>,
    errors: Record<string, unknown>[]
  ): Promise<databaseTypes.IProcessTracking> => {
    try {
      if (!errors.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one error',
          'errors',
          errors
        );
      const processTrackingDocument = await PROCESS_TRACKING_MODEL.findOne(
        filter
      );
      if (!processTrackingDocument)
        throw new error.DataNotFoundError(
          `A process tracking document with filter : ${filter} cannot be found`,
          'filter',
          filter
        );
      processTrackingDocument.processError.unshift(...errors);
      await processTrackingDocument.save();

      return await PROCESS_TRACKING_MODEL.getProcessTrackingDocumentByFilter(
        filter
      );
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while adding the errors. See the innner error for additional information',
          'mongoDb',
          'processTracking.addErrorsByFilter',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'addMessagesById',
  async (
    processTrackingId: mongooseTypes.ObjectId,
    messages: string[]
  ): Promise<databaseTypes.IProcessTracking> => {
    return await PROCESS_TRACKING_MODEL.addMessagesByFilter(
      {_id: processTrackingId},
      messages
    );
  }
);
SCHEMA.static(
  'addMessagesByProcessId',
  async (
    processId: string,
    messages: string[]
  ): Promise<databaseTypes.IProcessTracking> => {
    return await PROCESS_TRACKING_MODEL.addMessagesByFilter(
      {processId: processId},
      messages
    );
  }
);
SCHEMA.static(
  'addMessagesByFilter',
  async (
    filter: Record<string, unknown>,
    messages: string[]
  ): Promise<databaseTypes.IProcessTracking> => {
    try {
      if (!messages.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one message',
          'messages',
          messages
        );
      const processTrackingDocument = await PROCESS_TRACKING_MODEL.findOne(
        filter
      );
      if (!processTrackingDocument)
        throw new error.DataNotFoundError(
          `A process tracking document with filter : ${filter} cannot be found`,
          'filter',
          filter
        );
      processTrackingDocument.processMessages.unshift(...messages);
      await processTrackingDocument.save();

      return await PROCESS_TRACKING_MODEL.getProcessTrackingDocumentByFilter(
        filter
      );
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurrred while adding the messages. See the innner error for additional information',
          'mongoDb',
          'processTracking.addMessagesByFilter',
          err
        );
      }
    }
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['processTracking'];

const PROCESS_TRACKING_MODEL = mongoose.model<
  IProcessTrackingDocument,
  IProcessTrackingStaticMethods
>('processTracking', SCHEMA);

export {PROCESS_TRACKING_MODEL as ProcessTrackingModel};
