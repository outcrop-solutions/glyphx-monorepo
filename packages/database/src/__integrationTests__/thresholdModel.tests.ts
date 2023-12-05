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

describe('#ThresholdModel', () => {
  context('test the crud functions of the threshold model', () => {
    const mongoConnection = new MongoDbConnection();
    const thresholdModel = mongoConnection.models.ThresholdModel;
    let thresholdDocId: ObjectId;
    let thresholdDocId2: ObjectId;

    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (thresholdDocId) {
        await thresholdModel.findByIdAndDelete(thresholdDocId);
      }

      if (thresholdDocId2) {
        await thresholdModel.findByIdAndDelete(thresholdDocId2);
      }
    });

    it('add a new threshold ', async () => {
      const thresholdInput = JSON.parse(JSON.stringify(mocks.MOCK_THRESHOLD));

      const thresholdDocument = await thresholdModel.createThreshold(thresholdInput);

      assert.isOk(thresholdDocument);
      assert.strictEqual(Object.keys(thresholdDocument)[1], Object.keys(thresholdInput)[1]);

      thresholdDocId = thresholdDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a threshold', async () => {
      assert.isOk(thresholdDocId);
      const threshold = await thresholdModel.getThresholdById(thresholdDocId);

      assert.isOk(threshold);
      assert.strictEqual(threshold._id?.toString(), thresholdDocId.toString());
    });

    it('modify a threshold', async () => {
      assert.isOk(thresholdDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await thresholdModel.updateThresholdById(thresholdDocId, input);
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple thresholds without a filter', async () => {
      assert.isOk(thresholdDocId);
      const thresholdInput = JSON.parse(JSON.stringify(mocks.MOCK_THRESHOLD));

      const thresholdDocument = await thresholdModel.createThreshold(thresholdInput);

      assert.isOk(thresholdDocument);

      thresholdDocId2 = thresholdDocument._id as mongooseTypes.ObjectId;

      const thresholds = await thresholdModel.queryThresholds();
      assert.isArray(thresholds.results);
      assert.isAtLeast(thresholds.numberOfItems, 2);
      const expectedDocumentCount =
        thresholds.numberOfItems <= thresholds.itemsPerPage ? thresholds.numberOfItems : thresholds.itemsPerPage;
      assert.strictEqual(thresholds.results.length, expectedDocumentCount);
    });

    it('Get multiple thresholds with a filter', async () => {
      assert.isOk(thresholdDocId2);
      const results = await thresholdModel.queryThresholds({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(thresholdDocId2);
      const results = await thresholdModel.queryThresholds({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await thresholdModel.queryThresholds({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?._id?.toString(), lastId?.toString());
    });

    it('remove a threshold', async () => {
      assert.isOk(thresholdDocId);
      await thresholdModel.deleteThresholdById(thresholdDocId.toString());
      let errored = false;
      try {
        await thresholdModel.getThresholdById(thresholdDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      thresholdDocId = null as unknown as ObjectId;
    });
  });
});
