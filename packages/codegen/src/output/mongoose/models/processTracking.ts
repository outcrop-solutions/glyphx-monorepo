import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IProcessTrackingDocument, IProcessTrackingCreateInput, IProcessTrackingStaticMethods, IProcessTrackingMethods} from '../interfaces';
import { processStatusSchema } from '../schemas'
import { ProcessMessageModel} from './processMessage'
import { processErrorSchema } from '../schemas'
import { processResultSchema } from '../schemas'

const SCHEMA = new Schema<IProcessTrackingDocument, IProcessTrackingStaticMethods, IProcessTrackingMethods>({
  createdAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  updatedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  deletedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  processId: {
    type: String,
    required: true,
      default: false
      },
  processName: {
    type: String,
    required: true,
      default: false
      },
  processStatus: {
    type: processStatusSchema,
    required: false,
    default: {}
  },
  processStartTime: {
    type: Date,
    required: false,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  processEndTime: {
    type: Date,
    required: false,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  processMessages: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'processmessages'
  },
  processError: {
    type: processErrorSchema,
    required: false,
    default: {}
  },
  processResult: {
    type: processResultSchema,
    required: false,
    default: {}
  },
  processHeartbeat: {
    type: Date,
    required: false,
    default:
      //istanbul ignore next
      () => new Date(),
  }
})

SCHEMA.static(
  'processTrackingIdExists',
  async (processTrackingId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await PROCESSTRACKING_MODEL.findById(processTrackingId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the processTracking.  See the inner error for additional information',
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
  'allProcessTrackingIdsExist',
  async (processTrackingIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await PROCESSTRACKING_MODEL.find({_id: {$in: processTrackingIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

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
          { processTrackingIds: processTrackingIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (
    processTracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a processTracking with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];


    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (processTracking.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: processTracking.createdAt}
      );
    if (processTracking.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: processTracking.updatedAt}
      );
    if ((processTracking as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The processTracking._id is immutable and cannot be changed',
        {_id: (processTracking as Record<string, unknown>)['_id']}
      );
  }
);

SCHEMA.static(
  'createProcessTracking',
  async (input: IProcessTrackingCreateInput): Promise<databaseTypes.IProcessTracking> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [ 
          processMessages,
        ] = await Promise.all([
        PROCESSTRACKING_MODEL.validateProcessMessages(input.workspace ?? []),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IProcessTrackingDocument = {
        createdAt: createDate,
        updatedAt: createDate
          ,processId: input.processId
          ,processName: input.processName
          ,processStatus: input.processStatus
          ,processStartTime: input.processStartTime
          ,processEndTime: input.processEndTime
          ,processMessages: input.processMessages
          ,processError: input.processError
          ,processResult: input.processResult
          ,processHeartbeat: input.processHeartbeat
      };
      try {
        await PROCESSTRACKING_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IProcessTrackingDocument',
          resolvedInput,
          err
        );
      }
      const processtrackingDocument = (
        await PROCESSTRACKING_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = processtrackingDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the processtracking.  See the inner error for additional details',
          'mongoDb',
          'addProcessTracking',
          {},
          err
        );
      }
    }
    if (id) return await PROCESSTRACKING_MODEL.getProcessTrackingById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the processtracking may not have been created.  I have no other information to provide.'
      );
  }
);

SCHEMA.static('getProcessTrackingById', async (processtrackingId: mongooseTypes.ObjectId) => {
  try {
    const processtrackingDocument = (await PROCESSTRACKING_MODEL.findById(processtrackingId)
      .populate('processStatus')
      .populate('processMessages')
      .populate('processError')
      .populate('processResult')
      .lean()) as databaseTypes.IProcessTracking;
    if (!processtrackingDocument) {
      throw new error.DataNotFoundError(
        `Could not find a processtracking with the _id: ${ processtrackingId}`,
        'processtracking_id',
        processtrackingId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (processtrackingDocument as any)['__v'];

    processtrackingDocument.processMessages?.forEach((m: any) => delete (m as any)['__v']);
    
    return processtrackingDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getProcessTrackingById',
        err
      );
  }
});

SCHEMA.static(
  'updateProcessTrackingWithFilter',
  async (
    filter: Record<string, unknown>,
    processtracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<void> => {
    try {
      await PROCESSTRACKING_MODEL.validateUpdateObject(processtracking);
      const updateDate = new Date();
      const transformedObject: Partial<IProcessTrackingDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in processtracking) {
        const value = (processtracking as Record<string, any>)[key];
        else transformedObject[key] = value;
      }
      const updateResult = await PROCESSTRACKING_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No processtracking document with filter: ${filter} was found',
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
          `An unexpected error occurred while updating the project with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update processtracking',
          {filter: filter, processtracking : processtracking },
          err
        );
    }
  }
);

SCHEMA.static(
  'queryProcessTrackings',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await PROCESSTRACKING_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find processtrackings with the filter: ${filter}`,
          'queryProcessTrackings',
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

      const processtrackingDocuments = (await PROCESSTRACKING_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('processStatus')
        .populate('processMessages')
        .populate('processError')
        .populate('processResult')
        .lean()) as databaseTypes.IProcessTracking[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      processtrackingDocuments.forEach((doc: any) => {
      delete (doc as any)['__v'];
      (doc as any).processMessages?.forEach((m: any) => delete (m as any)['__v']);
            });

      const retval: IQueryResult<databaseTypes.IProcessTracking> = {
        results: processtrackingDocuments,
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
          'An unexpected error occurred while getting the processtrackings.  See the inner error for additional information',
          'mongoDb',
          'queryProcessTrackings',
          err
        );
    }
  }
);

SCHEMA.static(
  'deleteProcessTrackingById',
  async (processtrackingId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await PROCESSTRACKING_MODEL.deleteOne({_id: processtrackingId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A processtracking with a _id: ${ processtrackingId} was not found in the database`,
          '_id',
          processtrackingId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the processtracking from the database. The processtracking may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete processtracking',
          {_id: processtrackingId},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateProcessTrackingById',
  async (
    processtrackingId: mongooseTypes.ObjectId,
    processtracking: Omit<Partial<databaseTypes.IProcessTracking>, '_id'>
  ): Promise<databaseTypes.IProcessTracking> => {
    await PROCESSTRACKING_MODEL.updateProcessTrackingWithFilter({_id: processtrackingId}, processtracking);
    return await PROCESSTRACKING_MODEL.getProcessTrackingById(processtrackingId);
  }
);




// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['processtracking'];

const PROCESSTRACKING_MODEL = model<IProcessTrackingDocument, IProcessTrackingStaticMethods>(
  'processtracking',
  SCHEMA
);

export { PROCESSTRACKING_MODEL as ProcessTrackingModel };
;
