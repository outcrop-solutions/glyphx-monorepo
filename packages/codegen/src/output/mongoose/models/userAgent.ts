import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IUserAgentDocument, IUserAgentCreateInput, IUserAgentStaticMethods, IUserAgentMethods} from '../interfaces';

const SCHEMA = new Schema<IUserAgentDocument, IUserAgentStaticMethods, IUserAgentMethods>({
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
  userAgent: {
    type: String,
    required: false,
      default: false
      },
  platform: {
    type: String,
    required: false,
      default: false
      },
  appName: {
    type: String,
    required: false,
      default: false
      },
  appVersion: {
    type: String,
    required: false,
      default: false
      },
  vendor: {
    type: String,
    required: false,
      default: false
      },
  language: {
    type: String,
    required: false,
      default: false
      },
  cookieEnabled: {
    type: boolean,
    required: false,
      default: false
      }
})

SCHEMA.static(
  'userAgentIdExists',
  async (userAgentId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await USERAGENT_MODEL.findById(userAgentId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the userAgent.  See the inner error for additional information',
        'mongoDb',
        'userAgentIdExists',
        {_id: userAgentId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allUserAgentIdsExist',
  async (userAgentIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await USERAGENT_MODEL.find({_id: {$in: userAgentIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      userAgentIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more userAgentIds cannot be found in the database.',
          'userAgent._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the userAgentIds.  See the inner error for additional information',
          'mongoDb',
          'allUserAgentIdsExists',
          { userAgentIds: userAgentIds},
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
    userAgent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a userAgent with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];


    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (userAgent.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: userAgent.createdAt}
      );
    if (userAgent.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: userAgent.updatedAt}
      );
    if ((userAgent as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The userAgent._id is immutable and cannot be changed',
        {_id: (userAgent as Record<string, unknown>)['_id']}
      );
  }
);

SCHEMA.static(
  'createUserAgent',
  async (input: IUserAgentCreateInput): Promise<databaseTypes.IUserAgent> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [ 
        ] = await Promise.all([
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IUserAgentDocument = {
        createdAt: createDate,
        updatedAt: createDate
          ,userAgent: input.userAgent
          ,platform: input.platform
          ,appName: input.appName
          ,appVersion: input.appVersion
          ,vendor: input.vendor
          ,language: input.language
          ,cookieEnabled: input.cookieEnabled
      };
      try {
        await USERAGENT_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IUserAgentDocument',
          resolvedInput,
          err
        );
      }
      const useragentDocument = (
        await USERAGENT_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = useragentDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the useragent.  See the inner error for additional details',
          'mongoDb',
          'addUserAgent',
          {},
          err
        );
      }
    }
    if (id) return await USERAGENT_MODEL.getUserAgentById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the useragent may not have been created.  I have no other information to provide.'
      );
  }
);

SCHEMA.static('getUserAgentById', async (useragentId: mongooseTypes.ObjectId) => {
  try {
    const useragentDocument = (await USERAGENT_MODEL.findById(useragentId)
      .lean()) as databaseTypes.IUserAgent;
    if (!useragentDocument) {
      throw new error.DataNotFoundError(
        `Could not find a useragent with the _id: ${ useragentId}`,
        'useragent_id',
        useragentId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (useragentDocument as any)['__v'];


    return useragentDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getUserAgentById',
        err
      );
  }
});

SCHEMA.static(
  'updateUserAgentWithFilter',
  async (
    filter: Record<string, unknown>,
    useragent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>
  ): Promise<void> => {
    try {
      await USERAGENT_MODEL.validateUpdateObject(useragent);
      const updateDate = new Date();
      const transformedObject: Partial<IUserAgentDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in useragent) {
        const value = (useragent as Record<string, any>)[key];
        else transformedObject[key] = value;
      }
      const updateResult = await USERAGENT_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No useragent document with filter: ${filter} was found',
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
          'update useragent',
          {filter: filter, useragent : useragent },
          err
        );
    }
  }
);

SCHEMA.static(
  'queryUserAgents',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await USERAGENT_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find useragents with the filter: ${filter}`,
          'queryUserAgents',
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

      const useragentDocuments = (await USERAGENT_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .lean()) as databaseTypes.IUserAgent[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      useragentDocuments.forEach((doc: any) => {
      delete (doc as any)['__v'];
      });

      const retval: IQueryResult<databaseTypes.IUserAgent> = {
        results: useragentDocuments,
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
          'An unexpected error occurred while getting the useragents.  See the inner error for additional information',
          'mongoDb',
          'queryUserAgents',
          err
        );
    }
  }
);

SCHEMA.static(
  'deleteUserAgentById',
  async (useragentId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await USERAGENT_MODEL.deleteOne({_id: useragentId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A useragent with a _id: ${ useragentId} was not found in the database`,
          '_id',
          useragentId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the useragent from the database. The useragent may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete useragent',
          {_id: useragentId},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateUserAgentById',
  async (
    useragentId: mongooseTypes.ObjectId,
    useragent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>
  ): Promise<databaseTypes.IUserAgent> => {
    await USERAGENT_MODEL.updateUserAgentWithFilter({_id: useragentId}, useragent);
    return await USERAGENT_MODEL.getUserAgentById(useragentId);
  }
);




// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['useragent'];

const USERAGENT_MODEL = model<IUserAgentDocument, IUserAgentStaticMethods>(
  'useragent',
  SCHEMA
);

export { USERAGENT_MODEL as UserAgentModel };
;
