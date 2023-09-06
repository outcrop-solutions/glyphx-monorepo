import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from '../lib/databaseConnection';
import {Types as mongooseTypes} from 'mongoose';

export class TagService {
  public static async getTag(
    tagId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.ITag | null> {
    try {
      const id =
        tagId instanceof mongooseTypes.ObjectId
          ? tagId
          : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            new mongooseTypes.ObjectId(tagId);
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
