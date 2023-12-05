// THIS CODE WAS AUTOMATICALLY GENERATED
import {IQueryResult, databaseTypes} from 'types';
import {DBFormatter} from '../../lib/format';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from 'core';
import {IPresenceDocument, IPresenceCreateInput, IPresenceStaticMethods, IPresenceMethods} from '../interfaces';
// eslint-disable-next-line import/no-duplicates
import {cursorSchema} from '../schemas';
// eslint-disable-next-line import/no-duplicates
import {cameraSchema} from '../schemas';
import {ModelConfigModel} from './modelConfig';

const SCHEMA = new Schema<IPresenceDocument, IPresenceStaticMethods, IPresenceMethods>({
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
  cursor: {
    type: cursorSchema,
    required: false,
    default: {},
  },
  camera: {
    type: cameraSchema,
    required: false,
    default: {},
  },
  config: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'modelconfig',
  },
});

SCHEMA.static('presenceIdExists', async (presenceId: mongooseTypes.ObjectId): Promise<boolean> => {
  let retval = false;
  try {
    const result = await PRESENCE_MODEL.findById(presenceId, ['_id']);
    if (result) retval = true;
  } catch (err) {
    throw new error.DatabaseOperationError(
      'an unexpected error occurred while trying to find the presence.  See the inner error for additional information',
      'mongoDb',
      'presenceIdExists',
      {_id: presenceId},
      err
    );
  }
  return retval;
});

SCHEMA.static('allPresenceIdsExist', async (presenceIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await PRESENCE_MODEL.find({_id: {$in: presenceIds}}, ['_id'])) as {_id: mongooseTypes.ObjectId}[];

    presenceIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
    });

    if (notFoundIds.length) {
      throw new error.DataNotFoundError(
        'One or more presenceIds cannot be found in the database.',
        'presence._id',
        notFoundIds
      );
    }
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the presenceIds.  See the inner error for additional information',
        'mongoDb',
        'allPresenceIdsExists',
        {presenceIds: presenceIds},
        err
      );
    }
  }
  return true;
});

SCHEMA.static(
  'validateUpdateObject',
  async (presence: Omit<Partial<databaseTypes.IPresence>, '_id'>): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a presence with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (presence.config)
      tasks.push(
        idValidator(presence.config._id as mongooseTypes.ObjectId, 'ModelConfig', ModelConfigModel.modelConfigIdExists)
      );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (presence.createdAt)
      throw new error.InvalidOperationError('The createdAt date is set internally and cannot be altered externally', {
        createdAt: presence.createdAt,
      });
    if (presence.updatedAt)
      throw new error.InvalidOperationError('The updatedAt date is set internally and cannot be altered externally', {
        updatedAt: presence.updatedAt,
      });
    if ((presence as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError('The presence._id is immutable and cannot be changed', {
        _id: (presence as Record<string, unknown>)['_id'],
      });
  }
);

// CREATE
SCHEMA.static('createPresence', async (input: IPresenceCreateInput): Promise<databaseTypes.IPresence> => {
  let id: undefined | mongooseTypes.ObjectId = undefined;

  try {
    const [config] = await Promise.all([PRESENCE_MODEL.validateConfig(input.config)]);

    const createDate = new Date();

    //istanbul ignore next
    const resolvedInput: IPresenceDocument = {
      createdAt: createDate,
      updatedAt: createDate,
      id: input.id,
      cursor: input.cursor,
      camera: input.camera,
      config: config,
    };
    try {
      await PRESENCE_MODEL.validate(resolvedInput);
    } catch (err) {
      throw new error.DataValidationError(
        'An error occurred while validating the document before creating it.  See the inner error for additional information',
        'IPresenceDocument',
        resolvedInput,
        err
      );
    }
    const presenceDocument = (await PRESENCE_MODEL.create([resolvedInput], {validateBeforeSave: false}))[0];
    id = presenceDocument._id;
  } catch (err) {
    if (err instanceof error.DataValidationError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'An Unexpected Error occurred while adding the presence.  See the inner error for additional details',
        'mongoDb',
        'addPresence',
        {},
        err
      );
    }
  }
  if (id) return await PRESENCE_MODEL.getPresenceById(id.toString());
  else
    throw new error.UnexpectedError(
      'An unexpected error has occurred and the presence may not have been created.  I have no other information to provide.'
    );
});

// READ
SCHEMA.static('getPresenceById', async (presenceId: string) => {
  try {
    const presenceDocument = (await PRESENCE_MODEL.findById(presenceId)
      .populate('cursor')
      .populate('camera')
      .populate('config')
      .lean()) as databaseTypes.IPresence;
    if (!presenceDocument) {
      throw new error.DataNotFoundError(
        `Could not find a presence with the _id: ${presenceId}`,
        'presence_id',
        presenceId
      );
    }
    const format = new DBFormatter();
    return format.toJS(presenceDocument);
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getPresenceById',
        err
      );
  }
});

SCHEMA.static('queryPresences', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
  try {
    const count = await PRESENCE_MODEL.count(filter);

    if (!count) {
      throw new error.DataNotFoundError(
        `Could not find presences with the filter: ${filter}`,
        'queryPresences',
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

    const presenceDocuments = (await PRESENCE_MODEL.find(filter, null, {
      skip: skip,
      limit: itemsPerPage,
    })
      .populate('cursor')
      .populate('camera')
      .populate('config')
      .lean()) as databaseTypes.IPresence[];

    const format = new DBFormatter();
    const presences = presenceDocuments?.map((doc: any) => {
      return format.toJS(doc);
    });

    const retval: IQueryResult<databaseTypes.IPresence> = {
      results: presences as unknown as databaseTypes.IPresence[],
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the presences.  See the inner error for additional information',
        'mongoDb',
        'queryPresences',
        err
      );
  }
});

// UPDATE
SCHEMA.static(
  'updatePresenceWithFilter',
  async (filter: Record<string, unknown>, presence: Omit<Partial<databaseTypes.IPresence>, '_id'>): Promise<void> => {
    try {
      await PRESENCE_MODEL.validateUpdateObject(presence);
      const updateDate = new Date();
      const transformedObject: Partial<IPresenceDocument> & Record<string, unknown> = {updatedAt: updateDate};
      for (const key in presence) {
        const value = (presence as Record<string, any>)[key];
        if (key === 'config')
          transformedObject.config =
            value instanceof mongooseTypes.ObjectId ? value : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await PRESENCE_MODEL.updateOne(filter, transformedObject);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError('No presence document with filter: ${filter} was found', 'filter', filter);
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the project with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update presence',
          {filter: filter, presence: presence},
          err
        );
    }
  }
);

SCHEMA.static(
  'updatePresenceById',
  async (
    presenceId: string,
    presence: Omit<Partial<databaseTypes.IPresence>, '_id'>
  ): Promise<databaseTypes.IPresence> => {
    await PRESENCE_MODEL.updatePresenceWithFilter({_id: presenceId}, presence);
    return await PRESENCE_MODEL.getPresenceById(presenceId);
  }
);

// DELETE
SCHEMA.static('deletePresenceById', async (presenceId: string): Promise<void> => {
  try {
    const results = await PRESENCE_MODEL.deleteOne({_id: presenceId});
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `A presence with a _id: ${presenceId} was not found in the database`,
        '_id',
        presenceId
      );
  } catch (err) {
    if (err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while deleteing the presence from the database. The presence may still exist.  See the inner error for additional information',
        'mongoDb',
        'delete presence',
        {_id: presenceId},
        err
      );
  }
});

SCHEMA.static(
  'addConfig',
  async (presenceId: string, config: databaseTypes.IModelConfig | string): Promise<databaseTypes.IPresence> => {
    try {
      if (!config) throw new error.InvalidArgumentError('You must supply at least one id', 'config', config);
      const presenceDocument = await PRESENCE_MODEL.findById(presenceId);

      if (!presenceDocument)
        throw new error.DataNotFoundError('A presenceDocument with _id cannot be found', 'presence._id', presenceId);

      const reconciledId = await PRESENCE_MODEL.validateConfig(config);

      if (presenceDocument.config?.toString() !== reconciledId.toString()) {
        const reconciledId = await PRESENCE_MODEL.validateConfig(config);

        // @ts-ignore
        presenceDocument.config = reconciledId;
        await presenceDocument.save();
      }

      return await PRESENCE_MODEL.getPresenceById(presenceId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the config. See the inner error for additional information',
          'mongoDb',
          'presence.addConfig',
          err
        );
      }
    }
  }
);

SCHEMA.static('removeConfig', async (presenceId: string): Promise<databaseTypes.IPresence> => {
  try {
    const presenceDocument = await PRESENCE_MODEL.findById(presenceId);
    if (!presenceDocument)
      throw new error.DataNotFoundError('A presenceDocument with _id cannot be found', 'presence._id', presenceId);

    // @ts-ignore
    presenceDocument.config = undefined;
    await presenceDocument.save();

    return await PRESENCE_MODEL.getPresenceById(presenceId);
  } catch (err) {
    if (
      err instanceof error.DataNotFoundError ||
      err instanceof error.DataValidationError ||
      err instanceof error.InvalidArgumentError
    )
      throw err;
    else {
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while removing the config. See the inner error for additional information',
        'mongoDb',
        'presence.removeConfig',
        err
      );
    }
  }
});

SCHEMA.static('validateConfig', async (input: databaseTypes.IModelConfig | string): Promise<mongooseTypes.ObjectId> => {
  const configId = typeof input === 'string' ? new mongooseTypes.ObjectId(input) : new mongooseTypes.ObjectId(input.id);

  if (!(await ModelConfigModel.modelConfigIdExists(configId))) {
    throw new error.InvalidArgumentError(`The config: ${configId} does not exist`, 'configId', configId);
  }
  return configId;
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['presence'];

const PRESENCE_MODEL = model<IPresenceDocument, IPresenceStaticMethods>('presence', SCHEMA);

export {PRESENCE_MODEL as PresenceModel};
