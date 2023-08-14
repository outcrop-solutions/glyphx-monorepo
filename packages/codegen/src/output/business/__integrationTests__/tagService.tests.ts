// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_TAG} from '../mocks';
import {tagService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_TAG);

describe('#TagService', () => {
  context('test the functions of the tag service', () => {
    const mongoConnection = new MongoDbConnection();
    const tagModel = mongoConnection.models.TagModel;
    let tagId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const tagDocument = await tagModel.createTag(
        MOCK_TAG as unknown as databaseTypes.ITag
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

      assert.strictEqual(tag?.name, MOCK_TAG.name);
    });

    it('will update our tag', async () => {
      assert.isOk(tagId);
      const updatedTag = await tagService.updateTag(tagId, {
        [propKeys]: generateDataFromType(MOCK),
      });
      assert.strictEqual(updatedTag.name, INPUT_PROJECT_NAME);

      const savedTag = await tagService.getTag(tagId);

      assert.strictEqual(savedTag?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our tag', async () => {
      assert.isOk(tagId);
      const updatedTag = await tagService.deleteTag(tagId);
      assert.strictEqual(updatedTag[propKeys[0]], propKeys[0]);

      const savedTag = await tagService.getTag(tagId);

      assert.isOk(savedTag?.deletedAt);
    });
  });
});
