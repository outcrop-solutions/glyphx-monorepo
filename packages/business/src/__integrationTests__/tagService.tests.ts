import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {databaseTypes} from 'types';
import {tagService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const INPUT_TAG = {
  createdAt: new Date(),
  updatedAt: new Date(),
  workspaces: [],
  templates: [],
  projects: [],
  value: 'tagValue',
};

describe('#TagService', () => {
  const mongoConnection = new MongoDbConnection();

  context('test the functions of the tag service', () => {
    let tagId: ObjectId;
    // let tagDocument;

    before(async () => {
      await mongoConnection.init();
      const tagModel = mongoConnection.models.TagModel;

      await tagModel.createTag(INPUT_TAG as databaseTypes.ITag);

      const savedTagDocument = await tagModel
        .findOne({value: INPUT_TAG.value})
        .lean();
      tagId = savedTagDocument?._id as mongooseTypes.ObjectId;

      //   tagDocument = savedTagDocument;

      assert.isOk(tagId);
    });

    after(async () => {
      const tagModel = mongoConnection.models.TagModel;
      await tagModel.findByIdAndDelete(tagId);

      if (tagId) {
        await tagModel.findByIdAndDelete(tagId);
      }
    });

    it('will retreive our tag from the database', async () => {
      const tag = await tagService.getTag(tagId);
      assert.isOk(tag);

      assert.strictEqual(tag?.value, INPUT_TAG.value);
    });
  });
});
