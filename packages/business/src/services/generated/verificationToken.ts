// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IVerificationTokenCreateInput} from 'database/src/mongoose/interfaces';

export class VerificationTokenService {
  public static async getVerificationToken(
    verificationTokenId: string
  ): Promise<databaseTypes.IVerificationToken | null> {
    try {
      const verificationToken =
        await mongoDbConnection.models.VerificationTokenModel.getVerificationTokenById(verificationTokenId);
      return verificationToken;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the verificationToken. See the inner error for additional details',
          'verificationToken',
          'getVerificationToken',
          {id: verificationTokenId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getVerificationTokens(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IVerificationToken[] | null> {
    try {
      const verificationTokens = await mongoDbConnection.models.VerificationTokenModel.queryVerificationTokens(filter);
      return verificationTokens?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting verificationTokens. See the inner error for additional details',
          'verificationTokens',
          'getVerificationTokens',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createVerificationToken(
    data: Partial<databaseTypes.IVerificationToken>
  ): Promise<databaseTypes.IVerificationToken> {
    try {
      // create verificationToken
      const verificationToken = await mongoDbConnection.models.VerificationTokenModel.createVerificationToken(
        data as IVerificationTokenCreateInput
      );

      return verificationToken;
    } catch (err: any) {
      if (
        err instanceof error.InvalidOperationError ||
        err instanceof error.InvalidArgumentError ||
        err instanceof error.DataValidationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while creating the verificationToken. See the inner error for additional details',
          'verificationToken',
          'createVerificationToken',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateVerificationToken(
    verificationTokenId: string,
    data: Partial<Omit<databaseTypes.IVerificationToken, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IVerificationToken> {
    try {
      const verificationToken = await mongoDbConnection.models.VerificationTokenModel.updateVerificationTokenById(
        verificationTokenId,
        {
          ...data,
        }
      );
      return verificationToken;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateVerificationToken',
          {verificationTokenId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteVerificationToken(verificationTokenId: string): Promise<databaseTypes.IVerificationToken> {
    try {
      const verificationToken = await mongoDbConnection.models.VerificationTokenModel.updateVerificationTokenById(
        verificationTokenId,
        {
          deletedAt: new Date(),
        }
      );
      return verificationToken;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateVerificationToken',
          {verificationTokenId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
