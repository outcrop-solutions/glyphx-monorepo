// THIS CODE WAS AUTOMATICALLY GENERATED
import {IQueryResult, databaseTypes} from 'types';
import {DBFormatter} from '../../lib/format';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from 'core';
import {IThresholdDocument, IThresholdCreateInput, IThresholdStaticMethods, IThresholdMethods} from '../interfaces';

const SCHEMA = new Schema<IThresholdDocument, IThresholdStaticMethods, IThresholdMethods>({
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
  name: {
    type: String,
    required: true,
  },
  actionType: {
    type: String,
    required: false,
    enum: databaseTypes.ACTION_TYPE,
  },
  actionPayload: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
  value: {
    type: Number,
    required: false,
  },
  operator: {
    type: String,
    required: false,
    enum: databaseTypes.THRESHOLD_OPERATOR,
  },
});

SCHEMA.static('thresholdIdExists', async (thresholdId: mongooseTypes.ObjectId): Promise<boolean> => {
  let retval = false;
  try {
    const result = await THRESHOLD_MODEL.findById(thresholdId, ['_id']);
    if (result) retval = true;
  } catch (err) {
    throw new error.DatabaseOperationError(
      'an unexpected error occurred while trying to find the threshold.  See the inner error for additional information',
      'mongoDb',
      'thresholdIdExists',
      {_id: thresholdId},
      err
    );
  }
  return retval;
});

SCHEMA.static('allThresholdIdsExist', async (thresholdIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await THRESHOLD_MODEL.find({_id: {$in: thresholdIds}}, ['_id'])) as {
      _id: mongooseTypes.ObjectId;
    }[];

    thresholdIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
    });

    if (notFoundIds.length) {
      throw new error.DataNotFoundError(
        'One or more thresholdIds cannot be found in the database.',
        'threshold._id',
        notFoundIds
      );
    }
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the thresholdIds.  See the inner error for additional information',
        'mongoDb',
        'allThresholdIdsExists',
        {thresholdIds: thresholdIds},
        err
      );
    }
  }
  return true;
});

SCHEMA.static(
  'validateUpdateObject',
  async (threshold: Omit<Partial<databaseTypes.IThreshold>, '_id'>): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a threshold with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (threshold.createdAt)
      throw new error.InvalidOperationError('The createdAt date is set internally and cannot be altered externally', {
        createdAt: threshold.createdAt,
      });
    if (threshold.updatedAt)
      throw new error.InvalidOperationError('The updatedAt date is set internally and cannot be altered externally', {
        updatedAt: threshold.updatedAt,
      });
    if ((threshold as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError('The threshold._id is immutable and cannot be changed', {
        _id: (threshold as Record<string, unknown>)['_id'],
      });
  }
);

// CREATE
SCHEMA.static('createThreshold', async (input: IThresholdCreateInput): Promise<databaseTypes.IThreshold> => {
  let id: undefined | mongooseTypes.ObjectId = undefined;

  try {
    const createDate = new Date();

    //istanbul ignore next
    const resolvedInput: IThresholdDocument = {
      createdAt: createDate,
      updatedAt: createDate,
      id: input.id,
      name: input.name,
      actionType: input.actionType,
      actionPayload: input.actionPayload,
      value: input.value,
      operator: input.operator,
    };
    try {
      await THRESHOLD_MODEL.validate(resolvedInput);
    } catch (err) {
      throw new error.DataValidationError(
        'An error occurred while validating the document before creating it.  See the inner error for additional information',
        'IThresholdDocument',
        resolvedInput,
        err
      );
    }
    const thresholdDocument = (await THRESHOLD_MODEL.create([resolvedInput], {validateBeforeSave: false}))[0];
    id = thresholdDocument._id;
  } catch (err) {
    if (err instanceof error.DataValidationError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'An Unexpected Error occurred while adding the threshold.  See the inner error for additional details',
        'mongoDb',
        'addThreshold',
        {},
        err
      );
    }
  }
  if (id) return await THRESHOLD_MODEL.getThresholdById(id.toString());
  else
    throw new error.UnexpectedError(
      'An unexpected error has occurred and the threshold may not have been created.  I have no other information to provide.'
    );
});

// READ
SCHEMA.static('getThresholdById', async (thresholdId: string) => {
  try {
    const thresholdDocument = (await THRESHOLD_MODEL.findById(thresholdId)
      .populate('actionType')
      .populate('actionPayload')
      .populate('operator')
      .lean()) as databaseTypes.IThreshold;
    if (!thresholdDocument) {
      throw new error.DataNotFoundError(
        `Could not find a threshold with the _id: ${thresholdId}`,
        'threshold_id',
        thresholdId
      );
    }
    const format = new DBFormatter();
    return format.toJS(thresholdDocument);
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getThresholdById',
        err
      );
  }
});

SCHEMA.static('queryThresholds', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
  try {
    const count = await THRESHOLD_MODEL.count(filter);

    if (!count) {
      throw new error.DataNotFoundError(
        `Could not find thresholds with the filter: ${filter}`,
        'queryThresholds',
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

    const thresholdDocuments = (await THRESHOLD_MODEL.find(filter, null, {
      skip: skip,
      limit: itemsPerPage,
    })
      .populate('actionType')
      .populate('actionPayload')
      .populate('operator')
      .lean()) as databaseTypes.IThreshold[];

    const format = new DBFormatter();
    const thresholds = thresholdDocuments?.map((doc: any) => {
      return format.toJS(doc);
    });

    const retval: IQueryResult<databaseTypes.IThreshold> = {
      results: thresholds as unknown as databaseTypes.IThreshold[],
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the thresholds.  See the inner error for additional information',
        'mongoDb',
        'queryThresholds',
        err
      );
  }
});

// UPDATE
SCHEMA.static(
  'updateThresholdWithFilter',
  async (filter: Record<string, unknown>, threshold: Omit<Partial<databaseTypes.IThreshold>, '_id'>): Promise<void> => {
    try {
      await THRESHOLD_MODEL.validateUpdateObject(threshold);
      const updateDate = new Date();
      const transformedObject: Partial<IThresholdDocument> & Record<string, unknown> = {updatedAt: updateDate};
      const updateResult = await THRESHOLD_MODEL.updateOne(filter, transformedObject);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No threshold document with filter: ${filter} was found',
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
          'update threshold',
          {filter: filter, threshold: threshold},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateThresholdById',
  async (
    thresholdId: string,
    threshold: Omit<Partial<databaseTypes.IThreshold>, '_id'>
  ): Promise<databaseTypes.IThreshold> => {
    await THRESHOLD_MODEL.updateThresholdWithFilter({_id: thresholdId}, threshold);
    return await THRESHOLD_MODEL.getThresholdById(thresholdId);
  }
);

// DELETE
SCHEMA.static('deleteThresholdById', async (thresholdId: string): Promise<void> => {
  try {
    const results = await THRESHOLD_MODEL.deleteOne({_id: thresholdId});
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `A threshold with a _id: ${thresholdId} was not found in the database`,
        '_id',
        thresholdId
      );
  } catch (err) {
    if (err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while deleteing the threshold from the database. The threshold may still exist.  See the inner error for additional information',
        'mongoDb',
        'delete threshold',
        {_id: thresholdId},
        err
      );
  }
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['threshold'];

const THRESHOLD_MODEL = model<IThresholdDocument, IThresholdStaticMethods>('threshold', SCHEMA);

export {THRESHOLD_MODEL as ThresholdModel};
