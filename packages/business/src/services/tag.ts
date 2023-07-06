import {database as databaseTypes} from '@glyphx/types';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';
import {Types as mongooseTypes} from 'mongoose';

export class TagService {
  public static async getTag(
    tagId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.ITag | null> {
    try {
      const id =
        tagId instanceof mongooseTypes.ObjectId
          ? tagId
          : new mongooseTypes.ObjectId(tagId);
      const tag = await mongoDbConnection.models.TagModel.getTagById(id);
      return tag;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the tag. See the inner error for additional details',
          'tag',
          'getTag',
          {tagId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}
