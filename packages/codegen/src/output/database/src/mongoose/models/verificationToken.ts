// THIS CODE WAS AUTOMATICALLY GENERATED
import {IQueryResult, databaseTypes} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from 'core';
import {
  IVerificationTokenDocument,
  IVerificationTokenCreateInput,
  IVerificationTokenStaticMethods,
  IVerificationTokenMethods,
} from '../interfaces';

const SCHEMA = new Schema<
  IVerificationTokenDocument,
  IVerificationTokenStaticMethods,
  IVerificationTokenMethods
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
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  identifier: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: false,
    default:
      //istanbul ignore next
      () => new Date(),
  },
});

SCHEMA.static(
  'verificationTokenIdExists',
  async (verificationTokenId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await VERIFICATIONTOKEN_MODEL.findById(
        verificationTokenId,
        ['_id']
      );
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the verificationToken.  See the inner error for additional information',
        'mongoDb',
        'verificationTokenIdExists',
        {_id: verificationTokenId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allVerificationTokenIdsExist',
  async (verificationTokenIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await VERIFICATIONTOKEN_MODEL.find(
        {_id: {$in: verificationTokenIds}},
        ['_id']
      )) as {_id: mongooseTypes.ObjectId}[];

      verificationTokenIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more verificationTokenIds cannot be found in the database.',
          'verificationToken._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the verificationTokenIds.  See the inner error for additional information',
          'mongoDb',
          'allVerificationTokenIdsExists',
          {verificationTokenIds: verificationTokenIds},
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
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a verificationToken with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (verificationToken.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: verificationToken.createdAt}
      );
    if (verificationToken.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: verificationToken.updatedAt}
      );
    if ((verificationToken as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The verificationToken._id is immutable and cannot be changed',
        {_id: (verificationToken as Record<string, unknown>)['_id']}
      );
  }
);

// CREATE
SCHEMA.static(
  'createVerificationToken',
  async (
    input: IVerificationTokenCreateInput
  ): Promise<databaseTypes.IVerificationToken> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IVerificationTokenDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        identifier: input.identifier,
        token: input.token,
        expires: input.expires,
      };
      try {
        await VERIFICATIONTOKEN_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IVerificationTokenDocument',
          resolvedInput,
          err
        );
      }
      const verificationTokenDocument = (
        await VERIFICATIONTOKEN_MODEL.create([resolvedInput], {
          validateBeforeSave: false,
        })
      )[0];
      id = verificationTokenDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the verificationToken.  See the inner error for additional details',
          'mongoDb',
          'addVerificationToken',
          {},
          err
        );
      }
    }
    if (id) return await VERIFICATIONTOKEN_MODEL.getVerificationTokenById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the verificationToken may not have been created.  I have no other information to provide.'
      );
  }
);

// READ
SCHEMA.static(
  'getVerificationTokenById',
  async (verificationTokenId: mongooseTypes.ObjectId) => {
    try {
      const verificationTokenDocument = (await VERIFICATIONTOKEN_MODEL.findById(
        verificationTokenId
      ).lean()) as databaseTypes.IVerificationToken;
      if (!verificationTokenDocument) {
        throw new error.DataNotFoundError(
          `Could not find a verificationToken with the _id: ${verificationTokenId}`,
          'verificationToken_id',
          verificationTokenId
        );
      }
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      delete (verificationTokenDocument as any)['__v'];

      return verificationTokenDocument;
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while getting the project.  See the inner error for additional information',
          'mongoDb',
          'getVerificationTokenById',
          err
        );
    }
  }
);

SCHEMA.static(
  'queryVerificationTokens',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await VERIFICATIONTOKEN_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find verificationtokens with the filter: ${filter}`,
          'queryVerificationTokens',
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

      const verificationTokenDocuments = (await VERIFICATIONTOKEN_MODEL.find(
        filter,
        null,
        {
          skip: skip,
          limit: itemsPerPage,
        }
      ).lean()) as databaseTypes.IVerificationToken[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      verificationTokenDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
      });

      const retval: IQueryResult<databaseTypes.IVerificationToken> = {
        results: verificationTokenDocuments,
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
          'An unexpected error occurred while getting the verificationTokens.  See the inner error for additional information',
          'mongoDb',
          'queryVerificationTokens',
          err
        );
    }
  }
);

// UPDATE
SCHEMA.static(
  'updateVerificationTokenWithFilter',
  async (
    filter: Record<string, unknown>,
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<void> => {
    try {
      await VERIFICATIONTOKEN_MODEL.validateUpdateObject(verificationToken);
      const updateDate = new Date();
      const transformedObject: Partial<IVerificationTokenDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      const updateResult = await VERIFICATIONTOKEN_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No verificationToken document with filter: ${filter} was found',
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
          'update verificationToken',
          {filter: filter, verificationToken: verificationToken},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateVerificationTokenById',
  async (
    verificationTokenId: mongooseTypes.ObjectId,
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<databaseTypes.IVerificationToken> => {
    await VERIFICATIONTOKEN_MODEL.updateVerificationTokenWithFilter(
      {_id: verificationTokenId},
      verificationToken
    );
    return await VERIFICATIONTOKEN_MODEL.getVerificationTokenById(
      verificationTokenId
    );
  }
);

// DELETE
SCHEMA.static(
  'deleteVerificationTokenById',
  async (verificationTokenId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await VERIFICATIONTOKEN_MODEL.deleteOne({
        _id: verificationTokenId,
      });
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A verificationToken with a _id: ${verificationTokenId} was not found in the database`,
          '_id',
          verificationTokenId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the verificationToken from the database. The verificationToken may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete verificationToken',
          {_id: verificationTokenId},
          err
        );
    }
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['verificationToken'];

const VERIFICATIONTOKEN_MODEL = model<
  IVerificationTokenDocument,
  IVerificationTokenStaticMethods
>('verificationToken', SCHEMA);

export {VERIFICATIONTOKEN_MODEL as VerificationTokenModel};
