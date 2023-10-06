import {IQueryResult, databaseTypes} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {IVerificationTokenMethods, IVerificationTokenStaticMethods, IVerificationTokenDocument} from '../interfaces';
import {error} from 'core';
import {DBFormatter} from '../../lib/format';

const SCHEMA = new Schema<IVerificationTokenDocument, IVerificationTokenStaticMethods, IVerificationTokenMethods>({
  identifier: {type: String, required: true},
  token: {type: String, required: true},
  expires: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
});

SCHEMA.static('verificationTokenIdExists', async (verificationTokenId: mongooseTypes.ObjectId): Promise<boolean> => {
  let retval = false;
  try {
    const result = await VERIFICATION_TOKEN_MODEL.findById(verificationTokenId, ['_id']);
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
});

SCHEMA.static(
  'allVerificationTokenIdsExist',
  async (verificationTokenIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await VERIFICATION_TOKEN_MODEL.find({_id: {$in: verificationTokenIds}}, ['_id'])) as {
        _id: mongooseTypes.ObjectId;
      }[];

      verificationTokenIds.forEach((id) => {
        if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
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

SCHEMA.static('getVerificationTokenById', async (verificationTokenId: string) => {
  try {
    const verificationTokenDocument = (await VERIFICATION_TOKEN_MODEL.findById(
      verificationTokenId
    ).lean()) as databaseTypes.IVerificationToken;
    if (!verificationTokenDocument) {
      throw new error.DataNotFoundError(
        `Could not find a verificationToken with the _id: ${verificationTokenId}`,
        'verificationToken_id',
        verificationTokenId
      );
    }
    const format = new DBFormatter();
    return format.toJS(verificationTokenDocument);
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the verificationToken.  See the inner error for additional information',
        'mongoDb',
        'getVerificationTokenById',
        err
      );
  }
});

SCHEMA.static('queryVerificationTokens', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
  try {
    const count = await VERIFICATION_TOKEN_MODEL.count(filter);

    if (!count) {
      throw new error.DataNotFoundError(
        `Could not find verification tokens with the filter: ${filter}`,
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

    const verificationTokenDocuments = (await VERIFICATION_TOKEN_MODEL.find(filter, null, {
      skip: skip,
      limit: itemsPerPage,
    }).lean()) as databaseTypes.IVerificationToken[];

    const format = new DBFormatter();
    const tokens = verificationTokenDocuments.map((doc: any) => {
      return format.toJS(doc);
    });

    const retval: IQueryResult<databaseTypes.IVerificationToken> = {
      results: tokens as unknown as databaseTypes.IVerificationToken[],
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while querying the verification tokens.  See the inner error for additional information',
        'mongoDb',
        'queryProjectTemplates',
        err
      );
  }
});

SCHEMA.static(
  'createVerificationToken',
  async (input: Omit<databaseTypes.IVerificationToken, '_id'>): Promise<databaseTypes.IVerificationToken> => {
    const transformedDocument: IVerificationTokenDocument = {
      identifier: input.identifier,
      token: input.token,
      expires: input.expires,
    };

    try {
      await VERIFICATION_TOKEN_MODEL.validate(transformedDocument);
    } catch (err) {
      throw new error.DataValidationError(
        'An error occurred while validating the verificationToken document.  See the inner error for additional details.',
        'verificationToken',
        transformedDocument,
        err
      );
    }

    try {
      const createdDocument = (
        await VERIFICATION_TOKEN_MODEL.create([transformedDocument], {
          validateBeforeSave: false,
        })
      )[0];
      return await VERIFICATION_TOKEN_MODEL.getVerificationTokenById(createdDocument._id.toString());
    } catch (err) {
      throw new error.DatabaseOperationError(
        'An unexpected error occurred wile creating the verificationToken. See the inner error for additional information',
        'mongoDb',
        'create verificationToken',
        input,
        err
      );
    }
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>): Promise<void> => {
    if ((verificationToken as unknown as databaseTypes.IVerificationToken)._id)
      throw new error.InvalidOperationError("A VerificationToken's _id is imutable and cannot be changed", {
        _id: (verificationToken as unknown as databaseTypes.IVerificationToken)._id,
      });
  }
);

SCHEMA.static(
  'updateVerificationTokenWithFilter',
  async (
    filter: Record<string, unknown>,
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<boolean> => {
    await VERIFICATION_TOKEN_MODEL.validateUpdateObject(verificationToken);
    try {
      const transformedVerificationToken: Partial<IVerificationTokenDocument> & Record<string, any> = {};
      for (const key in verificationToken) {
        const value = (verificationToken as Record<string, any>)[key];

        //we only store the user id in our account collection
        transformedVerificationToken[key] = value;
      }
      const updateResult = await VERIFICATION_TOKEN_MODEL.updateOne(filter, transformedVerificationToken);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No verificationToken document with filter: ${filter} was found`,
          'filter',
          filter
        );
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the verificationToken with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update verificationToken',
          {filter: filter, verificationToken: verificationToken},
          err
        );
    }
    return true;
  }
);

SCHEMA.static(
  'updateVerificationTokenById',
  async (
    verificationTokenId: string,
    verificationToken: Omit<Partial<databaseTypes.IVerificationToken>, '_id'>
  ): Promise<databaseTypes.IVerificationToken> => {
    await VERIFICATION_TOKEN_MODEL.updateVerificationTokenWithFilter({_id: verificationTokenId}, verificationToken);
    const retval = await VERIFICATION_TOKEN_MODEL.getVerificationTokenById(verificationTokenId);
    return retval;
  }
);

SCHEMA.static('deleteVerificationTokenById', async (verificationTokenId: string): Promise<void> => {
  try {
    const results = await VERIFICATION_TOKEN_MODEL.deleteOne({
      _id: verificationTokenId,
    });
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `An verificationToken with a _id: ${verificationTokenId} was not found in the database`,
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
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['verificationToken'];

const VERIFICATION_TOKEN_MODEL = model<IVerificationTokenDocument, IVerificationTokenStaticMethods>(
  'verificationToken',
  SCHEMA
);

export {VERIFICATION_TOKEN_MODEL as VerificationTokenModel};
