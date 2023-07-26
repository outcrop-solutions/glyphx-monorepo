import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IProjecttemplateDocument, IProjecttemplateStaticMethods, IProjecttemplateMethods} from '../interfaces';

const SCHEMA = new Schema<IProjecttemplateDocument, IProjecttemplateStaticMethods, IProjecttemplateMethods>({
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
  createdAt: { type:
  Date, 
  required: false,
  
  },
  updatedAt: { type:
  Date, 
  required: false,
  
  },
  deletedAt: { type:
  Date, 
  required: false,
  
  },
  name: { type:
  string, 
  required: false,
  
  },
  projects: { type:
  IProject[], 
  required: false,
  
  },
  tags: { type:
  ITag[], 
  required: false,
  
  },
  shape: { type:
  Record&lt;string, { key: string; type: FIELD_TYPE; required: boolean; description: string; }&gt;, 
  required: false,
  
  },
})

SCHEMA.static(addRecord: async (
    id: mongooseTypes.ObjectId,
    Records: (databaseTypes.IRecord | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIprojecttemplate> => {
    try {
      if (!Records.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Records',
          Records
        );
      const document = await IprojecttemplateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProjectTemplate._id',
          id
        );

      const reconciledIds = await IprojecttemplateModel.validateRecord(Records);
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

      return await IprojecttemplateModel.getById(id);
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
          'IProjectTemplate.addRecord',
          err
        );
      }
    }
})

SCHEMA.static(
    removeRecord: async (
    id: mongooseTypes.ObjectId,
    Records: (databaseTypes.IRecord | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIprojecttemplate> => {
    try {
      if (!Records.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Records',
          Records
        );
      const document = await IprojecttemplateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProjectTemplate._id',
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

      return await IprojecttemplateModel.getById(id);
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
          'IProjectTemplate.removeRecord',
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


export default mongoose.model('ProjectTemplate', SCHEMA);
