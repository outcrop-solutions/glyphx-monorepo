// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks';
import {tagService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_TAG);

describe('#TagService', () => {
  context('test the functions of the tag service', () => {
    const mongoConnection = new MongoDbConnection();
    const tagModel = mongoConnection.models.TagModel;
    let tagId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const tagDocument = await tagModel.createTag(
        // @ts-ignore
        mocks.MOCK_TAG as unknown as databaseTypes.ITag
      );
      tagId = tagDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (tagId) {
        await tagModel.findByIdAndDelete(tagId);
      }
    });

    it('will retreive our tag from the database', async () => {
      const tag = await tagService.getTag(tagId);
      assert.isOk(tag);
    });

    // updates and deletes
    it('will update our tag', async () => {
      assert.isOk(tagId);
      const updatedTag = await tagService.updateTag(tagId, {
        deletedAt: new Date(),
      });
      assert.isOk(updatedTag.deletedAt);

      const savedTag = await tagService.getTag(tagId);

      assert.isOk(savedTag!.deletedAt);
    });
  });
});
