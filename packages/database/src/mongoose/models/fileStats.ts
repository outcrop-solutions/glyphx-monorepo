// THIS CODE WAS AUTOMATICALLY GENERATED
import {IQueryResult, databaseTypes} from 'types';
import {DBFormatter} from '../../lib/format';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from 'core';
import {IFileStatsDocument, IFileStatsCreateInput, IFileStatsStaticMethods, IFileStatsMethods} from '../interfaces';

const SCHEMA = new Schema<IFileStatsDocument, IFileStatsStaticMethods, IFileStatsMethods>({
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
  id: {
    type: String,
    required: false,
  },
  fileName: {
    type: String,
    required: true,
  },
  tableName: {
    type: String,
    required: true,
  },
  numberOfRows: {
    type: Number,
    required: true,
  },
  numberOfColumns: {
    type: Number,
    required: true,
  },
  columns: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'columns',
    },
  ],
  fileSize: {
    type: Number,
    required: true,
  },
  dataGrid: {
    type: Schema.Types.Mixed,
    required: false,
    default: {},
  },
  open: {
    type: Boolean,
    required: false,
  },
  selected: {
    type: Boolean,
    required: false,
  },
});

SCHEMA.static('fileStatsIdExists', async (fileStatsId: mongooseTypes.ObjectId): Promise<boolean> => {
  let retval = false;
  try {
    const result = await FILESTATS_MODEL.findById(fileStatsId, ['_id']);
    if (result) retval = true;
  } catch (err) {
    throw new error.DatabaseOperationError(
      'an unexpected error occurred while trying to find the fileStats.  See the inner error for additional information',
      'mongoDb',
      'fileStatsIdExists',
      {_id: fileStatsId},
      err
    );
  }
  return retval;
});

SCHEMA.static('allFileStatsIdsExist', async (fileStatsIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await FILESTATS_MODEL.find({_id: {$in: fileStatsIds}}, ['_id'])) as {
      _id: mongooseTypes.ObjectId;
    }[];

    fileStatsIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
    });

    if (notFoundIds.length) {
      throw new error.DataNotFoundError(
        'One or more fileStatsIds cannot be found in the database.',
        'fileStats._id',
        notFoundIds
      );
    }
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the fileStatsIds.  See the inner error for additional information',
        'mongoDb',
        'allFileStatIdsExists',
        {fileStatsIds: fileStatsIds},
        err
      );
    }
  }
  return true;
});

SCHEMA.static(
  'validateUpdateObject',
  async (fileStats: Omit<Partial<databaseTypes.IFileStats>, '_id'>): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a fileStats with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (fileStats.createdAt)
      throw new error.InvalidOperationError('The createdAt date is set internally and cannot be altered externally', {
        createdAt: fileStats.createdAt,
      });
    if (fileStats.updatedAt)
      throw new error.InvalidOperationError('The updatedAt date is set internally and cannot be altered externally', {
        updatedAt: fileStats.updatedAt,
      });
    if ((fileStats as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError('The fileStats._id is immutable and cannot be changed', {
        _id: (fileStats as Record<string, unknown>)['_id'],
      });
  }
);

// CREATE
SCHEMA.static('createFileStats', async (input: IFileStatsCreateInput): Promise<databaseTypes.IFileStats> => {
  let id: undefined | mongooseTypes.ObjectId = undefined;

  try {
    const createDate = new Date();

    //istanbul ignore next
    const resolvedInput: IFileStatsDocument = {
      createdAt: createDate,
      updatedAt: createDate,
      id: input.id,
      fileName: input.fileName,
      tableName: input.tableName,
      numberOfRows: input.numberOfRows,
      numberOfColumns: input.numberOfColumns,
      columns: input.columns,
      fileSize: input.fileSize,
      dataGrid: input.dataGrid,
      open: input.open,
      selected: input.selected,
    };
    try {
      await FILESTATS_MODEL.validate(resolvedInput);
    } catch (err) {
      throw new error.DataValidationError(
        'An error occurred while validating the document before creating it.  See the inner error for additional information',
        'IFileStatsDocument',
        resolvedInput,
        err
      );
    }
    const fileStatsDocument = (await FILESTATS_MODEL.create([resolvedInput], {validateBeforeSave: false}))[0];
    id = fileStatsDocument._id;
  } catch (err) {
    if (err instanceof error.DataValidationError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'An Unexpected Error occurred while adding the fileStats.  See the inner error for additional details',
        'mongoDb',
        'addFileStats',
        {},
        err
      );
    }
  }
  if (id) return await FILESTATS_MODEL.getFileStatsById(id);
  else
    throw new error.UnexpectedError(
      'An unexpected error has occurred and the fileStats may not have been created.  I have no other information to provide.'
    );
});

// READ
SCHEMA.static('getFileStatsById', async (fileStatsId: mongooseTypes.ObjectId) => {
  try {
    const fileStatsDocument = (await FILESTATS_MODEL.findById(fileStatsId)
      .populate('columns')
      .populate('dataGrid')
      .lean()) as databaseTypes.IFileStats;
    if (!fileStatsDocument) {
      throw new error.DataNotFoundError(
        `Could not find a fileStats with the _id: ${fileStatsId}`,
        'fileStats_id',
        fileStatsId
      );
    }
    const format = new DBFormatter();
    return format.toJS(fileStatsDocument);
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getFileStatsById',
        err
      );
  }
});

SCHEMA.static('queryFileStats', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
  try {
    const count = await FILESTATS_MODEL.count(filter);

    if (!count) {
      throw new error.DataNotFoundError(
        `Could not find filestats with the filter: ${filter}`,
        'queryFileStats',
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

    const fileStatsDocuments = (await FILESTATS_MODEL.find(filter, null, {
      skip: skip,
      limit: itemsPerPage,
    })
      .populate('columns')
      .populate('dataGrid')
      .lean()) as databaseTypes.IFileStats[];

    const format = new DBFormatter();
    const fileStats = fileStatsDocuments?.map((doc: any) => {
      return format.toJS(doc);
    });

    const retval: IQueryResult<databaseTypes.IFileStats> = {
      results: fileStats as unknown as databaseTypes.IFileStats[],
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the fileStatss.  See the inner error for additional information',
        'mongoDb',
        'queryFileStats',
        err
      );
  }
});

// UPDATE
SCHEMA.static(
  'updateFileStatsWithFilter',
  async (filter: Record<string, unknown>, fileStats: Omit<Partial<databaseTypes.IFileStats>, '_id'>): Promise<void> => {
    try {
      await FILESTATS_MODEL.validateUpdateObject(fileStats);
      const updateDate = new Date();
      const transformedObject: Partial<IFileStatsDocument> & Record<string, unknown> = {updatedAt: updateDate};
      const updateResult = await FILESTATS_MODEL.updateOne(filter, transformedObject);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No fileStats document with filter: ${filter} was found',
          'filter',
          filter
        );
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the project with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update fileStats',
          {filter: filter, fileStats: fileStats},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateFileStatsById',
  async (
    fileStatsId: mongooseTypes.ObjectId,
    fileStats: Omit<Partial<databaseTypes.IFileStats>, '_id'>
  ): Promise<databaseTypes.IFileStats> => {
    await FILESTATS_MODEL.updateFileStatsWithFilter({_id: fileStatsId}, fileStats);
    return await FILESTATS_MODEL.getFileStatsById(fileStatsId);
  }
);

// DELETE
SCHEMA.static('deleteFileStatsById', async (fileStatsId: mongooseTypes.ObjectId): Promise<void> => {
  try {
    const results = await FILESTATS_MODEL.deleteOne({_id: fileStatsId});
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `A fileStats with a _id: ${fileStatsId} was not found in the database`,
        '_id',
        fileStatsId
      );
  } catch (err) {
    if (err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while deleteing the fileStats from the database. The fileStats may still exist.  See the inner error for additional information',
        'mongoDb',
        'delete fileStats',
        {_id: fileStatsId},
        err
      );
  }
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['fileStats'];

const FILESTATS_MODEL = model<IFileStatsDocument, IFileStatsStaticMethods>('fileStats', SCHEMA);

export {FILESTATS_MODEL as FileStatsModel};
