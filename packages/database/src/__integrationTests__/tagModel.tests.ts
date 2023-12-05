// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#TagModel', () => {
  context('test the crud functions of the tag model', () => {
    const mongoConnection = new MongoDbConnection();
    const tagModel = mongoConnection.models.TagModel;
    let tagDocId: ObjectId;
    let tagDocId2: ObjectId;

    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (tagDocId) {
        await tagModel.findByIdAndDelete(tagDocId);
      }

      if (tagDocId2) {
        await tagModel.findByIdAndDelete(tagDocId2);
      }
    });

    it('add a new tag ', async () => {
      const tagInput = JSON.parse(JSON.stringify(mocks.MOCK_TAG));

      const tagDocument = await tagModel.createTag(tagInput);

      assert.isOk(tagDocument);
      assert.strictEqual(Object.keys(tagDocument)[1], Object.keys(tagInput)[1]);

      tagDocId = tagDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a tag', async () => {
      assert.isOk(tagDocId);
      const tag = await tagModel.getTagById(tagDocId);

      assert.isOk(tag);
      assert.strictEqual(tag._id?.toString(), tagDocId.toString());
    });

    it('modify a tag', async () => {
      assert.isOk(tagDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await tagModel.updateTagById(tagDocId, input);
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple tags without a filter', async () => {
      assert.isOk(tagDocId);
      const tagInput = JSON.parse(JSON.stringify(mocks.MOCK_TAG));

      const tagDocument = await tagModel.createTag(tagInput);

      assert.isOk(tagDocument);

      tagDocId2 = tagDocument._id as mongooseTypes.ObjectId;

      const tags = await tagModel.queryTags();
      assert.isArray(tags.results);
      assert.isAtLeast(tags.numberOfItems, 2);
      const expectedDocumentCount = tags.numberOfItems <= tags.itemsPerPage ? tags.numberOfItems : tags.itemsPerPage;
      assert.strictEqual(tags.results.length, expectedDocumentCount);
    });

    it('Get multiple tags with a filter', async () => {
      assert.isOk(tagDocId2);
      const results = await tagModel.queryTags({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(tagDocId2);
      const results = await tagModel.queryTags({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await tagModel.queryTags({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?._id?.toString(), lastId?.toString());
    });

    it('remove a tag', async () => {
      assert.isOk(tagDocId);
      await tagModel.deleteTagById(tagDocId.toString());
      let errored = false;
      try {
        await tagModel.getTagById(tagDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      tagDocId = null as unknown as ObjectId;
    });
  });
});
