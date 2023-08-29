// THIS CODE WAS AUTOMATICALLY GENERATED
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {
  IModelConfigDocument,
  IModelConfigCreateInput,
  IModelConfigStaticMethods,
  IModelConfigMethods,
} from '../interfaces';
// eslint-disable-next-line import/no-duplicates
import {
  backgroundColorSchema,
  minColorSchema,
  maxColorSchema,
  xAxisColorSchema,
  yAxisColorSchema,
  zAxisColorSchema,
} from '../schemas';

const SCHEMA = new Schema<
  IModelConfigDocument,
  IModelConfigStaticMethods,
  IModelConfigMethods
>({
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
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  current: {
    type: Boolean,
    required: true,
  },
  min_color: {
    type: minColorSchema,
    required: false,
    default: {},
  },
  max_color: {
    type: maxColorSchema,
    required: false,
    default: {},
  },
  background_color: {
    type: backgroundColorSchema,
    required: false,
    default: {},
  },
  x_axis_color: {
    type: xAxisColorSchema,
    required: false,
    default: {},
  },
  y_axis_color: {
    type: yAxisColorSchema,
    required: false,
    default: {},
  },
  z_axis_color: {
    type: zAxisColorSchema,
    required: false,
    default: {},
  },
  grid_cylinder_radius: {
    type: Number,
    required: true,
  },
  grid_cylinder_length: {
    type: Number,
    required: true,
  },
  grid_cone_length: {
    type: Number,
    required: true,
  },
  grid_cone_radius: {
    type: Number,
    required: true,
  },
  glyph_offset: {
    type: Number,
    required: true,
  },
  z_height_ratio: {
    type: Number,
    required: true,
  },
  z_offset: {
    type: Number,
    required: true,
  },
  toggle_grid_lines: {
    type: Boolean,
    required: true,
  },
  toggle_glyph_offset: {
    type: Boolean,
    required: true,
  },
  toggle_z_offset: {
    type: Boolean,
    required: true,
  },
});

SCHEMA.static(
  'modelConfigIdExists',
  async (modelConfigId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await MODELCONFIG_MODEL.findById(modelConfigId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the modelConfig.  See the inner error for additional information',
        'mongoDb',
        'modelConfigIdExists',
        {_id: modelConfigId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allModelConfigIdsExist',
  async (modelConfigIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await MODELCONFIG_MODEL.find(
        {_id: {$in: modelConfigIds}},
        ['_id']
      )) as {_id: mongooseTypes.ObjectId}[];

      modelConfigIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more modelConfigIds cannot be found in the database.',
          'modelConfig._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the modelConfigIds.  See the inner error for additional information',
          'mongoDb',
          'allModelConfigIdsExists',
          {modelConfigIds: modelConfigIds},
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
    modelConfig: Omit<Partial<databaseTypes.IModelConfig>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a modelConfig with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (modelConfig.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: modelConfig.createdAt}
      );
    if (modelConfig.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: modelConfig.updatedAt}
      );
    if ((modelConfig as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The modelConfig._id is immutable and cannot be changed',
        {_id: (modelConfig as Record<string, unknown>)['_id']}
      );
  }
);

// CREATE
SCHEMA.static(
  'createModelConfig',
  async (
    input: IModelConfigCreateInput
  ): Promise<databaseTypes.IModelConfig> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IModelConfigDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        name: input.name,
        current: input.current,
        min_color: input.min_color,
        max_color: input.max_color,
        background_color: input.background_color,
        x_axis_color: input.x_axis_color,
        y_axis_color: input.y_axis_color,
        z_axis_color: input.z_axis_color,
        grid_cylinder_radius: input.grid_cylinder_radius,
        grid_cylinder_length: input.grid_cylinder_length,
        grid_cone_length: input.grid_cone_length,
        grid_cone_radius: input.grid_cone_radius,
        glyph_offset: input.glyph_offset,
        z_height_ratio: input.z_height_ratio,
        z_offset: input.z_offset,
        toggle_grid_lines: input.toggle_grid_lines,
        toggle_glyph_offset: input.toggle_glyph_offset,
        toggle_z_offset: input.toggle_z_offset,
      };
      try {
        await MODELCONFIG_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IModelConfigDocument',
          resolvedInput,
          err
        );
      }
      const modelConfigDocument = (
        await MODELCONFIG_MODEL.create([resolvedInput], {
          validateBeforeSave: false,
        })
      )[0];
      id = modelConfigDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the modelConfig.  See the inner error for additional details',
          'mongoDb',
          'addModelConfig',
          {},
          err
        );
      }
    }
    if (id) return await MODELCONFIG_MODEL.getModelConfigById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the modelConfig may not have been created.  I have no other information to provide.'
      );
  }
);

// READ
SCHEMA.static(
  'getModelConfigById',
  async (modelConfigId: mongooseTypes.ObjectId) => {
    try {
      const modelConfigDocument = (await MODELCONFIG_MODEL.findById(
        modelConfigId
      )
        .populate('min_color')
        .populate('max_color')
        .populate('background_color')
        .populate('x_axis_color')
        .populate('y_axis_color')
        .populate('z_axis_color')
        .lean()) as databaseTypes.IModelConfig;
      if (!modelConfigDocument) {
        throw new error.DataNotFoundError(
          `Could not find a modelConfig with the _id: ${modelConfigId}`,
          'modelConfig_id',
          modelConfigId
        );
      }
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      delete (modelConfigDocument as any)['__v'];

      return modelConfigDocument;
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while getting the project.  See the inner error for additional information',
          'mongoDb',
          'getModelConfigById',
          err
        );
    }
  }
);

SCHEMA.static(
  'queryModelConfigs',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await MODELCONFIG_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find modelconfigs with the filter: ${filter}`,
          'queryModelConfigs',
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

      const modelConfigDocuments = (await MODELCONFIG_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('min_color')
        .populate('max_color')
        .populate('background_color')
        .populate('x_axis_color')
        .populate('y_axis_color')
        .populate('z_axis_color')
        .lean()) as databaseTypes.IModelConfig[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      modelConfigDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
      });

      const retval: IQueryResult<databaseTypes.IModelConfig> = {
        results: modelConfigDocuments,
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
          'An unexpected error occurred while getting the modelConfigs.  See the inner error for additional information',
          'mongoDb',
          'queryModelConfigs',
          err
        );
    }
  }
);

// UPDATE
SCHEMA.static(
  'updateModelConfigWithFilter',
  async (
    filter: Record<string, unknown>,
    modelConfig: Omit<Partial<databaseTypes.IModelConfig>, '_id'>
  ): Promise<void> => {
    try {
      await MODELCONFIG_MODEL.validateUpdateObject(modelConfig);
      const updateDate = new Date();
      const transformedObject: Partial<IModelConfigDocument> &
        Record<string, unknown> = {updatedAt: updateDate};

      for (const key in modelConfig) {
        const value = (modelConfig as Record<string, any>)[key];
        transformedObject[key] = value;
      }

      const updateResult = await MODELCONFIG_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No modelConfig document with filter: ${filter} was found',
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
          'update modelConfig',
          {filter: filter, modelConfig: modelConfig},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateModelConfigById',
  async (
    modelConfigId: mongooseTypes.ObjectId,
    modelConfig: Omit<Partial<databaseTypes.IModelConfig>, '_id'>
  ): Promise<databaseTypes.IModelConfig> => {
    await MODELCONFIG_MODEL.updateModelConfigWithFilter(
      {_id: modelConfigId},
      modelConfig
    );
    return await MODELCONFIG_MODEL.getModelConfigById(modelConfigId);
  }
);

// DELETE
SCHEMA.static(
  'deleteModelConfigById',
  async (modelConfigId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await MODELCONFIG_MODEL.deleteOne({_id: modelConfigId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A modelConfig with a _id: ${modelConfigId} was not found in the database`,
          '_id',
          modelConfigId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the modelConfig from the database. The modelConfig may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete modelConfig',
          {_id: modelConfigId},
          err
        );
    }
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['modelConfig'];

const MODELCONFIG_MODEL = model<
  IModelConfigDocument,
  IModelConfigStaticMethods
>('modelConfig', SCHEMA);

export {MODELCONFIG_MODEL as ModelConfigModel};
