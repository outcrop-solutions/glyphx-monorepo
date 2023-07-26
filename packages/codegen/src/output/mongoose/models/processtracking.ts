import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IProcesstrackingDocument, IProcesstrackingStaticMethods, IProcesstrackingMethods} from '../interfaces';

const SCHEMA = new Schema<IProcesstrackingDocument, IProcesstrackingStaticMethods, IProcesstrackingMethods>({
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
  processId: { type:
  string, 
  required: false,
  
  },
  processName: { type:
  string, 
  required: false,
  
  },
  processStatus: { type:
  PROCESS_STATUS, 
  required: false,
  
  },
  processStartTime: { type:
  Date, 
  required: false,
  
  },
  processEndTime: { type:
  Date, 
  required: false,
  
  },
  processMessages: { type:
  string[], 
  required: false,
  
  },
  processError: { type:
  Record&lt;string, unknown&gt;[], 
  required: false,
  
  },
  processResult: { type:
  Record&lt;string, unknown&gt;, 
  required: false,
  
  },
  processHeartbeat: { type:
  Date, 
  required: false,
  
  },
})

SCHEMA.static(addConstants.process_status: async (
    id: mongooseTypes.ObjectId,
    constants.PROCESS_STATUSES: (databaseTypes.IConstants.process_status | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIprocesstracking> => {
    try {
      if (!constants.PROCESS_STATUSES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'constants.PROCESS_STATUSES',
          constants.PROCESS_STATUSES
        );
      const document = await IprocesstrackingModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProcessTracking._id',
          id
        );

      const reconciledIds = await IprocesstrackingModel.validateConstants.process_status(constants.PROCESS_STATUSES);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.constants.PROCESS_STATUSES.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.constants.PROCESS_STATUSES.push(
            p as unknown as databaseTypes.IConstants.process_status
          );
        }
      });

      if (dirty) await document.save();

      return await IprocesstrackingModel.getById(id);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding. See the inner error for additional information',
          'mongoDb',
          'IProcessTracking.addConstants.process_status',
          err
        );
      }
    }
})

SCHEMA.static(
    removeConstants.process_status: async (
    id: mongooseTypes.ObjectId,
    constants.PROCESS_STATUSES: (databaseTypes.IConstants.process_status | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIprocesstracking> => {
    try {
      if (!constants.PROCESS_STATUSES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'constants.PROCESS_STATUSES',
          constants.PROCESS_STATUSES
        );
      const document = await IprocesstrackingModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProcessTracking._id',
          id
        );

      const reconciledIds = constants.PROCESS_STATUSES.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedConstants.process_status = document.constants.PROCESS_STATUSES.filter(p => {
        let retval = true;
        if (
          reconciledIds.find(
            r =>
              r.toString() ===
              (p as unknown as mongooseTypes.ObjectId).toString()
          )
        ) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        document.constants.PROCESS_STATUSES =
          updatedConstants.process_status as unknown as databaseTypes.IConstants.process_status[];
        await document.save();
      }

      return await IprocesstrackingModel.getById(id);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'IProcessTracking.removeConstants.process_status',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateConstants.process_status, 
    async (
    constants.PROCESS_STATUSES: (databaseTypes.IConstants.process_status | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const constants.PROCESS_STATUSESIds: mongooseTypes.ObjectId[] = [];
    constants.PROCESS_STATUSES.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) constants.PROCESS_STATUSESIds.push(p);
      else constants.PROCESS_STATUSESIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await Constants.process_statusModel.allConstants.process_statusIdsExist(constants.PROCESS_STATUSESIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'constants.PROCESS_STATUSES',
          constants.PROCESS_STATUSES,
          err
        );
      else throw err;
    }

    return constants.PROCESS_STATUSESIds;
  })
SCHEMA.static(addRecord: async (
    id: mongooseTypes.ObjectId,
    Records: (databaseTypes.IRecord | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIprocesstracking> => {
    try {
      if (!Records.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Records',
          Records
        );
      const document = await IprocesstrackingModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProcessTracking._id',
          id
        );

      const reconciledIds = await IprocesstrackingModel.validateRecord(Records);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.Records.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.Records.push(
            p as unknown as databaseTypes.IRecord
          );
        }
      });

      if (dirty) await document.save();

      return await IprocesstrackingModel.getById(id);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding. See the inner error for additional information',
          'mongoDb',
          'IProcessTracking.addRecord',
          err
        );
      }
    }
})

SCHEMA.static(
    removeRecord: async (
    id: mongooseTypes.ObjectId,
    Records: (databaseTypes.IRecord | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIprocesstracking> => {
    try {
      if (!Records.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Records',
          Records
        );
      const document = await IprocesstrackingModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProcessTracking._id',
          id
        );

      const reconciledIds = Records.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedRecord = document.Records.filter(p => {
        let retval = true;
        if (
          reconciledIds.find(
            r =>
              r.toString() ===
              (p as unknown as mongooseTypes.ObjectId).toString()
          )
        ) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        document.Records =
          updatedRecord as unknown as databaseTypes.IRecord[];
        await document.save();
      }

      return await IprocesstrackingModel.getById(id);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'IProcessTracking.removeRecord',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateRecord, 
    async (
    Records: (databaseTypes.IRecord | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const RecordsIds: mongooseTypes.ObjectId[] = [];
    Records.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) RecordsIds.push(p);
      else RecordsIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await RecordModel.allRecordIdsExist(RecordsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'Records',
          Records,
          err
        );
      else throw err;
    }

    return RecordsIds;
  })


export default mongoose.model('ProcessTracking', SCHEMA);
